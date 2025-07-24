import { IssuePriority, IssueType } from "@prisma/client";

export interface IssueFormFields {
  title: string;
  description: string;
  issueType: IssueType;
  postcode: string;
  landmark?: string;
  priority: IssuePriority;
  images: File[];
}

export const defaultValues: IssueFormFields = {
  title: "",
  description: "",
  issueType: "OTHER" as IssueType,
  postcode: "",
  landmark: "",
  priority: "MEDIUM" as IssuePriority,
  images: [],
};

export function isFormEmpty(
  values: IssueFormFields,
  lat: number | null,
  lng: number | null,
  addressLines: string[],
  addressCoords: string,
  previewUrls: string[],
): boolean {
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
}
