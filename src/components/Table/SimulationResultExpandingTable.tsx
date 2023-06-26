import React from 'react';
import { Button, Table } from 'react-bootstrap';
import { useExpanded, useTable } from 'react-table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  ROW_DEPTH_COLOR_1,
  ROW_DEPTH_COLOR_2,
  ROW_DEPTH_COLOR_3,
  SIMULATION_LOCATION_TABLE_COLUMNS
} from '../../constants';
import { useAppSelector } from '../../store/hooks';
import { useTranslation } from 'react-i18next';

interface Props {
  data: any;
  clickHandler: (id: string) => void;
  detailsClickHandler: (id: string) => void;
  summaryClickHandler: (mapData: any) => void;
}

const SimulationResultExpandingTable = ({ data, clickHandler, detailsClickHandler, summaryClickHandler }: Props) => {
  const isDarkMode = useAppSelector(state => state.darkMode.value);

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
            geographicLevel: el.properties.geographicLevel,
            result: el.properties.result,
            hasResultChild: el.properties.hasResultChild
          },
          aggregates: el.aggregates
        };
      });
    } else {
      return [];
    }
  };

  const columns = React.useMemo(
    () => [
      {
        // Build our expander column
        id: 'expander', // Make sure it has an ID
        Cell: ({ row }: { row: any }) =>
          // Use the row.canExpand and row.getToggleRowExpandedProps prop getter
          // to build the toggle for expanding a row
          row.canExpand ? (
            <span
              {...row.getToggleRowExpandedProps({
                style: {
                  // Use the row.depth property
                  // and paddingLeft to indicate the depth
                  // of the row
                  paddingLeft: `${row.depth}rem`,
                  paddingTop: '15px',
                  paddingBottom: '15px',
                  paddingRight: '15px'
                }
              })}
            >
              {row.isExpanded ? (
                <FontAwesomeIcon className="ms-1" icon="chevron-down" />
              ) : (
                <FontAwesomeIcon className="ms-1" icon="chevron-right" />
              )}
            </span>
          ) : null
      },
      ...SIMULATION_LOCATION_TABLE_COLUMNS
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns,
      data,
      getSubRows: (row: any) => mapRows(row),
      autoResetExpanded: false
    },
    useExpanded // Use the useExpanded plugin hook
  );
  const { t } = useTranslation();
  return (
    <Table bordered responsive hover {...getTableProps()} variant={isDarkMode ? 'dark' : 'white'}>
      <thead className="border border-2">
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => {
              return (
                <th
                  id={column.id + '-header'}
                  style={{ width: column.id === 'expander' ? '37px' : 'auto' }}
                  {...column.getHeaderProps()}
                >
                  {column.Header !== undefined && column.Header !== null && column.id !== 'expander'
                    ? t('simulationPage.' + column.Header.toString())
                    : ''}
                </th>
              );
            })}
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

                if (cellData.properties?.hasResultChild || cellData.properties?.result) {
                  if (cell.column.id === 'resultName') {
                    return (
                      <td
                        id={cell.column.id + 'click-handler'}
                        // style={{color:cellData.properties?.result?'black':'lightgray'}}
                        style={{
                          color: cellData.properties?.result ? 'black' : 'grey',
                          fontWeight: cellData.properties?.result ? 'bold' : 'normal'
                        }}
                        {...cell.getCellProps()}
                        onClick={() => {
                          if (cell.column.id !== 'expander') {
                            clickHandler(cellData.identifier);
                          }
                        }}
                      >
                        {cell.render('Cell')} {cellData.properties?.hasResultChild ? '*' : ''}
                      </td>
                    );
                  } else if (cell.column.id === 'details') {
                    return (
                      <td
                        id={cell.column.id + 'click-handler'}
                        style={{
                          color: 'black',
                          fontWeight: cellData.properties?.result ? 'bold' : 'normal'
                        }}
                        {...cell.getCellProps()}
                        onClick={() => {
                          if (cell.column.id !== 'expander') {
                            clickHandler(cellData.identifier);
                          }
                        }}
                      >
                        {/*{*/}
                        {/*  cellData.properties?.result?(*/}
                        <Button
                          className={'mx-2'}
                          onClick={() => {
                            detailsClickHandler(cellData.identifier);
                          }}
                        >
                          {t('simulationPage.details')}
                        </Button>
                        <Button
                          className={'mx-2'}
                          onClick={() => {
                            summaryClickHandler(cellData);
                          }}
                        >
                          {t('simulationPage.summary')}
                        </Button>
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
                }

                return null;
              })}
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

export default SimulationResultExpandingTable;
