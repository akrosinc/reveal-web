import React, { useState, useEffect } from "react";
import { Button, Table, Col, Row } from "react-bootstrap";
import { PageableModel } from "../../../../api/providers";
import { ActionDialog } from "../../../../components/Dialogs";
import Paginator from "../../../../components/Pagination";
import { PAGINATION_DEFAULT_SIZE } from "../../../../constants";
import { useAppDispatch } from "../../../../store/hooks";
import { formatDate } from "../../../../utils";
import { showLoader } from "../../../reducers/loader";
import { getBulkById, getBulkList } from "../../api";
import { BulkDetailsModel, UserBulk } from "../../providers/types";
import CreateBulk from "./create";
import BulkDetails from "./details";

const UserImport = () => {
  const [openCreate, setOpenCreate] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [bulkList, setBulkList] = useState<PageableModel<UserBulk>>();
  const [selectedBulk, setSelectedBulk] = useState<PageableModel<BulkDetailsModel>>();
  const [selectedBulkFile, setSelectedBulkFile] = useState<UserBulk>();
  const dispatch = useAppDispatch();

  const closeHandler = () => {
    setOpenCreate(false);
    setOpenDetails(false);
    getBulkList(10, 0).then((res) => {
      setBulkList(res);
    });
  };

  const paginationHandler = (size: number, page: number) => {
    if (openDetails && selectedBulkFile !== undefined) {
      dispatch(showLoader(true));
      getBulkById(size, page, selectedBulkFile.identifier).then((res) => {
        setSelectedBulk(res);
        setSelectedBulkFile(selectedBulkFile);
        dispatch(showLoader(false));
      });
    } else {
      getBulkList(size, page).then((res) => {
        setBulkList(res);
      });
    }
  };

  const openBulkById = (selectedFile: UserBulk) => {
    dispatch(showLoader(true));
    getBulkById(PAGINATION_DEFAULT_SIZE, 0, selectedFile.identifier).then((res) => {
      setSelectedBulk(res);
      setSelectedBulkFile(selectedFile);
      setOpenDetails(true);
      dispatch(showLoader(false));
    });
  };

  useEffect(() => {
    getBulkList(PAGINATION_DEFAULT_SIZE, 0).then((res) => {
      setBulkList(res);
    });
  }, []);

  return (
    <>
      <Row className="mt-2">
        <Col>
          <h2 className="m-0">Imported files ({bulkList?.totalElements})</h2>
        </Col>
        <Col>
          <Button className="float-end" onClick={() => setOpenCreate(true)}>
            Bulk import
          </Button>
        </Col>
      </Row>

      <hr className="my-4" />
      <Table bordered responsive>
        <thead className="border border-2">
          <tr>
            <th>File name</th>
            <th>Upload date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {bulkList?.content?.map((el) => (
            <tr onClick={() => openBulkById(el)} key={el.identifier}>
              <td>{el.filename}</td>
              <td>{formatDate(el.uploadDatetime)}</td>
              <td>{el.status}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      {bulkList !== undefined && bulkList.content.length > 0 ? (
        <Paginator
          totalElements={bulkList.totalElements}
          page={bulkList.pageable.pageNumber}
          size={bulkList.size}
          totalPages={bulkList.totalPages}
          paginationHandler={paginationHandler}
        />
      ) : null}
      {openCreate && (
        <ActionDialog
          backdrop={true}
          closeHandler={closeHandler}
          title="Import users"
          element={<CreateBulk handleClose={closeHandler} />}
        />
      )}
      {openDetails && selectedBulk !== undefined && (
        <BulkDetails
          userList={selectedBulk}
          bulkFile={selectedBulkFile}
          handleClose={closeHandler}
          paginationHandler={paginationHandler}
        />
      )}
    </>
  );
};

export default UserImport;
