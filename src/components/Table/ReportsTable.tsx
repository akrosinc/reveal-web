import React from 'react';
import { Table } from 'react-bootstrap';
import { Column, useExpanded, useTable } from 'react-table';

interface Props {
  columns: Column[];
  data: any;
}

const ReportsTable = ({ columns, data }: Props) => {
  //rows, prepareRow
  const { getTableProps, getTableBodyProps, headerGroups } = useTable(
    {
      columns,
      data,
      getSubRows: (row: any) => row,
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
      <tbody {...getTableBodyProps()}></tbody>
    </Table>
  );
};

export default ReportsTable;
