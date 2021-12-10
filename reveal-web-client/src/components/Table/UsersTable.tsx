import React from 'react';
import { Table } from 'react-bootstrap';
import { UserModel } from '../../features/user/providers/types';

interface Props {
    head: string[],
    rows: UserModel[],
    clickHandler?: (id: string) => void
}

const UsersTable = ({head, rows, clickHandler}: Props) => {
    return (
        <Table bordered>
        <thead className="border border-2">
          <tr>
            {head.map((el, index) => {
                return <th key={index}>{el}</th>
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((user, index) => {
              return <tr key={index} onClick={() => {
                if (clickHandler !== undefined) {
                  clickHandler(user.identifier);
                }
              }}>
                  <td>{user.username}</td>
                  <td>{user.firstName}</td>
                  <td>{user.lastName}</td>
                  <td>{user.organization}</td>
              </tr>
          })}
        </tbody>
      </Table>
    )
}

export default UsersTable