"use client";
import { useSafeThemeContext } from "@/context/safe-theme-context";
import { useConfirmation } from "@/hooks/use-confirmation.hook";
import { useInterceptAnchorNavigation } from "@/hooks/use-intercept-anchor-navigation";
import { usePostcodeAddress } from "@/hooks/use-postcode-address.hook";
import { useShowToastOnBrowserBack } from "@/hooks/use-show-toast-on-browser-back";
import { PROJECT_CATEGORIES } from "@/lib/project-categories";
import { IdeaDraft } from "@/models/idea";
import { IdeaFormFields, isIdeaFormEmpty } from "@/utils/create-idea-form.utils";
import { clearDraft, loadDraft, saveDraft } from "@/utils/save-to-draft.utils";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import DragAndDropArea from "../drag-and-drop-area";
import GlowingGreenButton from "../glowing-green-button";
import GlowingPinkButton from "../glowing-pink-button";
import LeafletMapModal from "../leaflet-map-modal";
import LocationPostcodePickup from "../location-postode-pick-up";
import RequiredStar from "../required-star";
import IconWithTooltip from "../tooltip-with-icon";

const DRAFT_KEY = "IDEA_FORM_DRAFT";
const CATEGORIES = PROJECT_CATEGORIES;

interface IdeaCreateFormProps {
  open?: boolean;
  onClose?: () => void;
  onIdeaCreated?: () => void;
}

const defaultValues: IdeaFormFields = {
  title: "",
  content: "",
  allowCollab: true,
  postcode: "",
  categories: [],
  images: [],
};

