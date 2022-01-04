import React, { useState } from "react";
import { Table } from "react-bootstrap";
import { USER_TABLE_COLUMNS } from "../../constants";
import { UserModel } from "../../features/user/providers/types";

interface Props {
  rows: UserModel[];
  clickHandler?: (id: string) => void;
  sortHandler: (field: string, direction: boolean) => void;
}

const UsersTable = ({ rows, clickHandler, sortHandler }: Props) => {
  const [sortDirection, setSortDirection] = useState(false);
  const [activeSortField, setActiveSortField] = useState("");
  return (
      rows.length === 0 ? (
        <p className="text-center lead">No users found.</p>
      ) : (
        <Table bordered responsive>
          <thead className="border border-2">
            <tr>
              {USER_TABLE_COLUMNS.map((el, index) => {
                return (
                  <th
                    key={index}
                    onClick={() => {
                      if (el.sortValue !== "organization") {
                        setSortDirection(!sortDirection);
                        setActiveSortField(el.name);
                        sortHandler(el.sortValue, sortDirection);
                      }
                    }}
                  >
                    {el.name}
                    {activeSortField === el.name
                      ? sortDirection
                        ? " ▲"
                        : " ▼"
                      : null}
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
                      <td>{user.username}</td>
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
      )
  );
};

export default UsersTable;
