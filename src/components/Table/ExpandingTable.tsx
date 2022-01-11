import React, { useState } from 'react';
import { Table } from 'react-bootstrap';
import { useTable, useExpanded } from 'react-table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { OrganizationModel } from '../../features/organization/providers/types';

interface Props {
  columns: any;
  data: any;
  clickHandler: (id: string) => void;
  sortHandler: (field: string, direction: boolean) => void;
}

const ExpandingTable = ({ columns, data, clickHandler, sortHandler }: Props) => {
  const [sortDirection, setSortDirection] = useState(false);
  const [activeSortField, setActiveSortField] = useState('');
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns,
      data,
      getSubRows: (row: any) => row.headOf !== undefined ? row.headOf.map((el: any) => {
        return {
          name: el.name,
          identifier: el.identifier,
          active: el.active.toString(),
          headOf: el.headOf,
          type: el.type.valueCodableConcept
        }
      }) : [],
    },
    useExpanded // Use the useExpanded plugin hook
  );
  return (
    <Table bordered responsive hover {...getTableProps()}>
      <thead className="border border-2">
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th
                style={{width: column.id === "expander" ? '37px' : 'auto'}}
                onClick={() => {
                  if (column.id !== 'expander') {
                    setSortDirection(!sortDirection);
                    setActiveSortField(column.Header?.toString() ?? '');
                    sortHandler(column.id, sortDirection);
                  }
                }}
                {...column.getHeaderProps()}
              >
                {column.render('Header')}
                {activeSortField === column.render('Header') ? (
                  sortDirection ? (
                    <FontAwesomeIcon className="ms-1" icon="sort-up" />
                  ) : (
                    <FontAwesomeIcon className="ms-1" icon="sort-down" />
                  )
                ) : column.id !== 'expander' ? (
                  <FontAwesomeIcon className="ms-1" icon="sort" />
                ) : null}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => {
                return <td {...cell.getCellProps()}
                onClick={() => {
                    if(cell.column.id !== "expander") {
                        let organization = row.original as OrganizationModel;
                        clickHandler(organization.identifier);
                    }
                  }}
                >{cell.render('Cell')}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

export default ExpandingTable;
