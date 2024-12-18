// import React from 'react';
// import { Button, Table } from 'react-bootstrap';
// import { useExpanded, useTable } from 'react-table';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import {
//   ROW_DEPTH_COLOR_1,
//   ROW_DEPTH_COLOR_2,
//   ROW_DEPTH_COLOR_3,
//   SIMULATION_LOCATION_TABLE_COLUMNS
// } from '../../constants';
// import { useAppSelector } from '../../store/hooks';
// import { useTranslation } from 'react-i18next';
// import { MarkedLocation } from '../../features/planSimulation/components/Simulation';
// import { AnalysisLayer } from '../../features/planSimulation/components/Simulation';
// import { getBackgroundStyle } from '../../features/planSimulation/components/SimulationMapView/SimulationMapView';

// interface Props {
//   data: any;
//   clickHandler: (id: string) => void;
//   detailsClickHandler: (id: string) => void;
//   summaryClickHandler: (mapData: any) => void;
//   markedLocations: MarkedLocation[];
//   showOnlyMarkedLocations: boolean;
//   markedParents: Set<string>;
// }

// const SimulationResultExpandingTable = ({
//   data,
//   clickHandler,
//   detailsClickHandler,
//   summaryClickHandler,
//   markedLocations,
//   showOnlyMarkedLocations,
//   markedParents
// }: Props) => {
//   const isDarkMode = useAppSelector(state => state.darkMode.value);

//   const getColorLevel = (depth: number) => {
//     if (depth === 0) {
//       return '';
//     } else if (depth === 1) {
//       return ROW_DEPTH_COLOR_1;
//     } else if (depth === 2) {
//       return ROW_DEPTH_COLOR_2;
//     } else {
//       return ROW_DEPTH_COLOR_3;
//     }
//   };

//   const mapRows = (row: any): object[] => {
//     if (row.headOf !== undefined) {
//       return row.headOf.map((el: any) => {
//         return {
//           name: el.name,
//           identifier: el.identifier,
//           active: el.active.toString(),
//           headOf: el.headOf,
//           type: el.type.valueCodableConcept
//         };
//       });
//     } else if (row.children !== undefined && row.children.length > 0) {
//       return row.children.map((el: any) => {
//         return {
//           identifier: el.identifier,
//           children: el.children,
//           method: el.method,
//           properties: {
//             name: el.properties.name,
//             status: el.properties.status,
//             externalId: el.properties.externalId,
//             geographicLevel: el.properties.geographicLevel,
//             result: el.properties.result,
//             hasResultChild: el.properties.hasResultChild
//           },
//           aggregates: el.aggregates
//         };
//       });
//     } else {
//       return [];
//     }
//   };

//   const columns = React.useMemo(
//     () => [
//       {
//         // Build our expander column
//         id: 'expander', // Make sure it has an ID
//         Cell: ({ row }: { row: any }) =>
//           // Use the row.canExpand and row.getToggleRowExpandedProps prop getter
//           // to build the toggle for expanding a row
//           row.canExpand ? (
//             <span
//               {...row.getToggleRowExpandedProps({
//                 style: {
//                   // Use the row.depth property
//                   // and paddingLeft to indicate the depth
//                   // of the row
//                   paddingLeft: `${row.depth}rem`,
//                   paddingTop: '15px',
//                   paddingBottom: '15px',
//                   paddingRight: '15px'
//                 }
//               })}
//             >
//               {row.isExpanded ? (
//                 <FontAwesomeIcon className="ms-1" icon="chevron-down" />
//               ) : (
//                 <FontAwesomeIcon className="ms-1" icon="chevron-right" />
//               )}
//             </span>
//           ) : null
//       },
//       ...SIMULATION_LOCATION_TABLE_COLUMNS
//     ],
//     []
//   );

