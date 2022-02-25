import React, { useState } from 'react';
import { Table } from 'react-bootstrap';
import { useTable, useExpanded } from 'react-table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ROW_DEPTH_COLOR_1, ROW_DEPTH_COLOR_2, ROW_DEPTH_COLOR_3 } from '../../constants';

interface Props {
  columns: any;
  data: any;
  clickHandler: (id: string, el?: any) => void;
  sortHandler: (field: string, direction: boolean) => void;
  checkHandler: (id: string, checked: boolean) => void;
}

const LocationAssignmentsTable = ({ columns, data, clickHandler, sortHandler, checkHandler }: Props) => {
  const [sortDirection, setSortDirection] = useState(false);
  const [activeSortField, setActiveSortField] = useState('');

  const getColorLevel = (depth: number) => {
    if (depth === 0) {
      return '';
    } else if (depth === 1) {
      return ROW_DEPTH_COLOR_1;
    } else if (depth === 2) {
      return ROW_DEPTH_COLOR_2;
    } else {
      return ROW_DEPTH_COLOR_3;
    }
  };

  const mapRows = (row: any): object[] => {
    if (row.children !== undefined) {
      return row.children.map((el: any) => {
        return {
          identifier: el.identifier,
          children: el.children,
          active: el.active,
          properties: {
            name: el.properties.name,
            status: el.properties.status,
            externalId: el.properties.externalId,
            geographicLevel: el.properties.geographicLevel
          }
        };
      });
    } else {
      return [];
    }
  };

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns,
      data,
      getSubRows: (row: any) => mapRows(row),
      autoResetExpanded: false
    },
    useExpanded // Use the useExpanded plugin hook
  );

  return (
    <Table bordered responsive hover {...getTableProps()} className='mt-2'>
      <thead className="border border-2">
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th
                style={{ width: column.id === 'expander' ? '37px' : 'auto' }}
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
            //row.depth is not existing in react table types for some reason, casting to any type solves the issue
            <tr {...row.getRowProps()} style={{ backgroundColor: getColorLevel((row as any).depth) }}>
              {row.cells.map(cell => {
                let rowData = row.original as any;
                if (cell.column.id === 'checkbox') {
                  return (
                    <td className='text-center' key={(row.original as any).identifier}>
                      <input type='checkbox' checked={rowData.active} style={{height: '1.1em', width: '1.1em'}} onChange={e => {
                        checkHandler(rowData.identifier, e.target.checked);
                      }} />
                    </td>
                  );
                } else {
                  return (
                    <td
                      {...cell.getCellProps()}
                      onClick={() => {
                        if (cell.column.id !== 'expander') {
                          clickHandler(rowData.identifier, rowData);
                        }
                      }}
                    >
                      {cell.render('Cell')}
                    </td>
                  );
                }
              })}
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

export default LocationAssignmentsTable;
