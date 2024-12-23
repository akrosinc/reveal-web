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
