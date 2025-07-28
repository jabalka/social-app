"use client";
import { useSafeThemeContext } from "@/context/safe-theme-context";
import { useConfirmation } from "@/hooks/use-confirmation.hook";
import { useInterceptAnchorNavigation } from "@/hooks/use-intercept-anchor-navigation";
import { usePostcodeAddress } from "@/hooks/use-postcode-address.hook";
import { useShowToastOnBrowserBack } from "@/hooks/use-show-toast-on-browser-back";
import { IdeaDraft } from "@/models/idea.types";
import { IdeaFormFields, isIdeaFormEmpty } from "@/utils/create-idea-form.utils";
import { clearDraft, loadDraft, saveDraft } from "@/utils/save-to-draft.utils";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Control, FieldValues, FormProvider, useForm } from "react-hook-form";
import LoaderModal from "../common/loader-modal";
import LeafletMapModal from "../leaflet-map-modal";
import LocationPostcodePickup from "../location-postode-pick-up";
import CategorySelector from "../project-category-selector";
import ActionButtons from "../shared/action-buttons";
import DescriptionField from "../shared/description-field";
import CollaborationCheckbox from "./idea-collaboration-check";
import IdeaImageUpload from "./idea-image-upload";
import IdeaTitleField from "./idea-title-field";

const DRAFT_KEY = "IDEA_FORM_DRAFT";

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

  const resetLocation = () => {
    setValue("postcode", "");

    resetAddressState();
  };

  const onSubmit = async (data: IdeaFormFields) => {
    setLoading(true);

    try {
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
        sessionStorage.setItem("showIdeaCreateErrorToast", "An error occurred while creating your idea.");
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

      reset();
      resetAddressState();
      setPreviewUrls([]);
      clearDraft(DRAFT_KEY);

      onIdeaCreated?.();

      sessionStorage.setItem("showIdeaCreateSuccess", `Your idea "${data.title}" has been successfully created!`);
      sessionStorage.setItem("lastCreatedItemId", ideaId);

      if (onClose) {
        onClose();
        setTimeout(() => {
          setLoading(false);
        }, 300);
      } else {
        const destination = "/browse/ideas-list";

        setTimeout(() => {
          router.push(destination);
        }, 300);

        setTimeout(() => {
          setLoading(false);
        }, 800);

        return;
      }
    } catch {
      sessionStorage.setItem("showIdeaCreateErrorToast", "An error occurred while creating your idea.");

      setLoading(false);
    } finally {
      setLoading(false);
    }
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
            <IdeaTitleField theme={theme} />

            <DescriptionField
              formMode={true}
              fieldName="content"
              label="Description"
              tooltipContent="Briefly explain your idea. What problem does it solve? Why is it important?"
              tooltipId="desc"
              required={true}
              maxLength={15000}
              placeholder="Describe your idea..."
              minHeight="120px"
              showCharCount={true}
            />

            <LocationPostcodePickup
              theme={theme}
              watch={watch}
              handlePostcodeChange={handlePostcodeChange}
              setShowMap={setShowMap}
              addressLines={addressLines}
              addressCoords={addressCoords}
              required
              resetLocation={resetLocation}
            />

            <CategorySelector
              mode="create"
              theme={theme}
              control={control as unknown as Control<FieldValues>}
              watchedCategories={watchedCategories}
              required
            />

            <IdeaImageUpload theme={theme} previewUrls={previewUrls} onPreviewUrlsChange={setPreviewUrls} />

            <CollaborationCheckbox theme={theme} />

            <ActionButtons
              cancelText="Back"
              submitText="Share Idea"
              onCancel={handleBackButton}
              loading={loading}
              disabled={isCreateButtonDisabled}
              theme={theme}
              showRequiredIndicator={true}
              showCloseButton={!!onClose}
              onClose={onClose}
              position="end"
            />
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

      {loading && <LoaderModal />}
    </>
  );
};

export default IdeaCreateForm;
