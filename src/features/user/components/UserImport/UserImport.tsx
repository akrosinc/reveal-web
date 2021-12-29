import React, { useState, useEffect } from "react";
import { Button, Table, Col, Row } from "react-bootstrap";
import { PageableModel } from "../../../../api/providers";
import { ActionDialog } from "../../../../components/Dialogs";
import Paginator from "../../../../components/Pagination";
import { useAppDispatch } from "../../../../store/hooks";
import { showLoader } from "../../../reducers/loader";
import { getBulkById, getBulkList } from "../../api";
import { BulkDetailsModel, UserBulk } from "../../providers/types";
import CreateBulk from "./create";
import BulkDetails from "./details";

const UserImport = () => {
  const [openCreate, setOpenCreate] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [bulkList, setBulkList] = useState<PageableModel<UserBulk>>();
  const [selectedBulk, setSelectedBulk] = useState<BulkDetailsModel[]>();
  const [selectedBulkFile, setSelectedBulkFile] = useState<UserBulk>();
  const dispatch = useAppDispatch();

  const closeHandler = () => {
    setOpenCreate(false);
    setOpenDetails(false);
    getBulkList(10, 0).then((res) => {
      setBulkList(res);
    });
  };

  const openBulkById = (selectedFile: UserBulk) => {
    dispatch(showLoader(true));
    getBulkById(1000, 0, selectedFile.identifier).then((res) => {
      setSelectedBulk(res.content);
      setSelectedBulkFile(selectedFile);
      setOpenDetails(true);
      dispatch(showLoader(false));
    });
  };

  useEffect(() => {
    getBulkList(10, 0).then((res) => {
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
              <td>{el.uploadDatetime}</td>
              <td>{el.status}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Paginator paginationHandler={() => {}} page={bulkList?.number ?? 0} size={bulkList?.size ?? 0} totalElements={bulkList?.totalElements ?? 0} totalPages={bulkList?.totalPages ?? 0} />
      {openCreate && (
        <ActionDialog
          backdrop={true}
          closeHandler={closeHandler}
          title="Import users"
          element={<CreateBulk handleClose={closeHandler} />}
        />
      )}
      {openDetails && (
        <BulkDetails
          userList={selectedBulk ?? []}
          bulkFile={selectedBulkFile}
          handleClose={closeHandler}
        />
      )}
    </>
  );
};

export default UserImport;
