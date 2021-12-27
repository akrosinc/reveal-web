import React, { useCallback, useEffect, useState } from "react";
import { Button, Col, Row } from "react-bootstrap";
import UsersTable from "../../../../components/Table/UsersTable";
import { UserModel } from "../../../user/providers/types";
import { getUserList } from "../../../user/api";
import { useAppDispatch } from "../../../../store/hooks";
import Paginator from "../../../../components/Pagination";
import { DebounceInput } from "react-debounce-input";
import CreateUser from "./create/CreateUser";
import EditUser from "./edit/EditUser";
import { ActionDialog } from "../../../../components/Dialogs";
import { showLoader } from "../../../reducers/loader";
import { PAGINATION_DEFAULT_SIZE } from "../../../../constants";
import { toast } from "react-toastify";
import { PageableModel, ErrorModel } from "../../../../api/providers";

const tableRowNames = ["Username", "First Name", "Last Name", "Organization"];

const Users = () => {
  const dispatch = useAppDispatch();
  const [userList, setUserList] = useState<PageableModel<UserModel>>();
  const [show, setShow] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [userId, setUserId] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const handleClose = () => {
    setShow(false);
    setShowEdit(false);
    getUserList(PAGINATION_DEFAULT_SIZE, 0).then((res) => {
      setUserList(res);
    });
  };
  const handleShow = () => {
    setShow(true);
  };

  const loadData = useCallback(
    (size: number, page: number, searchData?: string) => {
      dispatch(showLoader(true));
      getUserList(
        size,
        page,
        searchData !== undefined ? searchData : searchInput
      )
        .then((res) => {
          setUserList(res);
        })
        .catch((error: ErrorModel) => {
          toast.error(error.data !== undefined ? error.data.message : error.toString());
        })
        .finally(() => {
          dispatch(showLoader(false));
        });
    },
    [dispatch, searchInput]
  );

  useEffect(() => {
    loadData(PAGINATION_DEFAULT_SIZE, 0);
  }, [loadData]);

  const filterData = (e: any) => {
    setSearchInput(e.target.value);
    loadData(PAGINATION_DEFAULT_SIZE, 0, e.target.value);
  };

  const paginatonHandler = (size: number, page: number) => {
    loadData(size, page);
  };

  const openUserById = (id: string) => {
    setUserId(id);
    setShowEdit(true);
  };

  return (
    <>
      <h2>Users ({userList?.totalElements})</h2>
      <Row className="my-4">
        <Col md={8} className="mb-2">
          <Button
            className="btn btn-primary float-end"
            onClick={() => handleShow()}
          >
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
      <UsersTable
        head={tableRowNames}
        rows={userList?.content ?? []}
        clickHandler={openUserById}
      />
      {userList !== undefined && userList.content.length > 0 ? (
        <Paginator
          totalElements={userList.totalElements}
          page={userList.pageable.pageNumber}
          size={userList.size}
          totalPages={userList.totalPages}
          paginationHandler={paginatonHandler}
        />
      ) : null}
      {show && <CreateUser show={show} handleClose={handleClose} />}
      {showEdit && (
        <ActionDialog
          backdrop={true}
          closeHandler={handleClose}
          element={
            <EditUser
              handleClose={handleClose}
              userId={userId}
            />
          }
          title="User details"
        />
      )}
    </>
  );
};

export default Users;
