"use client";
import { useSafeThemeContext } from "@/context/safe-theme-context";
import { PROJECT_CATEGORIES } from "@/lib/project-categories";
import { IdeaDraft } from "@/models/idea";
import { clearIdeaDraft, loadIdeaDraft, saveIdeaDraft } from "@/utils/idea-draft";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import DragAndDropArea from "../drag-and-drop-area";
import GlowingGreenButton from "../glowing-green-button";
import GlowingPinkButton from "../glowing-pink-button";
import IconWithTooltip from "../icon-with-tooltip";
import LeafletMapModal from "../leaflet-map-modal";
import { useBlockNavigation } from "@/hooks/use-block-navigation.hook";
import LeaveDraftModal from "../prompt-modal";


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
  const router = useRouter();

  const methods = useForm<IdeaFormFields>({ defaultValues });
  const { handleSubmit, control, setValue, getValues, watch, reset, formState } = methods;

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

  // Modal state for leave navigation
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const pendingUrlRef = useRef<string | null>(null);

  // On mount, check for existing draft and optionally load it
  useEffect(() => {
    if (open) {
      const draft = loadIdeaDraft?.();
      if (draft) {
        if (window.confirm("You have a saved draft. Would you like to continue where you left off?")) {
          reset({
            title: draft.title ?? "",
            content: draft.content ?? "",
            allowCollab: draft.allowCollab ?? true,
            postcode: draft.postcode ?? "",
            categories: draft.categories ?? [],
            images: draft.images ?? [],
          });
          setLat(draft.lat ?? null);
          setLng(draft.lng ?? null);
          setAddressLines(draft.addressLines ?? []);
          setAddressCoords(draft.addressCoords ?? "");
          setPreviewUrls(draft.previewUrls ?? []);
        } else {
          clearIdeaDraft?.();
        }
      }
    }
    // eslint-disable-next-line
  }, [open]);

  // Save draft state
  const saveDraftState = useCallback(() => {
    const values = getValues();
    const draft: IdeaDraft = {
      ...values,
      lat,
      lng,
      what3words,
      addressLines,
      addressCoords,
      previewUrls,
    };
    saveIdeaDraft(draft);
  }, [getValues, lat, lng, what3words, addressLines, addressCoords, previewUrls]);

  // Block navigation using the custom hook
  useBlockNavigation(
    (nextUrl) => {
      if (loading) return true;
      // Optionally: only block if formState.isDirty, else allow
      if (!formState.isDirty) return true;
      pendingUrlRef.current = nextUrl;
      setShowLeaveModal(true);
      return false;
    },
    open // enabled only if open
  );

  // Browser tab close/reload
  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (loading) return;
      if (!formState.isDirty) return;
      e.preventDefault();
      e.returnValue = "";
      saveDraftState();
      toast.success("Idea saved as draft. You can resume later.", { id: "draft-toast" });
      return "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [saveDraftState, loading, formState.isDirty]);

  // Modal handlers for leave/confirm navigation
  const handleConfirmLeave = () => {
    saveDraftState();
    setShowLeaveModal(false);
    toast.custom((t) => (
      <div className="bg-[#232324] px-4 py-3 rounded-lg shadow text-white flex items-center gap-2"
           style={{ minWidth: 320 }}>
        <span>Idea saved as draft. You can resume later.</span>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="ml-2 text-gray-300 hover:text-gray-100 text-lg"
          aria-label="Close"
        >×</button>
      </div>
    ), { id: "draft-toast" });
    if (pendingUrlRef.current) {
      router.push(pendingUrlRef.current);
      pendingUrlRef.current = null;
    } else {
      router.back();
    }
  };
  const handleCancelLeave = () => {
    setShowLeaveModal(false);
    pendingUrlRef.current = null;
  };

  // Postcode field handler
  const handlePostcodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue("postcode", value);
    if (value.length >= 5) {
      try {
        const res = await axios.get(`https://api.postcodes.io/postcodes/${value}`);
        const { latitude, longitude, country, admin_ward: ward, admin_district: district, country: cty } = res.data.result;
        setLat(latitude);
        setLng(longitude);
        setAddressLines([
          res.data.result.thoroughfare || res.data.result.street || res.data.result.parish || "",
          [ward, district].filter(Boolean).join(", "),
          cty || country || "",
        ]);
        setAddressCoords(`${latitude?.toFixed(5)}, ${longitude?.toFixed(5)}`);
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

  // Map modal handler
  const handleMapPick = async (lat: number, lng: number) => {
    setLat(lat);
    setLng(lng);
    setShowMap(false);
    try {
      const res = await axios.get(`https://api.postcodes.io/postcodes?lon=${lng}&lat=${lat}`);
      const pc = res.data.result?.[0]?.postcode;
      setValue("postcode", pc || "");
      setAddressLines([
        res.data.result?.[0]?.thoroughfare || res.data.result?.[0]?.street || res.data.result?.[0]?.parish || "",
        [res.data.result?.[0]?.admin_ward, res.data.result?.[0]?.admin_district].filter(Boolean).join(", "),
        res.data.result?.[0]?.country || "",
      ]);
      setAddressCoords(lat && lng ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : "");
    } catch {
      setValue("postcode", "");
      setAddressLines([]);
      setAddressCoords("");
    }
  };

  // Form submit
  const onSubmit = async (data: IdeaFormFields) => {
    setLoading(true);
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
      return;
    }
    const result = await res.json();
    const ideaId = result.data?.id;
    if (ideaId && data.images && data.images.length > 0) {
      for (const file of data.images.slice(0, 10)) {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("ideaId", ideaId);
        await fetch("/api/ideas/upload-image", { method: "POST", body: formData });
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
    clearIdeaDraft();
    onIdeaCreated?.();
    onClose?.();
  };

  // "Back" button triggers the same leave modal
  const handleBack = () => {
    pendingUrlRef.current = null; // means use router.back()
    setShowLeaveModal(true);
  };

  if (!open) return null;

  return (
    <>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-xl bg-white p-6 shadow">
          {/* Title */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-semibold">Idea Title</label>
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
              <label className="text-sm font-semibold">Description</label>
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
              <label className="text-sm font-semibold">Location (Postcode or pick on map)</label>
              <IconWithTooltip
                id="postcode"
                theme={theme}
                content={<>Enter a UK postcode or select a point on the map.<br />This will fill the address and coordinates below.</>}
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
            {addressCoords && <div className="text-[11px] text-gray-500">Coordinates: {addressCoords}</div>}
          </div>
          {/* Categories */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-semibold">Categories</label>
              <IconWithTooltip id="categories" theme={theme} content="Select all categories that fit your idea." />
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
              <label className="text-sm font-semibold">Idea Images</label>
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
                <DragAndDropArea previewUrls={previewUrls} onPreviewUrlsChange={setPreviewUrls} {...field} />
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
            <GlowingPinkButton onClick={handleBack}>Back</GlowingPinkButton>
            <GlowingGreenButton type="submit" disabled={loading} className="px-4 py-2">
              {loading ? "Submitting..." : "Share Idea"}
            </GlowingGreenButton>
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
          theme={theme}
          onPick={handleMapPick}
          onClose={() => setShowMap(false)}
          defaultPosition={lat && lng ? [lat, lng] : [51.505, -0.09]}
        />
      </FormProvider>
      <LeaveDraftModal
        open={showLeaveModal}
        onConfirm={handleConfirmLeave}
        onCancel={handleCancelLeave}
        title="Leave and save as draft?"
        description="Your idea will be saved as a draft and you can continue later. Are you sure you want to leave this page?"
      />
    </>
  );
};

export default IdeaCreateForm;
