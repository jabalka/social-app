export type Collaborator = {
  id: string;
  userId: string;
  ideaId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  user: { id: string; name: string; image: string | null };
};
