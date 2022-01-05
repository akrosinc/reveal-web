import React from 'react';
import { useParams } from 'react-router-dom';

const OrganizationDetails = () => {
  let { organizationId } = useParams();

  return (
    <div>
      <h1>Organization details for: {organizationId}</h1>
    </div>
  );
};

export default OrganizationDetails;
