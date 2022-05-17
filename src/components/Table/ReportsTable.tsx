import React from 'react';
import { OverlayTrigger, Table, Tooltip } from 'react-bootstrap';
import { Column, useExpanded, useTable } from 'react-table';
import { RowData } from '../../features/reporting/providers/types';

interface Props {
  columns: Column[];
  data: any;
  clickHandler: (locationId: string, locationName: string) => void;
}

const ReportsTable = ({ columns, data, clickHandler }: Props) => {
  //rows, prepareRow
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns,
      data,
      autoResetExpanded: false
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
          let rowData = row.original as RowData;
          return (
            <tr
              {...row.getRowProps()}
              onClick={() => {
                clickHandler(rowData.locationIdentifier, rowData.locationName);
              }}
            >
              {row.cells.map(cell => {
                if (cell.column.id === 'locationName') {
                  return <td {...cell.getCellProps()}>{cell.render('Cell')}()</td>;
                } else {
                  let cellName = cell.column.Header?.toString();
                  if (cellName) {
                    let percentage = 0;
                    let color = '';
                    if (rowData.columnDataMap[cellName].isPercentage) {
                      //check if its already a percent number or should be calculated
                      percentage = Math.round(
                        rowData.columnDataMap[cellName].value * (rowData.columnDataMap[cellName].value > 1 ? 1 : 100)
                      );
                      if (percentage >= 90) {
                        color = 'bg-success';
                      }
                      if (percentage > 70 && percentage < 90) {
                        color = 'bg-warning';
                      }
                      if (percentage <= 70 && percentage >= 20) {
                        color = 'bg-danger';
                      }
                      if (percentage < 20) {
                        color = 'bg-light';
                      }
                    }
                    return rowData.columnDataMap[cellName].isPercentage ? (
                      <OverlayTrigger
                        {...cell.getCellProps()}
                        placement="top"
                        overlay={<Tooltip id="button-tooltip">{rowData.columnDataMap[cellName].meta}</Tooltip>}
                      >
                        <td className={color}>{percentage}%</td>
                      </OverlayTrigger>
                    ) : (
                      <td className={color} {...cell.getCellProps()}>
                        {rowData.columnDataMap[cellName].value}
                      </td>
                    );
                  } else {
                    return null;
                  }
                }
              })}
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

export default ReportsTable;
