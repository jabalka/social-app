"use client";
import { useSafeThemeContext } from "@/context/safe-theme-context";
import { useInterceptAnchorNavigation } from "@/hooks/use-intercept-anchor-navigation";
import { usePostcodeAddress } from "@/hooks/use-postcode-address.hook";
import { useShowToastOnBrowserBack } from "@/hooks/use-show-toast-on-browser-back";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import LeafletMapModal from "./leaflet-map-modal";

import { clearDraft } from "@/utils/save-to-draft.utils";

import { useConfirmation } from "@/hooks/use-confirmation.hook";
import { useIssueFormDraft } from "@/hooks/use-issue-form-draft";
import { defaultValues, isFormEmpty, IssueFormFields } from "@/models/issue.types";
import ActionButtons from "./shared/action-buttons";
import LoaderModal from "./common/loader-modal";
import ImagesUpload from "./images-upload";
import LocationPostcodePickup from "./location-postode-pick-up";
import IssueTypeSelect from "./report-issua-type-selector";
import LandmarkInput from "./report-issue-landmark-input";
import PriorityLevelSelect from "./report-issue-priority-select";
import TitleInputWithAutofill from "./report-issue-title-input";
import DescriptionField from "./shared/description-field";
import SafetyWarning from "./shared/safety-warning";
import IconWithTooltip from "./icon-with-tooltip";

const DRAFT_KEY = "ISSUE_REPORT_DRAFT";

interface ReportIssueCreateFormProps {
  open?: boolean;
  onClose?: () => void;
  onIssueCreated?: () => void;
}

const ReportIssueCreateForm: React.FC<ReportIssueCreateFormProps> = ({ open = true, onClose, onIssueCreated }) => {
  const { theme } = useSafeThemeContext();
  const router = useRouter();
  const { confirm } = useConfirmation();

  const methods = useForm<IssueFormFields>({ defaultValues, mode: "onChange" });
  const { handleSubmit, setValue, getValues, watch, reset, formState, control } = methods;
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

  const watchedIssueType = watch("issueType");
  const watchedTitle = watch("title");

  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const pendingUrlRef = useRef<string | null>(null);

  const isSubmitButtonDisabled = loading || !formState.isValid || !lat || !lng || !watchedIssueType;

  const { saveDraftState, handleBackButton } = useIssueFormDraft({
    draftKey: DRAFT_KEY,
    formMethods: methods,
    isFormEmpty,
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
    setPreviewUrls,
  });

  useInterceptAnchorNavigation(
    (href) => {
      if (loading) return true;
      const values = getValues();
      if (isFormEmpty(values, lat, lng, addressLines, addressCoords, previewUrls)) {
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
          "Your issue report will be saved as a draft and you can continue later. Are you sure you want to leave this page?",
        confirmText: "Leave",
        cancelText: "Stay",
      });

      if (result) {
        const draftSaved = saveDraftState();
        if (draftSaved) {
          sessionStorage.setItem("showIssueReportDraftToast", "true");
        }
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
    () => !isFormEmpty(getValues(), lat, lng, addressLines, addressCoords, previewUrls),
    () => {
      const draftSaved = saveDraftState();
      if (draftSaved) {
        sessionStorage.setItem("showIssueReportDraftToast", "true");
      }
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

  const handleImageChange = useCallback(
    (files: File[]) => {
      setValue("images", files);

      if (files.length !== previewUrls.length) {
        previewUrls.forEach((url) => URL.revokeObjectURL(url));
        const urls = files.map((file) => URL.createObjectURL(file));
        setPreviewUrls(urls);
      }
    },
    [previewUrls, setValue],
  );

  const onSubmit = async (data: IssueFormFields) => {
    setLoading(true);
    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          issueType: data.issueType,
          postcode: data.postcode,
          latitude: lat,
          longitude: lng,
          what3words,
          address: addressLines.join(", "),
          landmark: data.landmark,
          priority: data.priority,
        }),
      });

      if (!res.ok) {
        sessionStorage.setItem("showIssueReportErrorToast", "An error occurred while creating your report.");
        return;
      }

      const result = await res.json();
      const issueId = result.data?.issueId;

      if (issueId && data.images && data.images.length > 0) {
        for (const file of data.images) {
          const formData = new FormData();
          formData.append("image", file);
          formData.append("issueId", issueId);
          await fetch("/api/issues/images", {
            method: "POST",
            body: formData,
          });
        }
      }

      reset();
      resetAddressState();
      setPreviewUrls([]);
      clearDraft(DRAFT_KEY);

      onIssueCreated?.();

      sessionStorage.setItem("showIssueReportSuccess", data.title);
      sessionStorage.setItem("lastCreatedItemId", issueId);

      if (onClose) {
        onClose();
        setTimeout(() => {
          setLoading(false);
        }, 300);
      } else {
        setTimeout(() => {
          router.push("/browse/issues-list");
        }, 300);

        setTimeout(() => {
          setLoading(false);
        }, 800);

        return;
      }
    } catch {
      sessionStorage.setItem("showIssueReportErrorToast", "An error occurred while creating your report.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-save drafts
  useEffect(() => {
    const subscription = methods.watch(() => {
      const values = getValues();
      if (!isFormEmpty(values, lat, lng, addressLines, addressCoords, previewUrls)) {
        saveDraftState();
      }
    });
    return () => subscription.unsubscribe();
  }, [methods, getValues, saveDraftState, lat, lng, addressLines, addressCoords, previewUrls]);

  // Browser tab close/reload handler
  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (loading) return;
      const values = getValues();
      if (isFormEmpty(values, lat, lng, addressLines, addressCoords, previewUrls)) return;
      e.preventDefault();
      e.returnValue = "";
      saveDraftState();
      return "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveDraftState, loading, formState.isDirty]);

  if (!open) return null;

  return (
    <>
      {loading && <LoaderModal />}
      <FormProvider {...methods}>
        <div className="rounded-xl bg-gradient-to-b from-[#d9b8a71a] via-[#514e4d45] to-[#00000065]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-xl p-6 shadow">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Help improve your community by reporting issues in public spaces.
            </p>

            <IssueTypeSelect watchedIssueType={watchedIssueType} />

            <TitleInputWithAutofill watchedTitle={watchedTitle} watchedIssueType={watchedIssueType} />

            <DescriptionField
              formMode={true}
              fieldName="description"
              label="Description"
              tooltipContent="Provide details about the issue - what's wrong, how severe is it, etc."
              tooltipId="description"
              required={true}
              maxLength={250}
              placeholder="Describe the issue in detail..."
              minHeight="80px"
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

            <LandmarkInput />

            {/* Priority Level */}
            <PriorityLevelSelect />

            {/* Images Section */}
            <div>
              <div className="mb-1 flex items-center justify-between"></div>
              <Controller
                name="images"
                control={control}
                render={() => (
                  <ImagesUpload
                    mode="create"
                    theme={theme}
                    title="Upload Images"
                    additionalContent={
                      <IconWithTooltip
                        theme={theme}
                        id="images"
                        tooltipPlacement="left"
                        content="Add photos to help authorities identify and address the issue"
                      />
                    }
                    onImagesChange={handleImageChange}
                    maxImages={5}
                    currentCount={0}
                    description="Add up to 5 photos of the issue (optional)"
                  />
                )}
              />
            </div>

            <SafetyWarning />

            <ActionButtons
              cancelText="Back"
              submitText="Report Issue"
              onCancel={handleBackButton}
              loading={loading}
              disabled={isSubmitButtonDisabled}
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
    </>
  );
};

export default ReportIssueCreateForm;