//   const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
//     {
//       columns,
//       data,
//       getSubRows: (row: any) => mapRows(row),
//       autoResetExpanded: false
//     },
//     useExpanded // Use the useExpanded plugin hook
//   );
//   const { t } = useTranslation();
//   return (
//     <div>
//       {rows.map(row => {
//         prepareRow(row);
//         return (
//           //row.depth is not existing in react table types for some reason, casting to any type solves the issue
//           <tr {...row.getRowProps()} style={{ backgroundColor: getColorLevel((row as any).depth) }}>
//             {row.cells
//               .filter(cell => {
//                 const cellData = cell.row.original as any;
//                 return (
//                   (showOnlyMarkedLocations &&
//                     (markedParents.has(cellData.identifier) ||
//                       markedLocations
//                         .map(markedLocation => markedLocation.identifier)
//                         .includes(cellData.identifier))) ||
//                   !showOnlyMarkedLocations
//                 );
//               })
//               .map(cell => {
//                 const cellData = cell.row.original as any;
//                 console.log(cell.getCellProps());
//                 if (cellData.properties?.hasResultChild || cellData.properties?.result) {
//                   // PARENTS NAME
//                   if (cell.column.id === 'resultName') {
//                     return (
//                       <td
//                         id={cell.column.id + 'click-handler'}
//                         {...cell.getCellProps()}
//                         onClick={() => {
//                           if (cell.column.id !== 'expander') {
//                             clickHandler(cellData.identifier);
//                           }
//                         }}
//                       >
//                         {
//                           <span
//                             style={{
//                               color: !markedLocations
//                                 .map(markedLocation => markedLocation.identifier)
//                                 .includes(cellData.identifier)
//                                 ? cellData.properties?.result
//                                   ? 'black'
//                                   : 'grey'
//                                 : 'red',
//                               fontWeight: cellData.properties?.result ? 'bold' : 'normal'
//                             }}
//                           >
//                             {cell.render('Cell')}
//                             {cellData.method?.map((methodItem: AnalysisLayer) => (
//                               <div
//                                 className={'mx-1'}
//                                 title={methodItem.labelName}
//                                 style={{
//                                   background: getBackgroundStyle(methodItem.color.rgb),
//                                   width: '15px',
//                                   height: '15px',
//                                   borderRadius: '50%'
//                                 }}
//                               >
//                                 {'  '}
//                               </div>
//                             ))}
//                           </span>
//                         }{' '}
//                         {cellData.properties?.hasResultChild ? '*' : ''}
//                         {markedParents.has(cellData.identifier) ? <span style={{ color: 'red' }}>*</span> : ''}
//                       </td>
//                     );
//                   } else if (cell.column.id === 'details') {
//                     return (
//                       <td
//                         id={cell.column.id + 'click-handler'}
//                         style={{
//                           color: 'black',
//                           fontWeight: cellData.properties?.result ? 'bold' : 'normal'
//                         }}
//                         {...cell.getCellProps()}
//                         onClick={() => {
//                           if (cell.column.id !== 'expander') {
//                             clickHandler(cellData.identifier);
//                           }
//                         }}
//                       >
//                         <Button
//                           className={'mx-2'}
//                           onClick={() => {
//                             detailsClickHandler(cellData.identifier);
//                           }}
//                         >
//                           {t('simulationPage.details')}
//                         </Button>
//                         {!showOnlyMarkedLocations && (
//                           <Button
//                             className={'mx-2'}
//                             onClick={() => {
//                               summaryClickHandler(cellData);
//                             }}
//                           >
//                             {t('simulationPage.summary')}
//                           </Button>
//                         )}
//                       </td>
//                     );
//                   }

//                   // EXPANDED PARENTS
//                   else {
//                     return (
//                       <td
//                         id={cell.column.id + 'click-handler'}
//                         {...cell.getCellProps()}
//                         onClick={() => {
//                           if (cell.column.id !== 'expander') {
//                             let col = row.original as any;
//                             clickHandler(col.identifier);
//                           }
//                         }}
//                       >
//                         {cell.render('Cell')}
//                       </td>
//                     );
//                   }
//                 }

//                 return null;
//               })}
//           </tr>
//         );
//       })}
//     </div>
//   );
// };

// export default SimulationResultExpandingTable;

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAppSelector } from '../../store/hooks';
import { MarkedLocation } from '../../features/planSimulation/components/Simulation';
import styles from './SimulationResultExpandingTable.module.css';

interface Props {
  data: any;
  clickHandler: (id: string) => void;
  detailsClickHandler: (id: string) => void;
  summaryClickHandler: (mapData: any) => void;
  markedLocations: MarkedLocation[];
  showOnlyMarkedLocations: boolean;
  markedParents: Set<string>;
}

const SimulationResultExpandingTable = ({
  data,
  clickHandler,
  markedLocations,
  showOnlyMarkedLocations,
  markedParents
}: Props) => {
  const isDarkMode = useAppSelector(state => state.darkMode.value);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (identifier: string) => {
    setExpandedRows(prev => {
      const newExpandedRows = new Set(prev);
      if (newExpandedRows.has(identifier)) {
        newExpandedRows.delete(identifier);
      } else {
        newExpandedRows.add(identifier);
      }
      return newExpandedRows;
    });
  };

  const renderRow = (row: any, depth: number) => {
    const { identifier, properties } = row;

    const isMarked = markedLocations.some(location => location.identifier === identifier);
    const isMarkedParent = markedParents.has(identifier);
    const isExpanded = expandedRows.has(identifier);

    return (
      <div key={identifier}>
        <div
          className={styles.row}
          style={{
            border: isMarked ? '2px solid gold' : 'none', // Highlight marked locations
            fontWeight: isMarkedParent ? 'bold' : 'normal' // Style marked parents differently
          }}
          onClick={() => {
            clickHandler(identifier);
            toggleRow(identifier);
          }}
        >
          <div className={styles.expander} style={{ paddingLeft: `${depth === 0 ? 0 : depth * 2}rem` }}>
            {/* {properties.hasResultChild && <FontAwesomeIcon icon={isExpanded ? 'chevron-down' : 'chevron-right'} />} */}
            {row.children.length > 0 && <FontAwesomeIcon icon={isExpanded ? 'chevron-down' : 'chevron-right'} />}
          </div>
          <div className={styles.name}>{properties.name}</div>
          {/* <div>
            <Button onClick={() => summaryClickHandler(row)}>Summary</Button>
          </div> */}
        </div>
        {isExpanded && row.children && row.children.map((childRow: any) => renderRow(childRow, depth + 1))}
      </div>
    );
  };

  // Filter data if showOnlyMarkedLocations is true
  const filteredData = showOnlyMarkedLocations
    ? data.filter((row: any) => markedLocations.some(location => location.identifier === row.identifier))
    : data;

  return (
    <div className={isDarkMode ? 'bg-dark text-white' : 'bg-light text-dark'}>
      {filteredData.map((row: any) => renderRow(row, 0))}
    </div>
  );
};

export default SimulationResultExpandingTable;
