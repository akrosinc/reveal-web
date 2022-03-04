import React, { useState } from 'react';
import { Form, Table } from 'react-bootstrap';
import { useTable, useExpanded } from 'react-table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ROW_DEPTH_COLOR_1, ROW_DEPTH_COLOR_2, ROW_DEPTH_COLOR_3 } from '../../constants';
import Select, { Options, MultiValue } from 'react-select';

interface Option {
  value: string;
  label: string;
}

interface Props {
  columns: any;
  data: any;
  clickHandler: (id: string, el?: any) => void;
  sortHandler: (field: string, direction: boolean) => void;
  checkHandler: (id: string, checked: boolean) => void;
  selectHandler: (id: string, selectedTeams: MultiValue<Option>) => void;
  organizationList: Options<Option>;
  teamTab: boolean;
}

const LocationAssignmentsTable = ({
  columns,
  data,
  clickHandler,
  selectHandler,
  sortHandler,
  checkHandler,
  organizationList,
  teamTab
}: Props) => {
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
          teams: el.teams,
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
      autoResetExpanded: false,
      initialState: {hiddenColumns: [teamTab ? '' : 'teams']},
    },
    useExpanded // Use the useExpanded plugin hook
  );

  return (
    <Table bordered responsive hover {...getTableProps()} className="mt-2">
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
                ) : column.id !== 'expander' && column.id !== 'checkbox' && column.id !== 'teams' ? (
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
                    <td {...cell.getCellProps()} className="text-center align-middle">
                      <Form.Check
                        disabled={teamTab}
                        checked={rowData.active}
                        onChange={e => {
                          checkHandler(rowData.identifier, e.target.checked);
                        }}
                      />
                    </td>
                  );
                } else if (cell.column.id === 'teams' && rowData.active) {
                  return (
                    <td {...cell.getCellProps()}>
                      <Select
                        menuPosition="fixed"
                        isMulti
                        options={organizationList}
                        value={
                          rowData.teams !== undefined
                            ? rowData.teams.map((el: any) => {
                                return {
                                  value: el.identifier,
                                  label: el.name
                                };
                              })
                            : []
                        }
                        onChange={selected => selectHandler(rowData.identifier, selected)}
                      />
                    </td>
                  );
                } else {
                  return (
                    <td
                      className="align-middle"
                      {...cell.getCellProps()}
                      onClick={() => {
                        if (cell.column.id !== 'expander' && teamTab) {
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
