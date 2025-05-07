import Image from "next/image";

const ProjectMapLegend: React.FC = () => {
    const legendItems = [
      { label: "Proposed", color: "/images/project-proposed.png" },
      { label: "In Progress", color: "/images/project-in-progress.png" },
      { label: "Completed", color: "/images/project-completed.png" },
      { label: "Rejected", color: "/images/marker-icon.png" },
    ];
  
    return (
      <div className="absolute bottom-2 left-2 z-[1000] rounded-lg bg-white p-1 shadow-lg">
        <h4 className="mb-2 text-sm font-semibold text-gray-700">-- Legend --</h4>
        <ul className="space-y-2">
          {legendItems.map((item) => (
            <li key={item.label} className="flex items-center gap-1 text-sm font-mono text-gray-600">
              <Image src={item.color} alt={item.label} width={5} height={5} className="h-5 w-5" />
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  export default ProjectMapLegend;