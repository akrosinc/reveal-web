import React, { useEffect, useState, useCallback } from "react";
import { Col, Row, Button } from "react-bootstrap";
import {
  getOrganizationCount,
  getOrganizationList,
} from "../../../organization/api";
import { OrganizationModel } from "../../../organization/providers/types";
import OrganizationTable from "../../../../components/Table/OrganizationsTable";
import { PageableModel } from "../../../../api/sharedModel";
import Paginator from "../../../../components/Pagination/Paginator";
import { useAppDispatch } from "../../../../store/hooks";
import { showLoader } from "../../../reducers/loader";
import { showError } from "../../../reducers/tostify";
import CreateOrganization from "./create/CreateOrganization";
import { PAGINATION_DEFAULT_SIZE } from "../../../../constants";
import { DebounceInput } from "react-debounce-input";

const columns = ["Name", "Type", "Active"];

const Organization = () => {
  const [organizationList, setOrganizationList] =
    useState<PageableModel<OrganizationModel>>();
  const [show, setShow] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [organizationCount, setorganizationCount] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const handleClose = () => {
    setShow(false);
    setShowDetails(false);
    loadData(PAGINATION_DEFAULT_SIZE, 0);
  };
  const handleShow = () => setShow(true);

  const dispatch = useAppDispatch();

  const loadData = useCallback(
    (size: number, page: number, searchData?: string) => {
      dispatch(showLoader(true));
      getOrganizationList(size, page, searchData !== undefined ? searchData : searchInput)
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
    },
    [dispatch, searchInput]
  );

  useEffect(() => {
    loadData(PAGINATION_DEFAULT_SIZE, 0);
    getOrganizationCount().then((res) => {
      setorganizationCount(res.count);
    });
  }, [loadData]);

  const paginatonHandler = (size: number, page: number) => {
    loadData(size, page);
  };

  const filterData = (e: any) => {
    setSearchInput(e.target.value);
    loadData(PAGINATION_DEFAULT_SIZE, 0, e.target.value);
  };


  const openOrganizationById = (id: string) => {
    setShowDetails(true);
  };

  return (
    <>
      <h2>Organizations ({organizationCount})</h2>
      <Row className="my-4">
        <Col md={8} className="mb-2">
          <Button className="btn btn-primary float-end" onClick={handleShow}>
            Create
          </Button>
        </Col>
        <Col sm={12} md={4} className="order-md-first">
          <DebounceInput
            className="form-control"
            placeholder="Search"
            debounceTimeout={800}
            onChange={(e) => filterData(e)}
          />
        </Col>
      </Row>
      <hr className="my-4" />
      <div style={{ minHeight: "500px" }}>
        <OrganizationTable
          clickHandler={openOrganizationById}
          rows={organizationList !== undefined ? organizationList.content : []}
          head={columns}
        />
      </div>
      <Paginator
        totalPages={organizationList?.totalPages ?? 1}
        totalElements={organizationList?.totalElements ?? 0}
        page={organizationList?.pageable.pageNumber ?? 1}
        size={organizationList?.size ?? 10}
        paginationHandler={paginatonHandler}
      />
      {show && <CreateOrganization handleClose={handleClose} show={show} />}
      {showDetails && <CreateOrganization handleClose={handleClose} show={showDetails} />}
    </>
  );
};

export default Organization;
