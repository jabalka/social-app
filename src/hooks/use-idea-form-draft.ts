import { useConfirmation } from "@/hooks/use-confirmation.hook";
import { IdeaDraft } from "@/models/idea.types";
import { IdeaFormFields, isIdeaFormEmpty } from "@/utils/create-idea-form.utils";
import { clearDraft, loadDraft, saveDraft } from "@/utils/save-to-draft.utils";
import { useRouter } from "next/navigation";
import { useCallback, useRef } from "react";
import { UseFormReturn } from "react-hook-form";

interface UseIdeaFormDraftParams {
  draftKey: string;
  formMethods: UseFormReturn<IdeaFormFields>;
  locationData: {
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
  };
  previewUrls: string[];
  loading: boolean;
  onClose?: () => void;
}

export const useIdeaFormDraft = ({
  draftKey,
  formMethods,
  locationData,
  previewUrls,
  loading,
  onClose,
}: UseIdeaFormDraftParams) => {
  const { confirm } = useConfirmation();
  const router = useRouter();
  const pendingUrlRef = useRef<string | null>(null);
  const { getValues, reset } = formMethods;
  const { lat, lng, addressLines, addressCoords, what3words, setAllAddressState } = locationData;

  const saveDraftState = useCallback(() => {
    const values = getValues();
    if (isIdeaFormEmpty(values, lat, lng, addressLines, addressCoords, previewUrls)) {
      clearDraft(draftKey);
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
    saveDraft(draftKey, draft);
  }, [getValues, lat, lng, what3words, addressLines, addressCoords, previewUrls, draftKey]);

  const checkNavigationInterception = useCallback(
    (href: string) => {
      if (loading) return true;
      const values = getValues();
      if (isIdeaFormEmpty(values, lat, lng, addressLines, addressCoords, previewUrls)) {
        clearDraft(draftKey);
        return true;
      }
      pendingUrlRef.current = href;
      return false;
    },
    [getValues, lat, lng, addressLines, addressCoords, previewUrls, loading, draftKey],
  );

  const handleNavigationInterception = useCallback(async () => {
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
  }, [confirm, saveDraftState, router]);

  const handleBackButton = useCallback(async () => {
    const values = getValues();
    if (isIdeaFormEmpty(values, lat, lng, addressLines, addressCoords, previewUrls)) {
      clearDraft(draftKey);
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
  }, [
    confirm,
    getValues,
    lat,
    lng,
    addressLines,
    addressCoords,
    previewUrls,
    draftKey,
    saveDraftState,
    onClose,
    router,
  ]);

  const loadDraftState = useCallback(async () => {
    const draft = loadDraft<IdeaDraft>?.(draftKey);
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
      const result = await confirm({
        title: "Resume saved draft?",
        description: "You have a saved draft. Would you like to continue where you left off?",
        confirmText: "Resume",
        cancelText: "Discard",
      });

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
        return true;
      } else {
        clearDraft?.(draftKey);
      }
    }
    return false;
  }, [draftKey, confirm, reset, setAllAddressState]);

  return {
    saveDraftState,
    checkNavigationInterception,
    handleNavigationInterception,
    handleBackButton,
    loadDraftState,
  };
};