export const IdeaCreateForm: React.FC<IdeaCreateFormProps> = ({ open = true, onClose, onIdeaCreated }) => {
  const { theme } = useSafeThemeContext();
  const { confirm } = useConfirmation();
  const router = useRouter();

  const methods = useForm<IdeaFormFields>({ defaultValues, mode: "onChange" });
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
  const watchedCategories = watch("categories");

  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const pendingUrlRef = useRef<string | null>(null);

  // Description Content limitation
  const watchedContent = watch("content", "");
  const maxContentLength = 15000;
  const contentLength = watchedContent?.length || 0;
  const isContentLimitReached = contentLength >= maxContentLength;

  const isCreateButtonDisabled =
    loading || !formState.isValid || !lat || !lng || !watchedCategories || watchedCategories.length === 0;

  // Save draft state
  const saveDraftState = useCallback(() => {
    const values = getValues();
    if (isIdeaFormEmpty(values, lat, lng, addressLines, addressCoords, previewUrls)) {
      clearDraft(DRAFT_KEY);
      return;
    }
    const draft: IdeaDraft = {
      ...values,
      lat,
      lng,
      what3words,
      addressLines,
      addressCoords,
      previewUrls,
    };
    saveDraft(DRAFT_KEY, draft);
  }, [getValues, lat, lng, what3words, addressLines, addressCoords, previewUrls]);

  useInterceptAnchorNavigation(
    (href) => {
      if (loading) return true;
      const values = getValues();
      if (isIdeaFormEmpty(values, lat, lng, addressLines, addressCoords, previewUrls)) {
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
          "Your idea will be saved as a draft and you can continue later. Are you sure you want to leave this page?",
        confirmText: "Leave",
        cancelText: "Stay",
      });
      if (result) {
        saveDraftState();
        sessionStorage.setItem("showIdeaDraftToast", "true");
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
    open,
  );

  useShowToastOnBrowserBack(
    () => !isIdeaFormEmpty(getValues(), lat, lng, addressLines, addressCoords, previewUrls),
    () => {
      saveDraftState();
      sessionStorage.setItem("showIdeaDraftToast", "true");
    },
  );

  const handlePostcodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue("postcode", value);

    await updateByPostcode(value);
  };

  const handleMapPick = async (lat: number, lng: number) => {
    setShowMap(false);
    const data = await updateByLatLng(lat, lng);
    if (data?.postcode) setValue("postcode", data.postcode, { shouldValidate: true });
  };

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
    resetAddressState();
    setPreviewUrls([]);
    clearDraft(DRAFT_KEY);
    onIdeaCreated?.();
    onClose?.();
  };

  const handleBackButton = async () => {
    const values = getValues();
    if (isIdeaFormEmpty(values, lat, lng, addressLines, addressCoords, previewUrls)) {
      clearDraft(DRAFT_KEY);
      onClose?.();
      router.back();
      return;
    }
    const result = await confirm({
      title: "Leave and save as draft?",
      description:
        "Your idea will be saved as a draft and you can continue later. Are you sure you want to leave this page?",
      confirmText: "Leave",
      cancelText: "Stay",
    });
    if (result) {
      saveDraftState();
      sessionStorage.setItem("showIdeaDraftToast", "true");
      onClose?.();
      router.back();
    }
  };

  // save draft when form changes
  useEffect(() => {
    const subscription = methods.watch(() => {
      const values = getValues();
      if (!isIdeaFormEmpty(values, lat, lng, addressLines, addressCoords, previewUrls)) {
        saveDraftState();
        sessionStorage.setItem("showIdeaDraftToast", "true");
      }
    });
    return () => subscription.unsubscribe();
  }, [methods, getValues, saveDraftState, lat, lng, addressLines, addressCoords, previewUrls]);

  // checking for existing draft and optionally load it
  useEffect(() => {
    if (!open) return;
    const draft = loadDraft<IdeaDraft>?.(DRAFT_KEY);
    if (
      draft &&
      !isIdeaFormEmpty(
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
            content: draft.content ?? "",
            allowCollab: draft.allowCollab ?? true,
            postcode: draft.postcode ?? "",
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
          clearDraft?.(DRAFT_KEY);
        }
      });
    }
    // eslint-disable-next-line
  }, [open]);

  // browser tab close/reload
  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (loading) return;
      const values = getValues();
      if (isIdeaFormEmpty(values, lat, lng, addressLines, addressCoords, previewUrls)) return;
      e.preventDefault();
      e.returnValue = "";
      saveDraftState();
      sessionStorage.setItem("showIdeaDraftToast", "true");
      return "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
    // eslint-disable-next-line
  }, [saveDraftState, loading, formState.isDirty]);

  if (!open) return null;

  return (
    <>
      <FormProvider {...methods}>
        <div className="rounded-xl bg-gradient-to-b from-[#d9b8a71a] via-[#514e4d45] to-[#00000065]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-xl p-6 shadow">
            {/* Title */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-sm font-semibold">
                  Idea Title
                  <RequiredStar />
                </label>
                <IconWithTooltip
                  theme={theme}
                  id="title"
                  tooltipPlacement="left"
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
                <label className="text-sm font-semibold">
                  Description
                  <RequiredStar />
                </label>
                <IconWithTooltip
                  theme={theme}
                  tooltipPlacement="left"
                  id="desc"
                  content="Briefly explain your idea. What problem does it solve? Why is it important?"
                />
              </div>
              <textarea
                className={`w-full rounded border p-2 ${isContentLimitReached ? "border-red-400" : ""}`}
                placeholder="Describe your idea..."
                {...methods.register("content", { required: true, maxLength: maxContentLength })}
                rows={4}
                maxLength={maxContentLength}
              />
              <div className="mt-1 flex justify-end text-xs">
                <span className={isContentLimitReached ? "font-semibold text-red-500" : "text-gray-500"}>
                  {contentLength}/{maxContentLength}
                </span>
              </div>
            </div>
            {/* Postcode & map */}
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
                <label className="text-sm font-semibold">Idea Images</label>
                <IconWithTooltip
                  theme={theme}
                  tooltipPlacement="left"
                  id="images"
                  content="Attach up to 10 images that help explain your idea. Drag and drop or click to browse."
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
            {/* Allow Collaboration */}
            <label className="flex items-center gap-2">
              <input type="checkbox" {...methods.register("allowCollab")} />
              Allow collaboration requests
              <IconWithTooltip
                theme={theme}
                tooltipPlacement="left"
                id="collab"
                content="If enabled, others can request to join and help with your idea."
              />
            </label>
            {/* Buttons */}
            <div className="flex gap-2">
              <GlowingPinkButton onClick={handleBackButton}>Back</GlowingPinkButton>
              <GlowingGreenButton theme={theme} type="submit" disabled={isCreateButtonDisabled} className="px-4 py-2">
                {loading ? "Submitting..." : "Share Idea"}
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
    </>
  );
};

export default IdeaCreateForm;
