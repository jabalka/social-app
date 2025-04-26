"use client";

import type { FC } from "react";

interface ProjectPopupContentProps {
  title: string;
  latitude: number;
  longitude: number;
}

const ProjectPopupContent: FC<ProjectPopupContentProps> = ({ title, latitude, longitude }) => {
  return (
    <div className="p-2">
      <h2 className="text-lg font-bold mb-1">{title}</h2>
      <p className="text-sm text-gray-600">Latitude: {latitude.toFixed(4)}</p>
      <p className="text-sm text-gray-600">Longitude: {longitude.toFixed(4)}</p>
      <button className="mt-2 rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600 text-sm">
        View Details
      </button>
    </div>
  );
};

export default ProjectPopupContent;
