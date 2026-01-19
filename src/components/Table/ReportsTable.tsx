import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import React, {useEffect, useState} from 'react';
import {Col, OverlayTrigger, Row as BootRow, Table, Tooltip} from 'react-bootstrap';
import {useParams} from 'react-router-dom';
import {Column, Row, useTable} from 'react-table';
import {ReportLocationProperties, ReportType} from '../../features/reporting/providers/types';
import {useAppSelector} from '../../store/hooks';
import {useTranslation} from 'react-i18next';
import Container from "react-bootstrap/Container";

interface Props {
  columns: Column[];
  data: any[];
  clickHandler: (locationId: string, locationName: string) => void;
  sortHandler: (sortDirection: boolean, columnName: string) => void;
  rangeDeterminer: (value: number) => any;
  columnClickable?: boolean;
  columnClickHandler: (clickedColumn?: string) => void;
}

const ReportsTable = ({
                        columns,
                        data,
                        clickHandler,
                        sortHandler,
                        rangeDeterminer,
                        columnClickable,
                        columnClickHandler
                      }: Props) => {
  const [totalValue, setTotalValue] = useState<number[]>([]);
  const {reportType} = useParams();

  // calculate total column from given data
  useEffect(() => {
    if (data.length) {
      const columnDataMapKeys = Object.keys(data[0].columnDataMap).filter(
          k => data[0] && data[0].columnDataMap[k] && !data[0].columnDataMap[k].isHidden
      );
      const total = columnDataMapKeys
      .filter(k => data[0] && data[0].columnDataMap[k] && !data[0].columnDataMap[k].isHidden)
      .map(_ => {
        return 0;
      });
      data.forEach(el => {
        columnDataMapKeys.forEach((key, index) => {
          if (data[0] && data[0].columnDataMap[key] && !data[0].columnDataMap[key].isHidden) {
            total[index] =
                (data[0].columnDataMap[key].isPercentage === null || data[0].columnDataMap[key].isPercentage === false) &&
                data[0].columnDataMap[key].dataType === 'double'
                    ? total[index] + el.columnDataMap[key].value
                    : '/';
          }
        });
      });
      setTotalValue(total);
    }
  }, [data]);

  const isDarkMode = useAppSelector(state => state.darkMode.value);
  const [sortDirection, setCurrentSortDirection] = useState(false);
  const [sortDirectionField, setCurrentSortDirectionField] = useState('');
  const {getTableProps, getTableBodyProps, headerGroups, rows, prepareRow} = useTable({
    columns,
    data
  });
  const {t} = useTranslation();

  const getS = (el: number) => {
    let num = Number(el);
    if (isNaN(num)) {
      return el;
    }
    let numFloor = Math.floor(num);
    return numFloor.toLocaleString();
  };

  const getOnClick = (header: string, rows: Row[], columnClickable?: boolean) => {
    if (columnClickable) {
      return () => columnClickHandler(header)
    } else {
      return () => {
        sortHandler(!sortDirection, header);
        setCurrentSortDirection(!sortDirection);
        setCurrentSortDirectionField(header);
      };
    }
  }

  return (
      <Table bordered hover {...getTableProps()} className="mt-2"
             variant={isDarkMode ? 'dark' : 'white'}>
        <thead className="bg-white" style={{position: 'sticky', top: '0'}}>
        {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => {
                const header = column.Header?.toString();
                const desc = (column as any)["desc"]?.toString()
                if (header) {
                  return (
                      <th
                          onClick={getOnClick(header, rows, columnClickable)}
                          {...column.getHeaderProps()}
                      >
                        {desc ? desc :
                            column.Header !== null && column.Header !== undefined
                                ? t('dashboard.' + column.Header.toString(), column.Header.toString())
                                : ''}
                        {sortDirectionField === header ? (
                            sortDirection ? (
                                <FontAwesomeIcon className="ms-2" icon="sort-up"/>
                            ) : (
                                <FontAwesomeIcon className="ms-2" icon="sort-down"/>
                            )
                        ) : (
                            <FontAwesomeIcon className="ms-2" icon="sort"/>
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
                        <td {...cell.getCellProps()} title={rowData.geographicLevel}>
                          {cell.render('Cell')}
                          {rowData.childrenNumber ? `(${rowData.childrenNumber})` : ''}
                        </td>
                    );
                  } else {
                    let cellName = cell.column.Header?.toString();
                    if (cellName) {
                      let color = '';
                      let columnDataMapElement = rowData.columnDataMap[cellName];

                      if (columnDataMapElement.isPercentage || columnDataMapElement.meta) {
                        let percentage = columnDataMapElement.value;
                        if (columnDataMapElement.dataType !== 'string') {

                          if (columnDataMapElement.isPercentage) {
                            percentage = Number(percentage.toFixed(percentage > 1 ? 2 : 3));
                          } else {
                            let num = Math.floor(percentage);
                            percentage = num.toLocaleString();
                          }
                        }
                        return (
                            <OverlayTrigger
                                {...cell.getCellProps()}
                                placement="top"
                                overlay={<Tooltip id="meta-tooltip"><span
                                    style={{whiteSpace: "pre-line"}}>{columnDataMapElement.meta}</span></Tooltip>}
                            >
                              <td
                                  className={
                                    columnDataMapElement.isPercentage
                                        ? rangeDeterminer(columnDataMapElement.value).class
                                        : ''
                                  }
                              >
                                <Container fluid>
                                  <BootRow>
                                    {percentage.toString().split(" ").map((str: string,num:number) =>
                                        <Col className="text-center">
                                          {str.concat(num===0?(columnDataMapElement.isPercentage?"%":''):"")}
                                        </Col>
                                    )}
                                  </BootRow>
                                </Container>

                              </td>
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
                              {columnDataMapElement.value === 'Complete'
                                  ? 'Sprayed'
                                  : columnDataMapElement.value}
                            </td>
                        );
                      }
                      return (
                          //convert number to locale string for 1000 separator
                          <td className={color} {...cell.getCellProps()}>
                            {columnDataMapElement.value !== null
                                ? columnDataMapElement.value.toLocaleString()
                                : columnDataMapElement.value}
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
                return <td key={index}>{getS(el)}</td>;
              })}
            </tr>
        )}
        </tbody>
      </Table>
  );
};

export default ReportsTable;
