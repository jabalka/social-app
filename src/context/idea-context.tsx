"use client";

import { Idea } from "@/models/idea.types";
import { createContext, useCallback, useContext, useState } from "react";

type SortType = "newest" | "oldest" | "top";

interface IdeaContextType {
  ideas: Idea[];
  setIdeas: (ideas: Idea[]) => void;
  refreshIdeas: (options?: {
    page?: number;
    limit?: number;
    sort?: SortType;
    ownerId?: string;
    type?: "all" | "user";
    lat?: number;
    lng?: number;
    radius?: number;
  }) => Promise<void>;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalIdeas: number;
  setTotalIdeas: (count: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
}

const IdeaContext = createContext<IdeaContextType | null>(null);

export const useIdeaContext = () => {
  const ctx = useContext(IdeaContext);
  if (!ctx) throw new Error("useIdeaContext must be used within IdeaProvider");
  return ctx;
};

export const IdeaProvider: React.FC<{ initialIdeas?: Idea[]; children: React.ReactNode }> = ({
  initialIdeas = [],
  children,
}) => {
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas || []);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalIdeas, setTotalIdeas] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  const refreshIdeas = useCallback(
    async (options?: {
      page?: number;
      limit?: number;
      sort?: SortType;
      ownerId?: string;
      type?: "all" | "user";
      lat?: number;
      lng?: number;
      radius?: number;
    }) => {
      try {
        const page = options?.page ?? currentPage;
        const limit = options?.limit ?? pageSize;
        const sort = options?.sort ? `&sort=${options.sort}` : "";

        let url = "";

          if (options?.type === "user" && options.ownerId) {
          url = `/api/user/ideas?page=${page}&limit=${limit}${sort}`;
        } else {
          url = `/api/ideas?page=${page}&limit=${limit}${sort}`;
          if (options?.ownerId) url += `&ownerId=${options.ownerId}`;
          if (options?.lat !== undefined && options?.lng !== undefined && options?.radius) {
            url += `&near=${options.lat},${options.lng}&radius=${options.radius}`;
          }
        }

        const res = await fetch(url);
        const data = await res.json();

        const list: Idea[] = data.data ?? data.ideas ?? data.items ?? [];
        const total: number = data.totalCount ?? data.total ?? list.length;

        setIdeas(list);
        setTotalIdeas(total);
      } catch (err) {
        console.error("Failed to refresh ideas:", err);
      }
    },
    [currentPage, pageSize],
  );

  return (
    <IdeaContext.Provider
      value={{
        ideas,
        setIdeas,
        refreshIdeas,
        currentPage,
        setCurrentPage,
        totalIdeas,
        setTotalIdeas,
        pageSize,
        setPageSize,
      }}
    >
      {children}
    </IdeaContext.Provider>
  );
};