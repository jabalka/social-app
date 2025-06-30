
export interface ProjectFormFields {
    title: string;
    description: string;
    postcode: string;
    latitude: number | null;
    longitude: number | null;
    images: File[];
    categories: string[];
  }

export function isProjectFormEmpty(
  values: ProjectFormFields,
  lat: number | null | undefined,
  lng: number | null | undefined,
  addressLines: string[],
  addressCoords: string,
  previewUrls: string[],
): boolean {
  return (
    !values.title.trim() &&
    !values.description.trim() &&
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


