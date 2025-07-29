import React from "react";

import ProjectListOverview from "../../projects-list-overview";

const ProfileProjects: React.FC = () => {
  return (
    <>
      <ProjectListOverview showOwnedOnly={true} />
    </>
  );
};

export default ProfileProjects;
