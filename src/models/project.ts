export interface ProjectUpdateInput {
  title?: string;
  description?: string;
  postcode?: string;
  latitude?: number;
  longitude?: number;
  progress?: number;
  progressNotes?: string;
  status?: string;
  categories?: string[]; 
  newImageUrls?: string[];
  deletedImageUrls?: string[];
}

export type ProjectDraft = {
  // Form fields
  title: string;
  description: string;
  postcode: string;
  latitude: number | null;
  longitude: number | null;
  images: File[];
  categories: string[];

  // (UI) fields
  lat?: number | null;
  lng?: number | null;
  what3words?: string | null;
  addressLines?: string[];
  addressCoords?: string;
  previewUrls?: string[];
};
