import React, { useMemo, useCallback } from 'react';
import styles from './TargetsSelectedList.module.css';
import { usePolygonContext } from '../../../../contexts/PolygonContext';
import Accordion from '../../../location/components/accordion/Accordion';
import task from '../../../../assets/svgs/task.svg';
import Delete from '../../../../assets/svgs/trash-bin.svg';
import { assignLocationsToPlan } from '../SimulationMapView/api/planAPI';
import { findNodeById, getIdsByGeographicLevel } from '../SimulationMapView/util';
import { getSimulationData } from '../SimulationMapView/api/datasetsAPI';

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
    (polygon: any, key) => {
      return (
        <li key={key} className={styles.listItem}>
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
      );
    },
    [dispatch]
  );

  // Handler for logging polygon identifiers
  const handleLogIdentifiers = (polygons: any) => {
    // same logic as for single select assignment, check SimulationMapView.tsx handleCampaignClick
    const ancestry: any[] = [];
    const results: any[] = [];
    polygons.forEach((polygon: any) => {
      ancestry.push(...JSON.parse(polygon.properties?.ancestry) || []);
      const currentLocWithChildren = findNodeById(state.polygons, polygon.properties?.id);
      results.push(...getIdsByGeographicLevel(currentLocWithChildren.children));
    });
    const assignedAreas = state.targetAreas?.flatMap(ta => [...ta.ancestry, ta.identifier]) || [];

    const allLocationsIdsToBeAssigned = new Set([...results, ...ancestry, ...assignedAreas, ...polygons.map((p: any) => p.properties?.id)]);
    const identifiersToSendArray = Array.from(allLocationsIdsToBeAssigned);
    assignLocationsToPlan(state.planid, identifiersToSendArray).then(async () => {
      const simulationData = await getSimulationData(state.planid);
      dispatch({ type: 'SET_TARGET_AREAS', payload: simulationData.targetAreas });
      dispatch({ type: 'CLEAR_SELECTION' });
      dispatch({
        type: 'SET_ASSIGNED', payload: {
          ...state.assingedLocations, ...Object.fromEntries(polygons.map((p: any) => [p.properties?.id, true]))
        }
      });

    });
  };

  return (
    <div className={styles.targetsSelectedList}>
      {Object.entries(groupedData).map(([parentName, polygons], index) => (
        <Accordion key={index} title={`${parentName} (${polygons.length})`}>
          <ul className={styles.listWrapper}>{polygons.map((polygon, index) => renderChildren(polygon, index))}</ul>
          <hr className={styles.divider}></hr>
          <div className={styles.buttonWrapper}>
            <button onClick={() => handleLogIdentifiers(polygons)} className={styles.assignmentButton}>
              Add all to campaign
            </button>
          </div>
        </Accordion>
      ))}
    </div>
  );
}

export default React.memo(TargetsSelectedList);
