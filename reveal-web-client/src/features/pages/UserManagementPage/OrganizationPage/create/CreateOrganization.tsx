import React from "react";
import { Link } from "react-router-dom";
import { USER_MANAGEMENT } from "../../../../../constants";

const CreateOrganization = () => {
  return (
    <div>
      <h1>Create organization</h1>
      <Link
        className="btn btn-outline-primary my-4 ms-4 px-5"
        role="button"
        to={USER_MANAGEMENT}
      >
        Cancel
      </Link>
    </div>
  );
};

export default CreateOrganization;
