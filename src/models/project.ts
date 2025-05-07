export interface ProjectUpdateInput {
  title?: string;
  description?: string;
  postcode?: string;
  latitude?: number;
  longitude?: number;
  progress?: number;
  progressNotes?: string;
  status?: string;
  categories?: { set: { id: string }[] };
}
