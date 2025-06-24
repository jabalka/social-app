"use client";
import axios from "axios";
import React, { useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import DragAndDropArea from "../drag-and-drop-area";
import LeafletMapModal from "../leaflet-map-modal";
import IconWithTooltip from "../icon-with-tooltip";
import { PROJECT_CATEGORIES } from "@/lib/project-categories";
import { useSafeThemeContext } from "@/context/safe-theme-context";

const what3wordsApiKey = process.env.NEXT_PUBLIC_W3W_API_KEY!;

const CATEGORIES = PROJECT_CATEGORIES;

export interface IdeaCreateFormProps {
  open?: boolean;
  onClose?: () => void;
  onIdeaCreated?: () => void;
}

interface IdeaFormFields {
  title: string;
  content: string;
  allowCollab: boolean;
  postcode: string;
  categories: string[];
  images: File[];
}

const defaultValues: IdeaFormFields = {
  title: "",
  content: "",
  allowCollab: true,
  postcode: "",
  categories: [],
  images: [],
};

export const IdeaCreateForm: React.FC<IdeaCreateFormProps> = ({
  open = true,
  onClose,
  onIdeaCreated,
}) => {
    const { theme } = useSafeThemeContext();

  const methods = useForm<IdeaFormFields>({ defaultValues });
  const { handleSubmit, control, setValue, watch, reset } = methods;

  const [loading, setLoading] = useState(false);

  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [what3words, setWhat3words] = useState("");
  const [showMap, setShowMap] = useState(false);

  // For address formatting
  const [addressLines, setAddressLines] = useState<string[]>([]);
  const [addressCoords, setAddressCoords] = useState<string>("");

  // Drag-and-drop state
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);


  // Handle postcode entry
  const handlePostcodeChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setValue("postcode", value);
    if (value.length >= 5) {
      try {
        const res = await axios.get(`https://api.postcodes.io/postcodes/${value}`);
        const { latitude, longitude, admin_district, admin_ward, country, admin_county, region, primary_care_trust, nhs_ha, parliamentary_constituency, admin_ward: ward, admin_district: district, country: cty, street, thoroughfare, } = res.data.result;
        console.log("Postcode data:", res.data.result);
        setLat(latitude);
        setLng(longitude);

        // Build pretty address lines
        setAddressLines([
          res.data.result.thoroughfare || res.data.result.street || res.data.result.parish || "",
          [ward, district].filter(Boolean).join(", "),
          cty || country || "",
        ]);
        setAddressCoords(`${latitude?.toFixed(5)}, ${longitude?.toFixed(5)}`);

        // Get W3W in background
        const w3wRes = await fetch(
          `https://api.what3words.com/v3/convert-to-3wa?coordinates=${latitude},${longitude}&key=${what3wordsApiKey}`,
        );
        const w3wData = await w3wRes.json();
        setWhat3words(w3wData.words || "");
      } catch {
        setAddressLines([]);
        setLat(null);
        setLng(null);
        setWhat3words("");
        setAddressCoords("");
      }
    } else {
      setAddressLines([]);
      setLat(null);
      setLng(null);
      setWhat3words("");
      setAddressCoords("");
    }
  };

  // Map modal pick
  const handleMapPick = async (lat: number, lng: number) => {
    setLat(lat);
    setLng(lng);
    setShowMap(false);

    // Get what3words in background
    try {
      const w3wRes = await fetch(
        `https://api.what3words.com/v3/convert-to-3wa?coordinates=${lat},${lng}&key=${what3wordsApiKey}`,
      );
      const w3wData = await w3wRes.json();
      setWhat3words(w3wData.words || "");
    } catch { /* Ignore */ }

    // Optionally, get postcode/address via postcodes.io
    try {
      const res = await axios.get(
        `https://api.postcodes.io/postcodes?lon=${lng}&lat=${lat}`,
      );
      const pc = res.data.result?.[0]?.postcode;
      setValue("postcode", pc || "");
      setAddressLines([
        res.data.result?.[0]?.thoroughfare || res.data.result?.[0]?.street || res.data.result?.[0]?.parish || "",
        [res.data.result?.[0]?.admin_ward, res.data.result?.[0]?.admin_district].filter(Boolean).join(", "),
        res.data.result?.[0]?.country || "",
      ]);
      setAddressCoords(
        lat && lng ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : ""
      );
    } catch {
      setValue("postcode", "");
      setAddressLines([]);
      setAddressCoords("");
    }
  };

  // Handle form submit (creates the idea, then uploads images)
  const onSubmit = async (data: IdeaFormFields) => {
    setLoading(true);

    // 1. Create the idea (without images first)
    const res = await fetch("/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: data.title,
        content: data.content,
        allowCollab: data.allowCollab,
        latitude: lat,
        longitude: lng,
        postcode: data.postcode,
        what3words,
        categories: data.categories,
      }),
    });

    if (!res.ok) {
      setLoading(false);
      // Optionally show error
      return;
    }

    const result = await res.json();
    const ideaId = result.data?.id;

    // 2. Upload images if any
    if (ideaId && data.images && data.images.length > 0) {
      for (const file of data.images.slice(0, 10)) { // limit of 10 images
        const formData = new FormData();
        formData.append("image", file);
        formData.append("ideaId", ideaId);
        await fetch("/api/ideas/upload-image", { method: "POST", body: formData });
        // Optionally handle response and store URLs
      }
    }

    setLoading(false);
    reset();
    setLat(null);
    setLng(null);
    setWhat3words("");
    setAddressLines([]);
    setAddressCoords("");
    setPreviewUrls([]);
    onIdeaCreated?.();
    onClose?.();
  };

  if (!open) return null;


  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-xl bg-white p-6 shadow">
        {/* Title */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="font-semibold text-sm">Idea Title</label>
            <IconWithTooltip
              theme={theme}
              id="title"
              content="A short, descriptive title for your idea. E.g. 'New Playground in Riverside Park'."
            />
          </div>
          <input
            className="w-full rounded border p-2"
            placeholder="Idea title"
            {...methods.register("title", { required: true })}
          />
        </div>
        {/* Description */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="font-semibold text-sm">Description</label>
            <IconWithTooltip
              theme={theme}
              id="desc"
              content="Briefly explain your idea. What problem does it solve? Why is it important?"
            />
          </div>
          <textarea
            className="w-full rounded border p-2"
            placeholder="Describe your idea..."
            {...methods.register("content", { required: true })}
            rows={4}
          />
        </div>
        {/* Postcode & map */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="font-semibold text-sm">Location (Postcode or pick on map)</label>
            <IconWithTooltip
              id="postcode"
              theme={theme}
              content={
                <>
                  Enter a UK postcode or select a point on the map. <br />
                  This will fill the address and coordinates below.
                </>
              }
            />
          </div>
          <div className="mb-2 flex items-center gap-2">
            <input
              className="w-full rounded border p-2"
              placeholder="Enter UK postcode (auto-fills location)"
              value={watch("postcode")}
              onChange={handlePostcodeChange}
            />
            <button
              type="button"
              onClick={() => setShowMap(true)}
              className="rounded bg-blue-500 px-3 py-2 text-white"
            >
              Pick on Map
            </button>
          </div>
          {addressLines.filter(Boolean).length > 0 && (
            <div className="mb-1 rounded border bg-gray-50 px-3 py-2 text-xs text-gray-700">
              {addressLines[0] && <div className="font-medium">{addressLines[0]}</div>}
              {addressLines[1] && <div>{addressLines[1]}</div>}
              {addressLines[2] && <div className="text-gray-500">{addressLines[2]}</div>}
            </div>
          )}
          {addressCoords && (
            <div className="text-[11px] text-gray-500">
              Coordinates: {addressCoords}
            </div>
          )}
        </div>
        {/* Categories */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="font-semibold text-sm">Categories</label>
            <IconWithTooltip
              id="categories"
              theme={theme}
              content="Select all categories that fit your idea."
            />
          </div>
          <div className="flex flex-wrap gap-4">
            {CATEGORIES.map((cat) => (
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
                          field.onChange([...(field.value || []), cat.id]);
                        } else {
                          field.onChange((field.value || []).filter((id: string) => id !== cat.id));
                        }
                      }}
                    />
                  )}
                />
                {cat.name}
                </label>
            ))}
          </div>
        </div>
        {/* Images upload */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="font-semibold text-sm">Idea Images</label>
            <IconWithTooltip
              theme={theme}
              id="images"
              content="Attach up to 10 images that help explain your idea. Drag and drop or click to browse."
            />
          </div>
          <Controller
            name="images"
            control={control}
            render={({ field }) => (
              <DragAndDropArea
                previewUrls={previewUrls}
                onPreviewUrlsChange={setPreviewUrls}
                {...field}
              />
            )}
          />
        </div>
        {/* Allow Collaboration */}
        <label className="flex items-center gap-2">
          <input type="checkbox" {...methods.register("allowCollab")} />
          Allow collaboration requests
          <IconWithTooltip
            theme={theme}
            id="collab"
            content="If enabled, others can request to join and help with your idea."
          />
        </label>
        {/* Buttons */}
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Share Idea"}
          </button>
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
      <LeafletMapModal
        open={showMap}
        onPick={handleMapPick}
        onClose={() => setShowMap(false)}
        defaultPosition={lat && lng ? [lat, lng] : [51.505, -0.09]}
      />
    </FormProvider>
  );
};

export default IdeaCreateForm;
