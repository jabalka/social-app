"use client";
import { useSafeThemeContext } from "@/context/safe-theme-context";
import { useInterceptAnchorNavigation } from "@/hooks/use-intercept-anchor-navigation";
import { usePostcodeAddress } from "@/hooks/use-postcode-address.hook";
import { useProjectFormDraft } from "@/hooks/use-project-form-draft";
import { useShowToastOnBrowserBack } from "@/hooks/use-show-toast-on-browser-back";
import { isProjectFormEmpty, ProjectFormFields } from "@/utils/create-project-form.utils";
import { clearDraft } from "@/utils/save-to-draft.utils";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Control, FieldValues, FormProvider, useForm } from "react-hook-form";
import ActionButtons from "./shared/action-buttons";
import LoaderModal from "./common/loader-modal";
import LeafletMapModal from "./leaflet-map-modal";
import LocationPostcodePickup from "./location-postode-pick-up";
import CategorySelector from "./project-category-selector";
import ProjectImageUpload from "./project-image-upload";
import ProjectTitleField from "./project-title-field";
import DescriptionField from "./shared/description-field";

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
  const methods = useForm<ProjectFormFields>({ defaultValues, mode: "onChange" });
  const { handleSubmit, getValues, reset, formState, control, watch, setValue } = methods;
  const watchedCategories = watch("categories", []);
  const handleImagesChange = (files: File[]) => {
    setValue("images", files, { shouldValidate: true });
  };

  const router = useRouter();

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

  const isCreateButtonDisabled =
    loading || !formState.isValid || !lat || !lng || !watchedCategories || watchedCategories.length === 0;

  const {
    saveDraftState,
    handleBackButton,
    checkNavigationInterception,
    handleNavigationInterception,
    loadDraftState,
  } = useProjectFormDraft({
    draftKey: DRAFT_KEY,
    formMethods: methods,
    locationData: {
      lat,
      lng,
      addressLines,
      addressCoords,
      what3words,
      setAllAddressState,
      resetAddressState,
    },
    previewUrls,
    loading,
    onClose,
  });

  useInterceptAnchorNavigation(checkNavigationInterception, handleNavigationInterception, true);

  useShowToastOnBrowserBack(
    () => {
      const values = getValues();
      return !isProjectFormEmpty(values, lat, lng, addressLines, addressCoords, previewUrls);
    },
    () => {
      saveDraftState();
      sessionStorage.setItem("showProjectDraftToast", "true");
    },
  );

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

  const resetLocation = () => {
    setValue("postcode", "");

    resetAddressState();
  };

  const onSubmit = async (data: ProjectFormFields) => {
    setLoading(true);

    try {
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
        sessionStorage.setItem("showProjectErrorToast", "An error occurred while creating your project.");

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

      if (uploadedUrls.length > 0) {
        await fetch(`/api/projects/${projectId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newImageUrls: uploadedUrls, deletedImageUrls: [] }),
        });
      }

      reset();
      resetAddressState();
      setPreviewUrls([]);
      clearDraft(DRAFT_KEY);

      onSuccess?.();

      sessionStorage.setItem("showProjectCreateSuccess", `Your idea "${data.title}" has been successfully created!`);
      sessionStorage.setItem("lastCreatedItemId", projectId);

      if (onClose) {
        onClose();
      } else {
        const destination = `/projects/${projectId}`;

        setTimeout(() => {
          router.push(destination);
        }, 300);

        setTimeout(() => {
          setLoading(false);
        }, 800);

        return;
      }
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-save drafts when form changes
  useEffect(() => {
    const subscription = methods.watch(() => {
      saveDraftState();
    });
    return () => subscription.unsubscribe();
  }, [methods, saveDraftState]);

  // Load draft on mount
  useEffect(() => {
    loadDraftState().then((draftLoaded) => {
      if (draftLoaded) {
        // Set preview URLs from loaded draft if needed
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Browser tab close/reload handler
  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (loading) return;
      saveDraftState();
      sessionStorage.setItem("showProjectDraftToast", "true");
      e.preventDefault();
      e.returnValue = "";
      return "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
    // eslint-disable-next-line
  }, [saveDraftState, loading]);

  return (
    <>
      <FormProvider {...methods}>
        <div className="rounded-xl bg-gradient-to-b from-[#d9b8a71a] via-[#514e4d45] to-[#00000065]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-xl p-6 shadow">
            <ProjectTitleField theme={theme} />

            <DescriptionField
              formMode={true}
              fieldName="description"
              label="Description"
              tooltipContent="Briefly explain your project. What problem does it solve? Why is it important?"
              tooltipId="desc"
              required={true}
              maxLength={15000}
              placeholder="Describe your project..."
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

            <ProjectImageUpload
              mode="create"
              theme={theme}
              existingImages={previewUrls.map((url) => ({ url }))}
              onImagesChange={handleImagesChange}
              maxImages={10}
            />

            <ActionButtons
              cancelText="Back"
              submitText="Create Project"
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

export default CreateProjectForm;
