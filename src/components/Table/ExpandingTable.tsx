import React, { useState } from 'react';
import { Table, FormCheck } from 'react-bootstrap';
import { useTable, useExpanded, Column } from 'react-table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ROW_DEPTH_COLOR_1, ROW_DEPTH_COLOR_2, ROW_DEPTH_COLOR_3 } from '../../constants';
import { useAppSelector } from '../../store/hooks';
import { useTranslation } from 'react-i18next';

interface Props {
  columns: any;
  data: any;
  clickHandler: (id: string) => void;
  sortHandler: (field: string, direction: boolean) => void;
}

const ExpandingTable = ({ columns, data, clickHandler, sortHandler }: Props) => {
  const [sortDirection, setSortDirection] = useState(false);
  const [activeSortField, setActiveSortField] = useState('');
  const isDarkMode = useAppSelector(state => state.darkMode.value);
  const { t } = useTranslation();
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
    if (row.headOf !== undefined) {
      return row.headOf.map((el: any) => {
        return {
          name: el.name,
          identifier: el.identifier,
          active: el.active.toString(),
          headOf: el.headOf,
          type: el.type.valueCodableConcept
        };
      });
    } else if (row.children !== undefined && row.children.length > 0) {
      return row.children.map((el: any) => {
        return {
          identifier: el.identifier,
          children: el.children,
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

  const checkColumn = (column?: Column<object>) => {
    if (column) {
      if (
        typeof column.Header !== 'function' &&
        column.Header !== null &&
        column.Header !== undefined &&
        column.Header.toString() !== ''
      ) {
        return true;
      }
    }
    return false;
  };

  return (
    <Table bordered responsive hover {...getTableProps()} variant={isDarkMode ? 'dark' : 'white'}>
      <thead className="border border-2">
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th
                id={column.id + '-sort'}
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
                {checkColumn(column)
                  ? t('reportPage.table.' + column.Header?.toString(), column.Header?.toString())
                  : ''}
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
        {rows.map(row => {
          prepareRow(row);
          return (
            //row.depth is not existing in react table types for some reason, casting to any type solves the issue
            <tr {...row.getRowProps()} style={{ backgroundColor: getColorLevel((row as any).depth) }}>
              {row.cells.map(cell => {
                const cellData = cell.row.original as any;
                if (cell.column.id === 'active') {
                  return (
                    <td
                      id={cell.column.id + 'click-handler'}
                      {...cell.getCellProps()}
                      onClick={() => {
                        if (cell.column.id !== 'expander') {
                          clickHandler(cellData.identifier);
                        }
                      }}
                    >
                      <FormCheck disabled checked={cellData.active === 'true'} />
                    </td>
                  );
                } else {
                  return (
                    <td
                      id={cell.column.id + 'click-handler'}
                      {...cell.getCellProps()}
                      onClick={() => {
                        if (cell.column.id !== 'expander') {
                          let col = row.original as any;
                          clickHandler(col.identifier);
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

export default ExpandingTable;
