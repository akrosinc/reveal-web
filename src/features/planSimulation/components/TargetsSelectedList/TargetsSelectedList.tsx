import React, { useMemo, useCallback } from 'react';
import styles from './TargetsSelectedList.module.css';
import { usePolygonContext } from '../../../../contexts/PolygonContext';
import Accordion from '../../../location/components/accordion/Accordion';
import task from '../../../../assets/svgs/task.svg';
import Delete from '../../../../assets/svgs/trash-bin.svg';

function TargetsSelectedList() {
  const { state, dispatch } = usePolygonContext();
  const { multiselect, polygons } = state;

  // Helper function to find a parent by its identifier
  const findParent = useCallback((data: any[], parentId: string): any => {
    for (const polygon of data) {
      if (polygon.identifier === parentId) {
        return polygon;
      }
      if (polygon.children.length > 0) {
        const found = findParent(polygon.children, parentId);
        if (found) return found;
      }
    }
    return undefined;
  }, []);

  // Group selected polygons by their parent (memoized for optimization)
  const groupedData = useMemo(() => {
    const grouped: Record<string, any[]> = {};

    multiselect.forEach(polygon => {
      const parent = findParent(polygons, polygon.properties.parentIdentifier);
      const parentName = parent?.properties.name || 'Unknown Parent';

      if (!grouped[parentName]) {
        grouped[parentName] = [];
      }
      grouped[parentName].push(polygon);
    });

    return grouped;
  }, [multiselect, findParent, polygons]);

  // Function to render nested children recursively (memoized)
  const renderChildren = useCallback(
    (polygon: any) => {
      return (
        <ul className={styles.listWrapper} key={polygon.properties.externalId}>
          <li className={styles.listItem}>
            <div className={styles.listItemInfo}>
              <img className={styles.selectedIcon} src={task} alt="selected Polygon" />
              <p>
                {polygon.properties.name} ({polygon.properties.childrenNumber})
              </p>
            </div>
            <button
              className={styles.removeLocationButton}
              onClick={() => dispatch({ type: 'TOGGLE_MULTISELECT', payload: polygon })}
            >
              <img src={Delete} alt="Delete" />
            </button>
          </li>
        </ul>
      );
    },
    [dispatch]
  );

  return (
    <div className={styles.targetsSelectedList}>
      {Object.entries(groupedData).map(([parentName, polygons], index) => (
        <Accordion key={`accordion-${parentName}-${index}`} title={`${parentName} (${polygons.length})`}>
          {polygons.map(polygon => renderChildren(polygon))}
          <hr></hr>
          <button className={styles.assignmentButton}>Add all subordinate operational areas</button>
        </Accordion>
      ))}
    </div>
  );
}

export default React.memo(TargetsSelectedList);
