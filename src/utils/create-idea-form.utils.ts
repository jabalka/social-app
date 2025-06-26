// idea-form-utils.ts

export interface IdeaFormFields {
    title: string;
    content: string;
    allowCollab: boolean;
    postcode: string;
    categories: string[];
    images: File[];
  }

export function isFormEmpty(
  values: IdeaFormFields,
  lat: number | null | undefined,
  lng: number | null | undefined,
  addressLines: string[],
  addressCoords: string,
  previewUrls: string[],
): boolean {
  return (
    !values.title.trim() &&
    !values.content.trim() &&
    !values.postcode.trim() &&
    (!values.categories || values.categories.length === 0) &&
    (!values.images || values.images.length === 0) &&
    !lat &&
    !lng &&
    addressLines.filter(Boolean).length === 0 &&
    !addressCoords &&
    (!previewUrls || previewUrls.length === 0)
  );
}
