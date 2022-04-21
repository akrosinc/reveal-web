import React from 'react';
import { Form, Table } from 'react-bootstrap';
import { useTable, useExpanded, Column } from 'react-table';
import { ROW_DEPTH_COLOR_1, ROW_DEPTH_COLOR_2, ROW_DEPTH_COLOR_3 } from '../../constants';
import Select, { Options, MultiValue } from 'react-select';

interface Option {
  value: string;
  label: string;
}

interface Props {
  columns: Column[];
  data: any;
  clickHandler?: (id: string, el?: any) => void;
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
  checkHandler,
  organizationList,
  teamTab
}: Props) => {
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
      initialState: { hiddenColumns: [teamTab ? 'checkbox' : 'teams'] }
    },
    useExpanded // Use the useExpanded plugin hook
  );

  return (
    <Table bordered responsive hover {...getTableProps()} className="mt-2 bg-white">
      <thead className="border border-2">
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th style={{ width: column.id === 'expander' ? '37px' : 'auto' }} {...column.getHeaderProps()}>
                {column.render('Header')}
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
                        id={rowData.identifier + '-checkbox'}
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
                    <td {...cell.getCellProps()} style={{ minWidth: '250px' }}>
                      <Select
                        id={rowData.identifier + '-select'}
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
                } else if (cell.column.id === 'location') {
                  return (
                    <td
                      className="align-middle"
                      {...cell.getCellProps()}
                      onClick={() => {
                        if (cell.column.id !== 'expander' && teamTab && clickHandler) {
                          clickHandler(rowData.identifier, rowData);
                        }
                      }}
                    >
                      {cell.render('Cell')} {rowData.children.length > 0 ? `(${rowData.children.lengh})` : ''}
                    </td>
                  );
                } else {
                  return (
                    <td
                      id={rowData.identifier + '-row-click'}
                      className="align-middle"
                      {...cell.getCellProps()}
                      onClick={() => {
                        if (cell.column.id !== 'expander' && teamTab && clickHandler) {
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
