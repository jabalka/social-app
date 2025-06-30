"use client";
import { useSafeThemeContext } from "@/context/safe-theme-context";
import { useConfirmation } from "@/hooks/use-confirmation.hook";
import { useInterceptAnchorNavigation } from "@/hooks/use-intercept-anchor-navigation";
import { usePostcodeAddress } from "@/hooks/use-postcode-address.hook";
import { useShowToastOnBrowserBack } from "@/hooks/use-show-toast-on-browser-back";
import { PROJECT_CATEGORIES } from "@/lib/project-categories";
import { ProjectDraft } from "@/models/project";
import { isProjectFormEmpty, ProjectFormFields } from "@/utils/create-project-form.utils";
import { clearDraft, loadDraft, saveDraft } from "@/utils/save-to-draft.utils";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import DragAndDropArea from "./drag-and-drop-area";
import GlowingGreenButton from "./glowing-green-button";
import GlowingPinkButton from "./glowing-pink-button";
import IconWithTooltip from "./icon-with-tooltip";
import LeafletMapModal from "./leaflet-map-modal";
import LocationPostcodePickup from "./location-postode-pick-up";
import RequiredStar from "./required-star";

const DRAFT_KEY = "PROJECT_FORM_DRAFT";

interface Props {
  open?: boolean;
  onSuccess?: () => void;
  onClose?: () => void;
}

const defaultValues: ProjectFormFields = {
  title: "",
  description: "",
  postcode: "",
  latitude: null,
  longitude: null,
  images: [],
  categories: [],
};

