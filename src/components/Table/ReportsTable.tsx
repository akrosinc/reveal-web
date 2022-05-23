import React from 'react';
import { OverlayTrigger, Table, Tooltip } from 'react-bootstrap';
import { Column, useTable } from 'react-table';
import { REPORT_TABLE_PERCENTAGE_HIGH, REPORT_TABLE_PERCENTAGE_LOW, REPORT_TABLE_PERCENTAGE_MEDIUM } from '../../constants';
import { RowData } from '../../features/reporting/providers/types';

interface Props {
  columns: Column[];
  data: any;
  clickHandler: (locationId: string, locationName: string) => void;
}

const ReportsTable = ({ columns, data, clickHandler }: Props) => {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data
  });
  return (
    <Table bordered responsive hover {...getTableProps()} className="mt-2 bg-white">
      <thead className="border border-2">
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps()}>
                {column.render('Header')}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map(row => {
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
                  return (
                    <td {...cell.getCellProps()}>
                      {cell.render('Cell')}{rowData.childrenNumber ? `(${rowData.childrenNumber})` : ''}
                    </td>
                  );
                } else {
                  let cellName = cell.column.Header?.toString();
                  if (cellName) {
                    let percentage = 0;
                    let color = '';
                    if (rowData.columnDataMap[cellName].isPercentage) {
                      //check if its already a round number or should be rounded
                      percentage = Math.round(
                        rowData.columnDataMap[cellName].value * (rowData.columnDataMap[cellName].value > 1 ? 1 : 100)
                      );
                      if (percentage >= REPORT_TABLE_PERCENTAGE_HIGH) {
                        color = 'bg-success';
                      }
                      if (percentage > REPORT_TABLE_PERCENTAGE_MEDIUM && percentage < REPORT_TABLE_PERCENTAGE_HIGH) {
                        color = 'bg-warning';
                      }
                      if (percentage <= REPORT_TABLE_PERCENTAGE_MEDIUM && percentage >= REPORT_TABLE_PERCENTAGE_LOW) {
                        color = 'bg-danger';
                      }
                      if (percentage < REPORT_TABLE_PERCENTAGE_LOW) {
                        color = 'bg-secondary';
                      }
                      if (percentage === 0) {
                        color = 'bg-light';
                      }
                      return (
                        <OverlayTrigger
                          {...cell.getCellProps()}
                          placement="top"
                          overlay={<Tooltip id="button-tooltip">{rowData.columnDataMap[cellName].meta}</Tooltip>}
                        >
                          <td className={color}>{percentage}%</td>
                        </OverlayTrigger>
                      );
                    }
                    return (
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
