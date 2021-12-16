import React, { useEffect, useState, useCallback } from "react";
import { Col, Row, Button } from "react-bootstrap";
import { useNavigate } from "react-router";
import { getOrganizationList } from "../../../organization/api";
import { OrganizationModel } from "../../../organization/providers/types";
import OrganizationTable from "../../../../components/Table/OrganizationsTable";
import { PageableModel } from "../../../../api/sharedModel";
import Paginator from "../../../../components/Pagination/Paginator";
import { useAppDispatch } from "../../../../store/hooks";
import { showLoader } from "../../../reducers/loader";
import { showError } from "../../../reducers/tostify";
import CreateOrganization from "./create/CreateOrganization";

const columns = ["Name", "Type", "Active"];

const Organization = () => {
  const [organizationList, setOrganizationList] =
    useState<PageableModel<OrganizationModel>>();
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const loadData = useCallback(() => {
    dispatch(showLoader(true));
    getOrganizationList()
      .then((res) => {
        setOrganizationList(res);
      })
      .catch((error) => {
        dispatch(
          showError(
            error.response !== undefined ? error.response.data.message : null
          )
        );
      })
      .finally(() => {
        dispatch(showLoader(false));
      });
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
          <Button
            className="btn btn-primary float-sm-end"
            onClick={handleShow}
          >
            Create
          </Button>
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
      { show && <CreateOrganization handleClose={handleClose} show={show} />}
    </>
  );
};

export default Organization;
