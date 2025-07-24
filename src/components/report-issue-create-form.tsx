"use client";
import { useSafeThemeContext } from "@/context/safe-theme-context";
import { useConfirmation } from "@/hooks/use-confirmation.hook";
import { useInterceptAnchorNavigation } from "@/hooks/use-intercept-anchor-navigation";
import { usePostcodeAddress } from "@/hooks/use-postcode-address.hook";
import { useShowToastOnBrowserBack } from "@/hooks/use-show-toast-on-browser-back";
import { ISSUE_PRIORITY_LEVELS, ISSUE_TYPES } from "@/lib/report-issue";
import { IssuePriority, IssueType } from "@prisma/client";
import { AlertTriangle, SquareFunction } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import GlowingGreenButton from "./glowing-green-button";
import GlowingPinkButton from "./glowing-pink-button";
import ImageUpload from "./images-upload";
import LeafletMapModal from "./leaflet-map-modal";
import LocationPostcodePickup from "./location-postode-pick-up";
import RequiredStar from "./required-star";
import IconWithTooltip from "./tooltip-with-icon";
import LoaderModal from "./loader-modal";
import { clearDraft, loadDraft, saveDraft } from "@/utils/save-to-draft.utils";

interface IssueFormFields {
  title: string;
  description: string;
  issueType: IssueType;
  postcode: string;
  landmark?: string;
  priority: IssuePriority;
  images: File[];
}

const DRAFT_KEY = "ISSUE_REPORT_DRAFT";

interface IssueDraft extends IssueFormFields {
  lat?: number | null;
  lng?: number | null;
  addressLines?: string[];
  addressCoords?: string;
  what3words?: string;
  previewUrls?: string[];
}

const defaultValues: IssueFormFields = {
  title: "",
  description: "",
  issueType: "OTHER" as IssueType,
  postcode: "",
  landmark: "",
  priority: "MEDIUM" as IssuePriority,
  images: [],
};

interface ReportIssueCreateFormProps {
  open?: boolean;
  onClose?: () => void;
  onIssueCreated?: () => void;
}

