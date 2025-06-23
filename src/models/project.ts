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
