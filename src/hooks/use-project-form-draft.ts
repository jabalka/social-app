import { ProjectDraft } from "@/models/project.types";
import { isProjectFormEmpty, ProjectFormFields } from "@/utils/create-project-form.utils";
import { clearDraft, loadDraft, saveDraft } from "@/utils/save-to-draft.utils";
import { useRouter } from "next/navigation";
import { useCallback, useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { useConfirmation } from "./use-confirmation.hook";

interface LocationData {
  lat: number | null;
  lng: number | null;
  addressLines: string[];
  addressCoords: string;
  what3words: string;
  setAllAddressState: (
    lat: number | null,
    lng: number | null,
    addressLines: string[],
    addressCoords: string,
    postcode: string,
    what3words: string,
  ) => void;
  resetAddressState: () => void;
}

interface UseProjectFormDraftProps {
  draftKey: string;
  formMethods: UseFormReturn<ProjectFormFields>;
  locationData: LocationData;
  previewUrls: string[];
  loading: boolean;
  onClose?: () => void;
}

export const useProjectFormDraft = ({
  draftKey,
  formMethods,
  locationData,
  previewUrls,
  loading,
  onClose,
}: UseProjectFormDraftProps) => {
  const router = useRouter();
  const { confirm } = useConfirmation();
  const pendingUrlRef = useRef<string | null>(null);

  const { getValues, reset } = formMethods;
  const {
    lat,
    lng,
    addressLines,
    addressCoords,
    what3words,
    setAllAddressState,
    // resetAddressState
  } = locationData;

  const saveDraftState = useCallback(() => {
    const values = getValues();
    if (isProjectFormEmpty(values, lat, lng, addressLines, addressCoords, previewUrls)) {
      clearDraft(draftKey);
      return false;
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

    saveDraft<ProjectDraft>(draftKey, draft);
    return true;
  }, [getValues, lat, lng, what3words, addressLines, addressCoords, previewUrls, draftKey]);

  const handleBackButton = async () => {
    const values = getValues();
    if (isProjectFormEmpty(values, lat, lng, addressLines, addressCoords, previewUrls)) {
      clearDraft(draftKey);
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

  const checkNavigationInterception = (href: string) => {
    if (loading) return true;
    const values = getValues();
    if (isProjectFormEmpty(values, lat, lng, addressLines, addressCoords, previewUrls)) {
      clearDraft(draftKey);
      return true;
    }
    pendingUrlRef.current = href;
    return false;
  };

  const handleNavigationInterception = async () => {
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
  };

  const loadDraftState = async () => {
    const draft = loadDraft<ProjectDraft>(draftKey);
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
      const result = await confirm({
        title: "Resume saved draft?",
        description: "You have a saved draft. Would you like to continue where you left off?",
        confirmText: "Resume",
        cancelText: "Discard",
      });

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

        return true;
      } else {
        clearDraft(draftKey);
      }
    }
    return false;
  };

  return {
    saveDraftState,
    handleBackButton,
    checkNavigationInterception,
    handleNavigationInterception,
    loadDraftState,
    pendingUrlRef,
  };
};
