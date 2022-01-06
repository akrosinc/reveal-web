import React, { useState } from 'react';
import { Table } from 'react-bootstrap';
import { ORGANIZATION_TABLE_COLUMNS } from '../../constants';
import { OrganizationModel } from '../../features/organization/providers/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface Props {
  rows: OrganizationModel[];
  clickHandler: (id: string) => void;
  sortHandler: (field: string, direction: boolean) => void;
}

const OrganizationTable = ({ rows, clickHandler, sortHandler }: Props) => {
  const [sortDirection, setSortDirection] = useState(false);
  const [activeSortField, setActiveSortField] = useState('');

  const getChildren = (children: OrganizationModel[], ident: number): any => {
    if (children !== undefined && children.length > 0) {
      return children.map(row => {
        return [
          <tr
            key={row.identifier}
            onClick={() => {
              clickHandler(row.identifier);
            }}
          >
            <td>
              <span style={{ paddingLeft: ident.toString() + 'px' }}>{row.name}</span>
            </td>
            <td>{row.type.valueCodableConcept}</td>
            <td>{row.active.toString()}</td>
          </tr>,
          ...getChildren(row.headOf, ident + 20)
        ];
      });
    } else {
      return [];
    }
  };

  return rows.length === 0 ? (
    <p className="text-center lead">No organizations found.</p>
  ) : (
    <Table bordered responsive hover>
      <thead className="border border-2">
        <tr>
          {ORGANIZATION_TABLE_COLUMNS.map((el, index) => {
            return (
              <th
                key={index}
                onClick={() => {
                  setSortDirection(!sortDirection);
                  setActiveSortField(el.name);
                  sortHandler(el.sortValue, sortDirection);
                }}
              >
                {el.name}
                {activeSortField === el.name ? (
                  sortDirection ? (
                    <FontAwesomeIcon className="ms-1" icon="sort-up" />
                  ) : (
                    <FontAwesomeIcon className="ms-1" icon="sort-down" />
                  )
                ) : (
                  <FontAwesomeIcon className="ms-1" icon="sort" />
                )}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {rows.map(row => {
          return [
            <tr
              key={row.identifier}
              onClick={() => {
                clickHandler(row.identifier);
              }}
            >
              <td>
                <span style={{ paddingLeft: '10px', fontWeight: 'bold' }}>{row.name}</span>
              </td>
              <td>{row.type.valueCodableConcept}</td>
              <td>{row.active.toString()}</td>
            </tr>,
            ...getChildren(row.headOf, 20)
          ];
        })}
      </tbody>
    </Table>
  );
};

export default OrganizationTable;
