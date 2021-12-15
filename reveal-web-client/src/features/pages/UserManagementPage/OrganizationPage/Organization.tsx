import React, { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { USER_MANAGEMENT_ORGANIZATION_CREATE } from "../../../../constants";
import { getOrganizationList } from "../../../organization/api";
import { OrganizationModel } from "../../../organization/providers/types";
import OrganizationTable from "../../../../components/Table/OrganizationsTable";
import { PageableModel } from "../../../../api/sharedModel";
import Paginator from "../../../../components/Pagination/Paginator";
import { useAppDispatch } from "../../../../store/hooks";
import { showLoader } from "../../../reducers/loader";
import { showError } from "../../../reducers/tostify";

const columns = ["Name", "Type", "Active"];

const Organization = () => {
  const [organizationList, setOrganizationList] =
    useState<PageableModel<OrganizationModel>>();

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(showLoader(true));
    getOrganizationList().then((res) => {
      setOrganizationList(res);
    }).catch(error => {
      dispatch(showError(error.response !== undefined ? error.response.data.message : null));
    }).finally(() => {
      dispatch(showLoader(false));
    });
  }, [dispatch]);

  const openOrganizationById = (id?: string) => {
    if (id !== undefined) {
      navigate("organization/" + id);
    }
  };

  return (
    <>
      <Row className="my-4">
        <Col>
          <h2>
            Organizations (
            {organizationList !== undefined
              ? organizationList.totalElements
              : 0}
            )
          </h2>
        </Col>
        <Col>
          <Link
            className="btn btn-primary float-end w-25"
            role="button"
            to={USER_MANAGEMENT_ORGANIZATION_CREATE}
          >
            Create
          </Link>
        </Col>
      </Row>
      <input
        className="form-control w-25"
        placeholder="Search"
        onChange={(e) => {
          //filterData(e);
          console.log(e);
        }}
      />
      <hr className="my-4" />
      <OrganizationTable
        clickHandler={openOrganizationById}
        rows={organizationList !== undefined ? organizationList.content : []}
        head={columns}
      />
      <Paginator />
    </>
  );
};

export default Organization;
