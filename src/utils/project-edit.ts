import { Project } from "@/models/project.types";

interface UploadedImageResponse {
  url: string;
}

interface SaveProjectParams {
  project: Project;
  isAuthor: boolean;
  isAdmin: boolean;
  titleInput: string;
  descriptionInput: string;
  progressNotes: string;
  progress: number;
  status: string;
  watchedCategories: string[];
  newImages: File[];
  removedImageUrls: string[];
}

export const saveProjectChanges = async ({
  project,
  isAuthor,
  isAdmin,
  titleInput,
  descriptionInput,
  progressNotes,
  progress,
  status,
  watchedCategories,
  newImages,
  removedImageUrls,
}: SaveProjectParams): Promise<void> => {
  console.log("Saving with data:", {
    titleInput,
    descriptionInput,
    progressNotes,
    progress,
    status,
    watchedCategories,
    newImagesCount: newImages.length,
    removedImageUrls,
  });

  // Log original values for comparison
  console.log("Original project values:", {
    title: project.title,
    description: project.description,
    progressNotes: project.progressNotes || "",
    progress: project.progress ?? 0,
    status: project.status,
    categories: project.categories
      .map((c) => c.id)
      .sort()
      .join(","),
  });

  // Prepare the payload with all changes
  const payload: Record<string, unknown> = {};

  // ALWAYS include title and description if user has permission
  if (isAuthor || isAdmin) {
    // Force adding title and description to ensure they're updated
    payload.title = titleInput;
    payload.description = descriptionInput;

    console.log("Title/desc comparison:", {
      titleChanged: titleInput !== project.title,
      descriptionChanged: descriptionInput !== project.description,
    });
  }

  // Progress notes
  if (progressNotes !== (project.progressNotes || "")) {
    payload.progressNotes = progressNotes;
    console.log("Progress notes changed:", {
      new: progressNotes,
      original: project.progressNotes || "",
    });
  }

  // Progress
  if (progress !== (project.progress ?? 0)) {
    payload.progress = progress;
    console.log("Progress changed:", {
      new: progress,
      original: project.progress ?? 0,
    });
  }

  // Status
  if (status !== project.status) {
    payload.status = status;
    console.log("Status changed:", {
      new: status,
      original: project.status,
    });
  }

  // Categories
  const projectCategoryIds = project.categories
    .map((c) => c.id)
    .sort()
    .join(",");
  const newCategoryIds = watchedCategories.sort().join(",");

  if (newCategoryIds !== projectCategoryIds) {
    payload.categories = watchedCategories;
    console.log("Categories changed:", {
      new: newCategoryIds,
      original: projectCategoryIds,
    });
  }

  // CRITICAL FIX: Process images BEFORE sending the payload

  // Remove images
  if (removedImageUrls.length > 0) {
    console.log("Removing images:", removedImageUrls);
    for (const imageUrl of removedImageUrls) {
      try {
        const deleteRes = await fetch("/api/delete-project-image", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: project.id,
            imageUrl: imageUrl,
          }),
        });

        if (!deleteRes.ok) {
          console.error(`Failed to delete image ${imageUrl}: ${deleteRes.statusText}`);
        }
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }

    // CRITICAL FIX: Use the correct field name expected by the API
    payload.deletedImageUrls = removedImageUrls;
  }

  // Upload new images
  const uploadedUrls: string[] = [];
  if (newImages.length > 0) {
    console.log("Uploading new images:", newImages.length);
    for (const file of newImages.slice(0, 10)) {
      const uploadFormData = new FormData();
      uploadFormData.append("image", file);
      uploadFormData.append("projectId", project.id);

      try {
        const res = await fetch("/api/upload-image", {
          method: "POST",
          body: uploadFormData,
        });

        if (res.ok) {
          const data: UploadedImageResponse = await res.json();
          uploadedUrls.push(data.url);
          console.log("Uploaded image:", data.url);
        } else {
          console.error("Failed to upload image:", await res.text());
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }

    if (uploadedUrls.length > 0) {
      payload.newImageUrls = uploadedUrls;
    }
  }

  console.log("Final payload:", payload);

  // Force save even if payload seems empty (for debugging)
  if (Object.keys(payload).length === 0) {
    // Add a dummy field to force an update
    console.log("No changes detected, adding dummy field to force update");
    payload._forceUpdate = Date.now();
  }

  // Send the PATCH request
  try {
    console.log("Sending PATCH request with payload:", payload);
    const patchRes = await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        // CRITICAL FIX: Add cache control headers
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
      },
      body: JSON.stringify(payload),
    });

    try {
      // CRITICAL FIX: Try to parse as JSON first
      const responseData = await patchRes.json();
      console.log("API response (JSON):", patchRes.status, responseData);
    } catch {
      // Fall back to text if not JSON
      const responseText = await patchRes.text();
      console.log("API response (Text):", patchRes.status, responseText);
    }

    if (!patchRes.ok) {
      throw new Error(`Failed to update project: Status ${patchRes.status}`);
    }

    console.log("Project updated successfully");
  } catch (error) {
    console.error("Error during project update:", error);
    throw error;
  }

  return;
};
