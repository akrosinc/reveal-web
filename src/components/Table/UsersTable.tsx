import React from "react";
import { Table } from "react-bootstrap";
import { UserModel } from "../../features/user/providers/types";

interface Props {
  head: string[];
  rows: UserModel[];
  clickHandler?: (id: string) => void;
}

const UsersTable = ({ head, rows, clickHandler }: Props) => {
  return (
    <>
      <Table bordered responsive>
        <thead className="border border-2">
          <tr>
            {head.map((el, index) => {
              return <th key={index}>{el}</th>;
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
