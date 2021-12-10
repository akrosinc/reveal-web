import React, { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { USER_MANAGEMENT_ORGANIZATION_CREATE } from "../../../../constants";
import { getOrganizationList } from "../../../organization/api";
import { OrganizationModel } from "../../../organization/providers/types";
import MaterialTable, { Column } from "@material-table/core";

const columns: Array<Column<OrganizationModel>> = [
  { title: "Name", field: "name" },
  { title: "Type", field: "type.valueCodableConcept" },
  { title: "Active", field: "active" },
];

const Organization = () => {
  const [organizationList, setOrganizationList] = useState<OrganizationModel[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    getOrganizationList().then((res) => {
      console.log(res);
      setOrganizationList(res.content);
    });
  }, []);

  const openOrganizationById = (id?: string) => {
    if (id !== undefined) {
      navigate("organization/" + id);
    }
  };

  return (
    <>
      <Row className="my-4">
        <Col>
          <h2>Organizations ({organizationList.length})</h2>
        </Col>
        <Col>
          <Link
            className="btn btn-primary float-end"
            role="button"
            to={USER_MANAGEMENT_ORGANIZATION_CREATE}
          >
            Create
          </Link>
        </Col>
      </Row>
      <hr className="my-4" />
      <MaterialTable
        options={{
          overflowY: "auto",
          minBodyHeight: "500px",
          maxBodyHeight: "500px"
        }}
        columns={columns}
        data={organizationList}
        onRowClick={(evt, rowData) => {
          openOrganizationById(rowData?.identifier);
        }}
        parentChildData={(row, rows) =>
          rows.find((childRow) => childRow.identifier === row.partOf)
        }
      />
    </>
  );
};

export default Organization;
