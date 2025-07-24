import { AlertTriangle } from "lucide-react";
import React from "react";

const SafetyWarning: React.FC = () => {
  return (
    <div className="rounded-md bg-yellow-50 p-3 dark:bg-yellow-900/30">
      <div className="flex items-start">
        <AlertTriangle className="mr-2 h-5 w-5 flex-shrink-0 text-yellow-500 dark:text-yellow-400" />
        <div>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Please don&apos;t put yourself at risk when documenting issues. For emergencies or dangerous situations,
            contact emergency services directly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SafetyWarning;
