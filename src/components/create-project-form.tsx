"use client";

import type React from "react";

import { PROJECT_CATEGORIES } from "@/lib/project-categories";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import DragAndDropArea from "./drag-and-drop-area";
import MapWrapper from "./map-wrapper";

interface FormData {
  title: string;
  description: string;
  postcode: string;
  latitude: number;
  longitude: number;
  images: FileList;
  categories: string[];
}

const CreateProjectForm = () => {
  const { data: session } = useSession();
  const methods = useForm<FormData>({
    defaultValues: {
      title: "",
      description: "",
      postcode: "",
      latitude: 51.505,
      longitude: -0.09,
      images: undefined as unknown as FileList,
      categories: [],
    },
  });
  const { register, handleSubmit, setValue } = methods;
  const [position, setPosition] = useState<[number, number]>([51.505, -0.09]); // London Default Location
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [key, setKey] = useState(Date.now());

  const handleMapClick = async (lat: number, lng: number) => {
    setValue("latitude", lat);
    setValue("longitude", lng);
    setPosition([lat, lng]);

    try {
      const res = await axios.get(`https://api.postcodes.io/postcodes?lon=${lng}&lat=${lat}`);
      const postcode = res.data.result?.[0]?.postcode;
      if (postcode) setValue("postcode", postcode);
    } catch (err) {
      console.error("Reverse geocoding failed", err);
    }
  };

  const handlePostcodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const postcode = e.target.value;
    setValue("postcode", postcode);
    if (postcode.length >= 5) {
      try {
        const res = await axios.get(`https://api.postcodes.io/postcodes/${postcode}`);
        const { latitude, longitude } = res.data.result;
        setValue("latitude", latitude);
        setValue("longitude", longitude);
        setPosition([latitude, longitude]);
      } catch (err) {
        console.error("Postcode lookup failed", err);
      }
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!session?.user) {
      console.error("You must be logged in to submit a project.");
      return;
    }

    console.log("📦 Submitting project with categories:", data.categories);

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: data.title,
        description: data.description,
        postcode: data.postcode,
        latitude: data.latitude,
        longitude: data.longitude,
        categories: data.categories,
        imageUrls: [],
      }),
    });

    if (!res.ok) {
      console.error("Failed to create project");
      return;
    }

    const { projectId } = await res.json();
    const uploadedUrls: string[] = [];

    const images = data.images ? Array.from(data.images).slice(0, 10) : [];

    for (const image of images) {
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
      } else {
        console.error("Image upload failed");
      }
    }

    await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newImageUrls: uploadedUrls, deletedImageUrls: [] }),
    });

    console.log("Project and images uploaded successfully!");
    setKey(Date.now());
  };

  const selected = methods.watch("categories") || [];

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register("title")} placeholder="Title" className="w-full border p-2" />
        <textarea {...register("description")} placeholder="Description" className="h-80 w-full border p-2" />
        <input
          {...register("postcode")}
          placeholder="Enter UK postcode or select on the map"
          onChange={handlePostcodeChange}
          className="w-full border p-2"
        />

        <div>
          <p className="font-medium">Select up to 3 categories that best match project`s topic:</p>
          <div className="flex flex-wrap gap-4">
            {PROJECT_CATEGORIES.map(({ id, name, icon: Icon }) => {
              const isChecked = selected.includes(id);

              return (
                <label key={id} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    value={id}
                    onChange={(e) => {
                      const current = methods.getValues("categories") || [];
                      const updated = e.target.checked
                        ? [...current, id].slice(0, 3)
                        : current.filter((cid) => cid !== id);
                      methods.setValue("categories", updated);
                    }}
                  />
                  <Icon className="h-5 w-5" />
                  <span>{name}</span>
                </label>
              );
            })}
          </div>
        </div>

        <DragAndDropArea name="images" previewUrls={previewUrls} onPreviewUrlsChange={setPreviewUrls} />

        <div className="h-96 w-full overflow-hidden rounded border">
          <MapWrapper key={key} position={position} onPick={handleMapClick} />
        </div>

        <button type="submit" className="rounded bg-orange-500 px-4 py-2 text-white">
          Create Project
        </button>
      </form>
    </FormProvider>
  );
};

export default CreateProjectForm;
