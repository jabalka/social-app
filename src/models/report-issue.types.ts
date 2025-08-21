import { IssuePriority, IssueStatus, IssueType } from "@prisma/client";
import { AuthUser } from "./auth.types";

export interface ReportIssueFormFields {
  title: string;
  description: string;
  issueType: IssueType;
  postcode: string;
  landmark?: string;
  priority: IssuePriority;
  images: File[];
}

export const defaultValues: ReportIssueFormFields = {
  title: "",
  description: "",
  issueType: "OTHER" as IssueType,
  postcode: "",
  landmark: "",
  priority: "MEDIUM" as IssuePriority,
  images: [],
};

export function isFormEmpty(
  values: ReportIssueFormFields,
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

export interface ReportIssueImage {
  id: string;
  url: string;
  issueId: string;
  createdAt: string;
}

export interface ReportIssueReport {
  id: string;
  title: string;
  description: string;
  issueType: IssueType;
  postcode: string;
  latitude: number;
  longitude: number;
  what3words?: string | null;
  address?: string | null;
  landmark?: string | null;
  status: IssueStatus;
  priority: IssuePriority;
  reporterId: string;
  reporter: AuthUser;
  assignedToId?: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  images: ReportIssueImage[];
  comments: Array<{
    id: string;
    content: string;
    createdAt: string;
    author: AuthUser;
  }>;
  likes: Array<{
    id: string;
    userId: string;
  }>;
}
