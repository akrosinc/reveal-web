import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { OverlayTrigger, Table, Tooltip } from 'react-bootstrap';
import { Column, useTable } from 'react-table';
import {
  REPORT_TABLE_PERCENTAGE_HIGH,
  REPORT_TABLE_PERCENTAGE_LOW,
  REPORT_TABLE_PERCENTAGE_MEDIUM
} from '../../constants';
import { RowData } from '../../features/reporting/providers/types';

interface Props {
  columns: Column[];
  data: any[];
  clickHandler: (locationId: string, locationName: string, childrenNumber: number) => void;
  sortHandler: (sortDirection: boolean) => void;
}

const ReportsTable = ({ columns, data, clickHandler, sortHandler }: Props) => {
  const [sortDirection, setCurrentSortDirection] = useState(false);
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data
  });
  return (
    <Table bordered responsive hover {...getTableProps()} className="mt-2 bg-white">
      <thead className="border border-2">
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => {
              if (column.Header?.toString() === 'Distribution Coverage') {
                return (
                  <th
                    onClick={() => {
                      sortHandler(!sortDirection);
                      setCurrentSortDirection(!sortDirection);
                    }}
                    {...column.getHeaderProps()}
                  >
                    {column.render('Header')}
                    {sortDirection ? (
                      <FontAwesomeIcon className="ms-2" size="lg" icon="sort-up" />
                    ) : (
                      <FontAwesomeIcon className="ms-2" size="lg" icon="sort-down" />
                    )}
                  </th>
                );
              } else {
                return <th {...column.getHeaderProps()}>{column.render('Header')}</th>;
              }
            })}
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
                clickHandler(rowData.locationIdentifier, rowData.locationName, rowData.childrenNumber);
              }}
            >
              {row.cells.map(cell => {
                if (cell.column.id === 'locationName') {
                  return (
                    <td {...cell.getCellProps()}>
                      {cell.render('Cell')}
                      {rowData.childrenNumber ? `(${rowData.childrenNumber})` : ''}
                    </td>
                  );
                } else {
                  let cellName = cell.column.Header?.toString();
                  if (cellName) {
                    let color = '';
                    if (rowData.columnDataMap[cellName].isPercentage) {
                      let percentage = rowData.columnDataMap[cellName].value;
                      percentage = Number(percentage.toFixed(percentage > 1 ? 2 : 3));
                      //check if its already a round number or should be rounded
                      if (percentage >= REPORT_TABLE_PERCENTAGE_HIGH) {
                        color = 'bg-success';
                      }
                      if (percentage > REPORT_TABLE_PERCENTAGE_MEDIUM && percentage < REPORT_TABLE_PERCENTAGE_HIGH) {
                        color = 'bg-warning';
                      }
                      if (percentage <= REPORT_TABLE_PERCENTAGE_MEDIUM && percentage >= REPORT_TABLE_PERCENTAGE_LOW) {
                        color = 'bg-danger';
                      }
                      if (percentage < REPORT_TABLE_PERCENTAGE_LOW && percentage > 0) {
                        color = 'bg-secondary';
                      }
                      if (percentage === 0) {
                        color = 'bg-light';
                      }
                      return (
                        <OverlayTrigger
                          {...cell.getCellProps()}
                          placement="top"
                          overlay={<Tooltip id="meta-tooltip">{rowData.columnDataMap[cellName].meta}</Tooltip>}
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
