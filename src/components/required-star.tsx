import React from 'react';

interface Props {
    className?: string;
}

const RequiredStar: React.FC<Props> = ({ className }) => {
    return (
        <span className={`ml-1 text-red-500 ${className}`} title="Required" aria-label="required">
        *
      </span>
    );
};

export default RequiredStar;
