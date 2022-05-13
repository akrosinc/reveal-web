import React from 'react';
import { Table } from 'react-bootstrap';
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
            prepareRow(row)
            let rowData = row.original as RowData;
            return (
              <tr {...row.getRowProps()} onClick={() => {
                clickHandler(rowData.locationIdentifier, rowData.locationName);
              }}>
                {row.cells.map(cell => {
                  if (cell.column.id !== 'locationName') {
                    let cellName = cell.column.Header?.toString();
                    if (cellName) {                   
                    return <td {...cell.getCellProps()}>{rowData.columnDataMap[cellName].value}{rowData.columnDataMap[cellName].isPercentage ? '%' : ''}</td>
                    } else {
                      return null
                    }
                  } else {
                    return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  }
                })}
              </tr>
            )
          })}
      </tbody>
    </Table>
  );
};

export default ReportsTable;
