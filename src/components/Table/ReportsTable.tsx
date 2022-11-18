import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { OverlayTrigger, Table, Tooltip } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { Column, useTable } from 'react-table';
import {
  REPORT_TABLE_PERCENTAGE_HIGH,
  REPORT_TABLE_PERCENTAGE_LOW,
  REPORT_TABLE_PERCENTAGE_MEDIUM
} from '../../constants';
import { ReportLocationProperties, ReportType } from '../../features/reporting/providers/types';
import { useAppSelector } from '../../store/hooks';
import {t} from "i18next";

interface Props {
  columns: Column[];
  data: any[];
  clickHandler: (locationId: string, locationName: string) => void;
  sortHandler: (sortDirection: boolean, columnName: string) => void;
}

const ReportsTable = ({ columns, data, clickHandler, sortHandler }: Props) => {
  const [totalValue, setTotalValue] = useState<number[]>([]);
  const { reportType } = useParams();

  // calculate total column from given data
  useEffect(() => {
    if (data.length) {
      const columnDataMapKeys = Object.keys(data[0].columnDataMap);
      const total = columnDataMapKeys.map(_ => {
        return 0;
      });
      data.forEach(el => {
        columnDataMapKeys.forEach((key, index) => {
          total[index] =
            (data[0].columnDataMap[key].isPercentage === null || data[0].columnDataMap[key].isPercentage === false) &&
            data[0].columnDataMap[key].dataType === 'double'
              ? total[index] + el.columnDataMap[key].value
              : '/';
        });
      });
      setTotalValue(total);
    }
  }, [data]);

  const isDarkMode = useAppSelector(state => state.darkMode.value);
  const [sortDirection, setCurrentSortDirection] = useState(false);
  const [sortDirectionField, setCurrentSortDirectionField] = useState('');
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data
  });
  return (
    <Table bordered hover {...getTableProps()} className="mt-2" variant={isDarkMode ? 'dark' : 'white'}>
      <thead className="bg-white" style={{ position: 'sticky', top: '0' }}>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => {
              const header = column.Header?.toString();
              if (header) {
                return (
                  <th
                    onClick={() => {
                      sortHandler(!sortDirection, header);
                      setCurrentSortDirection(!sortDirection);
                      setCurrentSortDirectionField(header);
                    }}
                    {...column.getHeaderProps()}
                  >
                    {column.render('Header')}
                    {sortDirectionField === header ? (
                      sortDirection ? (
                        <FontAwesomeIcon className="ms-2" icon="sort-up" />
                      ) : (
                        <FontAwesomeIcon className="ms-2" icon="sort-down" />
                      )
                    ) : (
                      <FontAwesomeIcon className="ms-2" icon="sort" />
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
          let rowData = row.original as ReportLocationProperties;
          return (
            <tr
              {...row.getRowProps()}
              onClick={() => {
                clickHandler(rowData.id, rowData.name);
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
                      if (percentage >= REPORT_TABLE_PERCENTAGE_MEDIUM && percentage < REPORT_TABLE_PERCENTAGE_HIGH) {
                        color = 'bg-yellow';
                      }
                      if (percentage >= REPORT_TABLE_PERCENTAGE_LOW && percentage < REPORT_TABLE_PERCENTAGE_MEDIUM) {
                        color = 'bg-warning';
                      }
                      if (percentage >= 0 && percentage < REPORT_TABLE_PERCENTAGE_LOW) {
                        color = 'bg-danger';
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
                    } else if (
                      cellName === 'Structure Status' &&
                      (reportType === ReportType.IRS_FULL_COVERAGE ||
                        reportType === ReportType.IRS_LITE_COVERAGE ||
                        reportType === ReportType.IRS_LITE_COVERAGE_OPERATIONAL_AREA_LEVEL)
                    ) {
                      return (
                        <td {...cell.getCellProps()}>
                          {rowData.columnDataMap[cellName].value === 'Complete'
                            ? 'Sprayed'
                            : rowData.columnDataMap[cellName].value}
                        </td>
                      );
                    }
                    return (
                      //convert number to locale string for 1000 separator
                      <td className={color} {...cell.getCellProps()}>
                        {rowData.columnDataMap[cellName].value !== null
                          ? rowData.columnDataMap[cellName].value.toLocaleString()
                          : rowData.columnDataMap[cellName].value}
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
        {totalValue.length > 0 && (
          <tr>
            <td>
              <b>{t('reportPage.table.total')}</b>
            </td>
            {totalValue.map((el, index) => {
              return <td key={index}>{el.toLocaleString()}</td>;
            })}
          </tr>
        )}
      </tbody>
    </Table>
  );
};

export default ReportsTable;