export const CreateProjectForm: React.FC<Props> = ({ onSuccess, onClose }) => {
  const { theme } = useSafeThemeContext();
  const { confirm } = useConfirmation();
  const router = useRouter();

  const methods = useForm<ProjectFormFields>({ defaultValues, mode: "onChange" });
  const { handleSubmit, control, setValue, getValues, watch, reset, formState } = methods;
  const {
    lat,
    lng,
    addressLines,
    addressCoords,
    what3words,
    updateByPostcode,
    updateByLatLng,
    resetAddressState,
    setAllAddressState,
  } = usePostcodeAddress();

  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const pendingUrlRef = useRef<string | null>(null);

  // Description Content limitation
  const watchedDescription = watch("description", "");
  const maxDescriptionLength = 15000;
  const descriptionLength = watchedDescription?.length || 0;
  const isDescriptionLimitReached = descriptionLength >= maxDescriptionLength;

  const watchedCategories = watch("categories");

  const isCreateButtonDisabled =
    loading || !formState.isValid || !lat || !lng || !watchedCategories || watchedCategories.length === 0;

  // Save draft state
  const saveDraftState = useCallback(() => {
    const values = getValues();
    if (isProjectFormEmpty(values, lat, lng, addressLines, addressCoords, previewUrls)) {
      clearDraft(DRAFT_KEY);
      return;
    }
    const draft: ProjectDraft = {
      ...values,
      lat,
      lng,
      what3words,
      addressLines,
      addressCoords,
      previewUrls,
    };
    saveDraft<ProjectDraft>(DRAFT_KEY, draft);
  }, [getValues, lat, lng, what3words, addressLines, addressCoords, previewUrls]);

  useInterceptAnchorNavigation(
    (href) => {
      if (loading) return true;
      const values = getValues();
      if (isProjectFormEmpty(values, lat, lng, addressLines, addressCoords, previewUrls)) {
        clearDraft(DRAFT_KEY);
        return true;
      }
      pendingUrlRef.current = href;
      return false;
    },
    async () => {
      const result = await confirm({
        title: "Leave and save as draft?",
        description:
          "Your project will be saved as a draft and you can continue later. Are you sure you want to leave this page?",
        confirmText: "Leave",
        cancelText: "Stay",
      });
      if (result) {
        saveDraftState();
        sessionStorage.setItem("showProjectDraftToast", "true");
        if (pendingUrlRef.current) {
          router.push(pendingUrlRef.current);
          pendingUrlRef.current = null;
        } else {
          router.back();
        }
      } else {
        pendingUrlRef.current = null;
      }
    },
    true,
  );

  useShowToastOnBrowserBack(
    () => !isProjectFormEmpty(getValues(), lat, lng, addressLines, addressCoords, previewUrls),
    () => {
      saveDraftState();
      sessionStorage.setItem("showProjectDraftToast", "true");
    },
  );

  // Postcode & map logic
  const handlePostcodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const postcode = e.target.value;
    setValue("postcode", postcode);

    await updateByPostcode(postcode);
  };

  const handleMapPick = async (lat: number, lng: number) => {
    setShowMap(false);
    const data = await updateByLatLng(lat, lng);
    if (data?.postcode) setValue("postcode", data.postcode, { shouldValidate: true });
  };

  const onSubmit = async (data: ProjectFormFields) => {
    setLoading(true);

    // 1. Create project
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: data.title,
        description: data.description,
        postcode: data.postcode,
        latitude: lat,
        longitude: lng,
        what3words,
        categories: data.categories,
        imageUrls: [],
      }),
    });

    if (!res.ok) {
      setLoading(false);
      return;
    }

    const { projectId } = await res.json();
    const uploadedUrls: string[] = [];

    if (data.images && data.images.length > 0) {
      for (const image of data.images.slice(0, 10)) {
        const formData = new FormData();
        formData.append("image", image);
        formData.append("projectId", projectId);

        const uploadRes = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        });

        if (uploadRes.ok) {
          const json = await uploadRes.json();
          uploadedUrls.push(json.url);
        }
      }
    }

    await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newImageUrls: uploadedUrls, deletedImageUrls: [] }),
    });

    setLoading(false);
    reset();
    resetAddressState();
    setPreviewUrls([]);
    clearDraft(DRAFT_KEY);
    onSuccess?.();
    onClose?.();
  };

  const handleBackButton = async () => {
    const values = getValues();
    if (isProjectFormEmpty(values, lat, lng, addressLines, addressCoords, previewUrls)) {
      clearDraft(DRAFT_KEY);
      onClose?.();
      router.back();
      return;
    }
    const result = await confirm({
      title: "Leave and save as draft?",
      description:
        "Your project will be saved as a draft and you can continue later. Are you sure you want to leave this page?",
      confirmText: "Leave",
      cancelText: "Stay",
    });
    if (result) {
      saveDraftState();
      sessionStorage.setItem("showProjectDraftToast", "true");
      onClose?.();
      router.back();
    }
  };

  // save draft when form changes
  useEffect(() => {
    const subscription = methods.watch(() => {
      const values = getValues();
      if (!isProjectFormEmpty(values, lat, lng, addressLines, addressCoords, previewUrls)) {
        saveDraftState();
        sessionStorage.setItem("showProjectDraftToast", "true");
      }
    });
    return () => subscription.unsubscribe();
  }, [methods, getValues, saveDraftState, lat, lng, addressLines, addressCoords, previewUrls]);

  // checking for existing draft and optionally load it
  useEffect(() => {
    const draft = loadDraft<ProjectDraft>?.(DRAFT_KEY);
    if (
      draft &&
      !isProjectFormEmpty(
        draft,
        draft.lat,
        draft.lng,
        draft.addressLines ?? [],
        draft.addressCoords ?? "",
        draft.previewUrls ?? [],
      )
    ) {
      confirm({
        title: "Resume saved draft?",
        description: "You have a saved draft. Would you like to continue where you left off?",
        confirmText: "Resume",
        cancelText: "Discard",
      }).then((result) => {
        if (result) {
          reset({
            title: draft.title ?? "",
            description: draft.description ?? "",
            postcode: draft.postcode ?? "",
            latitude: draft.latitude ?? null,
            longitude: draft.longitude ?? null,
            categories: draft.categories ?? [],
            images: draft.images ?? [],
          });
          setAllAddressState(
            draft.lat ?? null,
            draft.lng ?? null,
            draft.addressLines ?? [],
            draft.addressCoords ?? "",
            draft.postcode ?? "",
            draft.what3words ?? "",
          );
          setPreviewUrls(draft.previewUrls ?? []);
        } else {
          clearDraft(DRAFT_KEY);
        }
      });
    }
    // eslint-disable-next-line
  }, []);

  // browser tab close/reload
  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (loading) return;
      const values = getValues();
      if (isProjectFormEmpty(values, lat, lng, addressLines, addressCoords, previewUrls)) return;
      e.preventDefault();
      e.returnValue = "";
      saveDraftState();
      sessionStorage.setItem("showProjectDraftToast", "true");
      return "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
    // eslint-disable-next-line
  }, [saveDraftState, loading, formState.isDirty]);

  return (
    <FormProvider {...methods}>
      <div className="rounded-xl bg-gradient-to-b from-[#d9b8a71a] via-[#514e4d45] to-[#00000065]">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-xl p-6 shadow">
          {/* Title */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-semibold">
                Project Title
                <RequiredStar />
              </label>
              <IconWithTooltip
                theme={theme}
                id="title"
                tooltipPlacement="left"
                content="A short, descriptive title for your project."
              />
            </div>
            <input
              className="w-full rounded border p-2"
              placeholder="Project title"
              {...methods.register("title", { required: true })}
            />
          </div>
          {/* Description */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-semibold">
                Description
                <RequiredStar />
              </label>
              <IconWithTooltip
                theme={theme}
                tooltipPlacement="left"
                id="desc"
                content="Briefly explain your project. What problem does it solve? Why is it important?"
              />
            </div>
            <textarea
              className={`w-full rounded border p-2 ${isDescriptionLimitReached ? "border-red-400" : ""}`}
              placeholder="Describe your project..."
              {...methods.register("description", { required: true, maxLength: maxDescriptionLength })}
              rows={4}
              maxLength={maxDescriptionLength}
            />
            <div className="mt-1 flex justify-end text-xs">
              <span className={isDescriptionLimitReached ? "font-semibold text-red-500" : "text-gray-500"}>
                {descriptionLength}/{maxDescriptionLength}
              </span>
            </div>
          </div>
          {/* Postcode & map */}
          <LocationPostcodePickup
            theme={theme}
            watch={watch}
            handlePostcodeChange={handlePostcodeChange}
            setShowMap={setShowMap}
            addressLines={addressLines}
            addressCoords={addressCoords}
            required
          />
          {/* Categories */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-semibold">
                Categories
                <RequiredStar />
              </label>
              <IconWithTooltip
                id="categories"
                tooltipPlacement="left"
                theme={theme}
                content="Select up to 3 categories that fit your project."
              />
            </div>
            <div className="flex flex-wrap gap-4">
              {PROJECT_CATEGORIES.map((cat) => (
                <label key={cat.id} className="flex cursor-pointer items-center gap-2 text-sm">
                  <Controller
                    control={control}
                    name="categories"
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        value={cat.id}
                        checked={field.value?.includes(cat.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            if ((field.value || []).length < 3) {
                              field.onChange([...(field.value || []), cat.id]);
                            }
                          } else {
                            field.onChange((field.value || []).filter((id: string) => id !== cat.id));
                          }
                        }}
                      />
                    )}
                  />
                  {cat.icon && <cat.icon className="h-5 w-5" />}
                  {cat.name}
                </label>
              ))}
            </div>
          </div>
          {/* Images upload */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-semibold">Project Images</label>
              <IconWithTooltip
                theme={theme}
                tooltipPlacement="left"
                id="images"
                content="Attach up to 10 images that help explain your project. Drag and drop or click to browse."
              />
            </div>
            <Controller
              name="images"
              control={control}
              render={({ field }) => (
                <DragAndDropArea
                  theme={theme}
                  previewUrls={previewUrls}
                  onPreviewUrlsChange={setPreviewUrls}
                  {...field}
                />
              )}
            />
          </div>
          {/* Buttons */}
          <div className="flex gap-2">
            <GlowingPinkButton type="button" onClick={handleBackButton}>
              Back
            </GlowingPinkButton>
            <GlowingGreenButton theme={theme} type="submit" disabled={isCreateButtonDisabled} className="px-4 py-2">
              {loading ? "Submitting..." : "Create Project"}
            </GlowingGreenButton>
            <span className="flex items-center text-xs">
              <RequiredStar />
              <span className="ml-1">Required fields</span>
            </span>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      <LeafletMapModal
        open={showMap}
        theme={theme}
        onPick={handleMapPick}
        onClose={() => setShowMap(false)}
        defaultPosition={lat && lng ? [lat, lng] : [51.505, -0.09]}
      />
    </FormProvider>
  );
};

export default CreateProjectForm;