const ReportIssueCreateForm: React.FC<ReportIssueCreateFormProps> = ({ open = true, onClose, onIssueCreated }) => {
  const { theme } = useSafeThemeContext();
  const { confirm } = useConfirmation();
  const router = useRouter();

  const methods = useForm<IssueFormFields>({ defaultValues, mode: "onChange" });
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

  const watchedIssueType = watch("issueType");
  const watchedTitle = watch("title");

  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const pendingUrlRef = useRef<string | null>(null);

  // Description Content limitation
  const watchedDescription = watch("description", "");
  const maxDescriptionLength = 250;
  const descriptionLength = watchedDescription?.length || 0;
  const isDescriptionLimitReached = descriptionLength >= maxDescriptionLength;

  const isSubmitButtonDisabled =
    loading || !formState.isValid || !lat || !lng || !watchedIssueType;

  // Auto-fill title based on selected issue type
  const handleAutoFillTitle = () => {
    const selectedIssue = ISSUE_TYPES.find((type) => type.value === watchedIssueType);
    if (selectedIssue) {
      setValue("title", selectedIssue.autoFill, { shouldValidate: true });
    }
  };

  const isFormEmpty = (
    values: IssueFormFields,
    lat: number | null,
    lng: number | null,
    addressLines: string[],
    addressCoords: string,
    previewUrls: string[],
  ): boolean => {
    return (
      !values.title &&
      !values.description &&
      !values.landmark &&
      !values.postcode &&
      values.issueType === defaultValues.issueType &&
      values.priority === defaultValues.priority &&
      values.images.length === 0 &&
      !lat &&
      !lng &&
      addressLines.length === 0 &&
      !addressCoords &&
      previewUrls.length === 0
    );
  };

  // Save draft state - matching the pattern from idea-create-form
  const saveDraftState = useCallback(() => {
    const values = getValues();
    if (isFormEmpty(values, lat, lng, addressLines, addressCoords, previewUrls)) {
      clearDraft(DRAFT_KEY);
      return false; 
    }
    const draft: IssueDraft = {
      ...values,
      lat,
      lng,
      what3words,
      addressLines,
      addressCoords,
      previewUrls,
    };
    saveDraft(DRAFT_KEY, draft);
    return true; 
  }, [getValues, lat, lng, what3words, addressLines, addressCoords, previewUrls]);

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
        throw new Error(`Failed to create issue: ${res.status}`);
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
  
      // Clear the form and draft
      reset();
      resetAddressState();
      setPreviewUrls([]);
      clearDraft(DRAFT_KEY);
      
      // Clear the draft toast flag - add this line
      sessionStorage.removeItem("showIssueReportDraftToast");
      
      // Set success toast message with the title of the issue
      sessionStorage.setItem("showIssueReportSuccess", data.title);
      
      onIssueCreated?.();
      onClose?.();
      
      router.push("/browse/issues-list");
    } catch (error) {
      console.error("Error submitting issue report:", error);
      alert("Failed to submit issue report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackButton = async () => {
    const values = getValues();
    if (isFormEmpty(values, lat, lng, addressLines, addressCoords, previewUrls)) {
      clearDraft(DRAFT_KEY);
      onClose?.();
      router.back();
      return;
    }
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
      onClose?.();
      router.back();
    }
  };

  useEffect(() => {
    const subscription = methods.watch(() => {
      const values = getValues();
      if (!isFormEmpty(values, lat, lng, addressLines, addressCoords, previewUrls)) {
        saveDraftState();
      }
    });
    return () => subscription.unsubscribe();
  }, [methods, getValues, saveDraftState, lat, lng, addressLines, addressCoords, previewUrls]);

  useEffect(() => {
    if (!open) return;
    const draft = loadDraft<IssueDraft>(DRAFT_KEY);
    if (
      draft &&
      !isFormEmpty(
        draft,
        draft.lat ?? null,
        draft.lng ?? null,
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
            issueType: draft.issueType ?? "OTHER",
            postcode: draft.postcode ?? "",
            landmark: draft.landmark ?? "",
            priority: draft.priority ?? "MEDIUM",
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // browser tab close/reload
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

            {/* Issue Type */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-sm font-semibold">
                  Issue Type
                  <RequiredStar />
                </label>
                <IconWithTooltip
                  theme={theme}
                  id="issue-type"
                  tooltipPlacement="left"
                  content="Select the type of issue you're reporting"
                />
              </div>
              <Controller
                control={control}
                name="issueType"
                rules={{ required: true }}
                render={({ field }) => (
                  <div className="relative">
                    <select className="w-full rounded border p-2 pr-8" {...field}>
                      {ISSUE_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              />

              {/* Show description of selected issue type */}
              {watchedIssueType && (
                <div className="mt-2 rounded-md bg-gray-100 p-2 text-xs dark:bg-gray-800">
                  <p>
                    {ISSUE_TYPES.find((t) => t.value === watchedIssueType)?.description ||
                      "Please describe the issue in detail"}
                  </p>
                </div>
              )}
            </div>

            {/* Title with Auto-Fill */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-sm font-semibold">
                  Title
                  <RequiredStar />
                </label>
                <IconWithTooltip
                  theme={theme}
                  id="title"
                  tooltipPlacement="left"
                  content="A short, descriptive title for the issue (max 35 characters)"
                />
              </div>
              <div className="flex gap-2">
                <input
                  className="w-full rounded border p-2"
                  placeholder="Brief issue title"
                  maxLength={35}
                  {...methods.register("title", { required: true, maxLength: 35 })}
                />
                <button
                  type="button"
                  onClick={handleAutoFillTitle}
                  className="flex items-center gap-1 rounded bg-gray-200 px-2 py-1 text-sm text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  <SquareFunction  className="h-4 w-4" />
                  Auto-Fill
                </button>
              </div>
              <div className="mt-1 flex justify-end text-xs">
                <span className={watchedTitle.length >= 35 ? "font-semibold text-red-500" : "text-gray-500"}>
                  {watchedTitle.length}/35
                </span>
              </div>
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
                  id="description"
                  tooltipPlacement="left"
                  content="Provide details about the issue - what's wrong, how severe is it, etc."
                />
              </div>
              <textarea
                className={`w-full rounded border p-2 ${isDescriptionLimitReached ? "border-red-400" : ""}`}
                placeholder="Describe the issue in detail..."
                {...methods.register("description", { required: true, maxLength: maxDescriptionLength })}
                rows={3}
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

            {/* Landmark */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-sm font-semibold">Nearby Landmark</label>
                <IconWithTooltip
                  theme={theme}
                  id="landmark"
                  tooltipPlacement="left"
                  content="Mention any nearby landmark to help locate the issue (e.g., 'Near St. Mary's Church')"
                />
              </div>
              <input
                className="w-full rounded border p-2"
                placeholder="E.g., Near the library, opposite the gas station"
                {...methods.register("landmark")}
              />
            </div>

            {/* Priority Level */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-sm font-semibold">
                  Priority Level
                  <RequiredStar />
                </label>
                <IconWithTooltip
                  theme={theme}
                  id="priority"
                  tooltipPlacement="left"
                  content="How urgent is this issue?"
                />
              </div>
              <Controller
                control={control}
                name="priority"
                rules={{ required: true }}
                render={({ field }) => (
                  <div className="space-y-2">
                    {ISSUE_PRIORITY_LEVELS.map((priority) => (
                      <label key={priority.value} className="flex items-center gap-2">
                        <input
                          type="radio"
                          value={priority.value}
                          checked={field.value === priority.value}
                          onChange={() => field.onChange(priority.value)}
                          className="h-4 w-4"
                        />
                        <span className="text-sm font-medium">{priority.label}</span>
                        <span className="text-xs text-gray-500">{priority.description}</span>
                      </label>
                    ))}
                  </div>
                )}
              />
            </div>

            {/* Images Section */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-sm font-semibold">Issue Images</label>
                <IconWithTooltip
                  theme={theme}
                  id="images"
                  tooltipPlacement="left"
                  content="Add photos to help authorities identify and address the issue"
                />
              </div>
              <Controller
                name="images"
                control={control}
                render={() => (
                  <ImageUpload
                    mode="create"
                    theme={theme}
                    title="Upload Images"
                    additionalContent={null}
                    onImagesChange={handleImageChange}
                    maxImages={5}
                    currentCount={0}
                    description="Add up to 5 photos of the issue (optional)"
                  />
                )}
              />
            </div>

            {/* Safety Warning - more compact version */}
            <div className="rounded-md bg-yellow-50 p-3 dark:bg-yellow-900/30">
              <div className="flex items-start">
                <AlertTriangle className="mr-2 h-5 w-5 flex-shrink-0 text-yellow-400" />
                <div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Please don&apos;t put yourself at risk when documenting issues. For emergencies or dangerous
                    situations, contact emergency services directly.
                  </p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <GlowingPinkButton onClick={handleBackButton}>Back</GlowingPinkButton>
              <GlowingGreenButton theme={theme} type="submit" disabled={isSubmitButtonDisabled} className="px-4 py-2">
                {loading ? "Submitting..." : "Report Issue"}
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

export default ReportIssueCreateForm;