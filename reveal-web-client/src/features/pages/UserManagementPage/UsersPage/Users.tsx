import React, { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router";
import UsersTable from "../../../../components/Table/UsersTable";
import { USER_MANAGEMENT_USER_CREATE } from "../../../../constants";
import { UserModel } from "../../../user/providers/types";
import { getUserList } from "../../../user/api";

//Mocking data for now
const tableRowNames = ["Username", "First Name", "Last Name", "Organization"];  

const Users = () => {
  const navigate = useNavigate();
  const [userList, setUserList] = useState<UserModel[]>([]);
  const [apiData, setApiData] = useState<UserModel[]>([]);

  useEffect(() => {
    getUserList().then(res => {
      setUserList(res);
      setApiData(res);
    })
  })

  const filterData = (e: any) => {
    const flitered = apiData.filter((el) => {
      
      return el.username.toLowerCase().includes(e.target.value.toLowerCase());
      
    })
    setUserList([...flitered]);
  }

  const openUserById = (id: string) => {
    navigate("user/edit/" + id);
  };
  return (
    <>
      <Row className="my-4">
        <Col>
          <h2>Users ({userList.length})</h2>
        </Col>
        <Col>
          <Link
            className="btn btn-primary float-end"
            role="button"
            to={USER_MANAGEMENT_USER_CREATE}
          >
            Create
          </Link>
        </Col>
      </Row>
      <input className="form-control w-25" placeholder="Search" onChange={(e) => {
        filterData(e);
      }}></input>
      <hr className="my-4" />
      <UsersTable
        head={tableRowNames}
        rows={userList}
        clickHandler={openUserById}
      />
    </>
  );
};

export default Users;
