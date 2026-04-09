import React, { ChangeEvent } from 'react';
import { FormCheck, Table } from 'react-bootstrap';
import { useTable, Column } from 'react-table';
import { ComplexTagResponse } from '../../../api/instanceAPI';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../../store/hooks';

interface Props {
  data: ComplexTagResponse[];
  selectedComplexTags: number[];
  onSelectionChange: (id: number, selected: boolean) => void;
  viewOnly?: boolean;
}

const ComplexTagTable: React.FC<Props> = ({ data, selectedComplexTags, onSelectionChange, viewOnly }) => {
  const isDarkMode = useAppSelector((state: any) => state.darkMode.value);
  const { t } = useTranslation();

  const columns = React.useMemo<Column<ComplexTagResponse>[]>(
    () => [
      {
        Header: '',
        id: 'selected',
        Cell: ({ row }: { row: any }) => (
          row.original.isPublic ? (
            <FormCheck
              checked={selectedComplexTags.includes(row.original.id)}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onSelectionChange(row.original.id, e.target.checked)}
              disabled={viewOnly}
            />
          ) : null
        ),
      },
      { Header: 'ID', accessor: 'id' },
      { Header: 'Tag Name', accessor: 'tagName' },
      { Header: 'Formula', accessor: 'formula' },
      { Header: 'Public', accessor: 'isPublic', Cell: ({ value }: any) => (value ? 'Yes' : 'No') },
      { Header: 'Owner', accessor: 'owner' },
    ],
    [selectedComplexTags, onSelectionChange, viewOnly]
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data,
  });

  return (
    <Table bordered responsive hover {...getTableProps()} variant={isDarkMode ? 'dark' : 'white'}>
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
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => (
                <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

export default ComplexTagTable;
