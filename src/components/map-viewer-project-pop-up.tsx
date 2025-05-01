"use client";

import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";

interface ProjectPopupContentProps {
  title: string;
  latitude: number;
  longitude: number;
  progress: number;
  categories: {
    id: string;
    name: string;
    icon: string;
  }[];
}

const ProjectPopupContent: React.FC<ProjectPopupContentProps> = ({
  title,
  latitude,
  longitude,
  progress,
  categories,
}) => {
  return (
    <div className="p-2">
      <h2 className="mb-1 text-lg font-bold">{title}</h2>
      <p className="text-sm text-gray-600">Latitude: {latitude.toFixed(4)}</p>
      <p className="text-sm text-gray-600">Longitude: {longitude.toFixed(4)}</p>

      {/* Category Icons */}
      <div className="mt-2 flex gap-2">
        {categories.map(({ id, name, icon }) => {
          const Icon = (Icons as unknown as Record<string, LucideIcon>)[icon] || Icons.Folder;
          return (
            <div key={id} className="group relative flex items-center justify-center">
              <Icon className="h-5 w-5 text-gray-700 group-hover:text-blue-500" />
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 scale-0 rounded bg-black px-2 py-1 text-xs text-white transition-all group-hover:scale-100">
                {name}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-gray-200 shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-gray-500">{progress}% complete</p>

      {/* CTA */}
      <button className="mt-2 w-full rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600">
        View Details
      </button>
    </div>
  );
};

export default ProjectPopupContent;
