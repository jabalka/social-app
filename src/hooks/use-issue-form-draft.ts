import { useCallback, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useConfirmation } from "./use-confirmation.hook";
import { clearDraft, loadDraft, saveDraft } from "@/utils/save-to-draft.utils";
import { ReportIssueFormFields } from "@/models/report-issue.types";


export interface IssueDraft extends ReportIssueFormFields {
  lat?: number | null;
  lng?: number | null;
  addressLines?: string[];
  addressCoords?: string;
  what3words?: string;
  previewUrls?: string[];
}

interface UseIssueFormDraftParams {
  draftKey: string;
  formMethods: UseFormReturn<ReportIssueFormFields>;
  isFormEmpty: (values: ReportIssueFormFields, lat: number | null, lng: number | null, addressLines: string[], addressCoords: string, previewUrls: string[]) => boolean;
  locationData: {
    lat: number | null;
    lng: number | null;
    addressLines: string[];
    addressCoords: string;
    what3words: string;
    setAllAddressState: (lat: number | null, lng: number | null, addressLines: string[], addressCoords: string, postcode: string, what3words: string) => void;
    resetAddressState: () => void;
  };
  previewUrls: string[];
  setPreviewUrls: React.Dispatch<React.SetStateAction<string[]>>;
}

export function useIssueFormDraft({
  draftKey,
  formMethods,
  isFormEmpty,
  locationData,
  previewUrls,
  setPreviewUrls,
}: UseIssueFormDraftParams) {
  const { getValues, reset } = formMethods;
  const { 
    lat, 
    lng, 
    addressLines, 
    addressCoords, 
    what3words, 
    // resetAddressState, 
    setAllAddressState } = locationData;
  const { confirm } = useConfirmation();
  const router = useRouter();

  // Save draft state
  const saveDraftState = useCallback(() => {
    const values = getValues();
    if (isFormEmpty(values, lat, lng, addressLines, addressCoords, previewUrls)) {
      clearDraft(draftKey);
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
    saveDraft(draftKey, draft);
    return true;
  }, [getValues, lat, lng, what3words, addressLines, addressCoords, previewUrls, isFormEmpty, draftKey]);

  // Check for existing draft on mount
  useEffect(() => {
    const draft = loadDraft<IssueDraft>(draftKey);
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
          clearDraft(draftKey);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBackButton = async () => {
    const values = getValues();
    if (isFormEmpty(values, lat, lng, addressLines, addressCoords, previewUrls)) {
      clearDraft(draftKey);
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
      router.back();
    }
  };

  return {
    saveDraftState,
    handleBackButton,
  };
}