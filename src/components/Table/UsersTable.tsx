import React, { useState } from "react";
import { Table } from "react-bootstrap";
import { BsArrowUpCircleFill, BsArrowDownCircleFill } from "react-icons/bs";
import { UserModel } from "../../features/user/providers/types";

interface Props {
  head: string[];
  rows: UserModel[];
  clickHandler?: (id: string) => void;
  sortHandler: (field: string, direction: boolean) => void;
}

const UsersTable = ({ head, rows, clickHandler, sortHandler }: Props) => {
  const [sortDirection, setSortDirection] = useState(false);
  const [activeSortField, setActiveSortField] = useState("");
  return (
    <>
      <Table bordered responsive>
        <thead className="border border-2">
          <tr>
            {head.map((el, index) => {
              return (
                <th
                  key={index}
                  onClick={() => {
                    setSortDirection(!sortDirection);
                    setActiveSortField(el);
                    sortHandler(el, sortDirection);
                  }}
                >
                  {el}
                  {activeSortField === el ? (
                    sortDirection ? (
                      <BsArrowDownCircleFill className="ms-2" />
                    ) : (
                      <BsArrowUpCircleFill className="ms-2" />
                    )
                  ) : null}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0
            ? rows.map((user, index) => {
                return (
                  <tr
                    key={index}
                    onClick={() => {
                      if (clickHandler !== undefined) {
                        clickHandler(user.identifier);
                      }
                    }}
                  >
                    <td>{user.userName}</td>
                    <td>{user.firstName}</td>
                    <td>{user.lastName}</td>
                    <td>
                      {user.organizations
                        .map((el) => el.name)
                        .sort()
                        .toString()}
                    </td>
                  </tr>
                );
              })
            : null}
        </tbody>
      </Table>
      {rows.length === 0 && <p className="text-center lead">No users found.</p>}
    </>
  );
};

export default UsersTable;
