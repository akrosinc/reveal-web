import React, { useEffect, useState } from "react";
import { Button, Col, Row } from "react-bootstrap";
import { useNavigate } from "react-router";
import UsersTable from "../../../../components/Table/UsersTable";
import { UserModel } from "../../../user/providers/types";
import { getUserList } from "../../../user/api";
import { useAppDispatch } from "../../../../store/hooks";
import { showError } from "../../../reducers/tostify";
import Paginator from "../../../../components/Pagination/Paginator";
import { DebounceInput } from "react-debounce-input";
import CreateUser from "./create/CreateUser";
import CreateBulk from "./create/CreateBulk";

const tableRowNames = ["Username", "First Name", "Last Name", "Organization"];

const Users = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [userList, setUserList] = useState<UserModel[]>([]);
  const [show, setShow] = useState(false);
  const [openBulk, setOpenBulk] = useState(false);
  const handleClose = () => {
    setShow(false)
    getUserList().then(res => {
      setUserList(res.content);
    })
  };
  const handleShow = (bulk: boolean) => {
    setOpenBulk(bulk);
    setShow(true);
  };

  useEffect(() => {
    getUserList()
      .then((res) => {
        setUserList(res.content);
      })
      .catch((error) => {
        dispatch(
          showError(
            error.response !== undefined ? error.response.data.message : null
          )
        );
      })
      .finally(() => {
        dispatch(showError(false));
      });
  }, [dispatch]);

  const filterData = (e: any) => {
    getUserList(e.target.value).then((res) => {
      setUserList(res.content);
    });
  };

  const openUserById = (id: string) => {
    navigate("user/edit/" + id);
  };

  return (
    <>
      <Row className="my-4">
        <Col sm={4} md={6}>
          <h2>Users ({userList.length})</h2>
        </Col>
        <Col sm={8} md={6}>
          <Button
            className="btn btn-primary float-sm-end"
            onClick={() => handleShow(false)}
          >
            Create
          </Button>
          <Button
            className="btn btn-primary mx-2 float-sm-end"
            role="button"
            onClick={() => handleShow(true)}
          >
            Bulk import
          </Button>
        </Col>
      </Row>
      <Col sm={12} md={4}>
      <DebounceInput
        className="form-control"
        placeholder="Search"
        debounceTimeout={800}
        onChange={(e) => filterData(e)}
      />
      </Col>
      <hr className="my-4" />
      <UsersTable
        head={tableRowNames}
        rows={userList}
        clickHandler={openUserById}
      />
      <Paginator />
      {openBulk ? <CreateBulk show={show} handleClose={handleClose} /> : <CreateUser show={show} handleClose={handleClose} />}
    </>
  );
};

export default Users;
