import { CSSProperties, useCallback, useEffect, useMemo, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useAppSelector } from '../../../../store/hooks';
import {
  getInstanceHierarchy,
  getInstanceTeams,
  getLocationData,
  getPlanSimulation,
  updateSimulationDataset
} from '../../api';
import { MAP_STYLE_LIGHT } from '../../constants';
import {
  HierarchyNode,
  LocationFeature,
  PlanSimulation,
  SimulationDataset,
  Team,
  ValueRange
} from '../../providers/types';
import { getValueBounds } from '../../utils/datasets';
import { findPath } from '../../utils/hierarchyTree';
import AddDatasetDialog from '../AddDatasetDialog';
import BottomTable from '../BottomTable';
import CampaignMap from '../CampaignMap';
import LeftPanel from '../LeftPanel';
import MapLegend from '../MapLegend';
import MapTools from '../MapTools';
import RightPanel from '../RightPanel';
import TopBar from '../TopBar';
import styles from './CampaignPlanning.module.css';

// Height the bottom table takes (incl. gap), so the left card stops above it instead of overlapping
const TABLE_SPACE = { none: '0px', bar: '55px', sheet: '274px' };

const CampaignPlanning = () => {
  const { t } = useTranslation();
  const instanceId = useAppSelector(state => state.instanceContext.selectedInstance?.identifier);
  const planId = useAppSelector(state => state.instanceContext.instancePlan?.identifier);
  const [hierarchy, setHierarchy] = useState<HierarchyNode[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedNode, setSelectedNode] = useState<HierarchyNode>();
  const [simulation, setSimulation] = useState<PlanSimulation>();
  const [locations, setLocations] = useState<LocationFeature[]>([]);
  // Start as loading when the request will fire, so the first render shows skeletons instead of "No locations found"
  const [loading, setLoading] = useState({
    hierarchy: !!instanceId,
    teams: !!instanceId,
    simulation: !!planId,
    locations: false
  });
  const [isDetailsCollapsed, setIsDetailsCollapsed] = useState(false);
  const [isTableOpen, setIsTableOpen] = useState(false);
  const [mapStyle, setMapStyle] = useState(MAP_STYLE_LIGHT);
  const [isAddDatasetOpen, setIsAddDatasetOpen] = useState(false);
  const selectedPath = useMemo(
    () => (selectedNode ? findPath(hierarchy, selectedNode.identifier) : []),
    [hierarchy, selectedNode]
  );
  // Table lists the selected area's children; a lowest-level area has none, so it lists the area itself (like the map)
  const tableRows = useMemo(() => {
    const node = selectedPath[selectedPath.length - 1];
    if (!node) return [];
    return node.children?.length ? node.children : [node];
  }, [selectedPath]);
  const setIsLoading = useCallback(
    (key: keyof typeof loading, value: boolean) => setLoading(current => ({ ...current, [key]: value })),
    []
  );
  const tableSpace = selectedNode ? TABLE_SPACE[isTableOpen ? 'sheet' : 'bar'] : TABLE_SPACE.none;

  // Each request below ignores its response once the instance / plan / area has changed (isCurrent), so a slow answer
  // for the previous one can't overwrite the new data; the previous data is cleared right away instead of shown.
  useEffect(() => {
    // The previous instance's areas, teams and selected area don't belong to a newly switched one
    setSelectedNode(undefined);
    setHierarchy([]);
    setTeams([]);
    if (!instanceId) return;
    let isCurrent = true;
    setIsLoading('hierarchy', true);
    getInstanceHierarchy(instanceId)
      .then(res => isCurrent && setHierarchy(res.geoTree ?? []))
      .catch(err => isCurrent && toast.error(err))
      .finally(() => isCurrent && setIsLoading('hierarchy', false));
    setIsLoading('teams', true);
    getInstanceTeams(instanceId)
      .then(res => isCurrent && setTeams(res))
      .catch(err => isCurrent && toast.error(err))
      .finally(() => isCurrent && setIsLoading('teams', false));
    return () => {
      isCurrent = false;
    };
  }, [instanceId, setIsLoading]);

  useEffect(() => {
    setSimulation(undefined);
    if (!planId) return;
    let isCurrent = true;
    setIsLoading('simulation', true);
    getPlanSimulation(planId)
      .then(res => isCurrent && setSimulation(res))
      .catch(err => isCurrent && toast.error(err))
      .finally(() => isCurrent && setIsLoading('simulation', false));
    return () => {
      isCurrent = false;
    };
  }, [planId, setIsLoading]);

  const datasets = useMemo(() => simulation?.datasets ?? [], [simulation]);
  const simulationId = simulation?.identifier;
  // An added dataset joins the list, so the areas reload with its values too
  const addDataset = useCallback(
    (dataset: SimulationDataset) =>
      setSimulation(current => current && { ...current, datasets: [...current.datasets, dataset] }),
    []
  );
  // Rename / colour panel changes. Saved to the simulation like on Simulation (PUT simulation/dataset); a user dataset
  // (added without "Save to Simulation") only changes on this page. Opacity isn't part of the request, as on Simulation.
  const saveDataset = useCallback(
    (edited: SimulationDataset) => {
      const replace = () =>
        setSimulation(
          current =>
            current && {
              ...current,
              datasets: current.datasets.map(dataset => (dataset.identifier === edited.identifier ? edited : dataset))
            }
        );
      if (edited.isUserDataset || !simulationId) {
        replace();
        return;
      }
      updateSimulationDataset({
        simulationId,
        datasetId: edited.identifier,
        name: edited.name,
        hexColor: edited.hexColor ?? '',
        lineWidth: edited.lineWidth ?? 1,
        borderColor: edited.borderColor ?? '#000000'
      })
        .then(replace)
        .catch(err => toast.error(err));
    },
    [simulationId]
  );
  // location-data only needs the dataset ids, so editing a dataset's name or colours doesn't reload the areas
  const datasetIdsKey = useMemo(
    () =>
      JSON.stringify({
        datasetsIds: datasets.filter(dataset => !dataset.isUserDataset).map(dataset => dataset.identifier),
        userDatasetIds: datasets.filter(dataset => dataset.isUserDataset).map(dataset => dataset.identifier)
      }),
    [datasets]
  );
  const rasterDatasets = useMemo(() => simulation?.rasterDatasets ?? [], [simulation]);
  const targetAreas = useMemo(() => simulation?.targetAreas ?? [], [simulation]);
  // Campaign Management's "Toggle assigned": shows or hides the assigned areas layer (on by default there too)
  const [showAssigned, setShowAssigned] = useState(true);
  // location-data also returns the clicked area itself; the map shows only its children unless it has none
  const mapLocations = useMemo(() => {
    const children = locations.filter(location => location.identifier !== selectedNode?.identifier);
    return children.length ? children : locations;
  }, [locations, selectedNode]);

  // Lowest/highest value of each dataset among the areas on the map: the dataset filter's slider limits
  const valueBounds = useMemo(() => getValueBounds(mapLocations), [mapLocations]);

  // Dataset filters that are switched on (Simulation's Filter switch); no range yet = the full range.
  // New areas have new values, so the location-data effect below resets the ranges when it loads other areas.
  const [datasetFilters, setDatasetFilters] = useState<Record<string, ValueRange | undefined>>({});
  const toggleDatasetFilter = useCallback(
    (datasetId: string) =>
      setDatasetFilters(current => {
        const next = { ...current };
        if (datasetId in next) delete next[datasetId];
        else next[datasetId] = undefined;
        return next;
      }),
    []
  );
  const changeDatasetFilter = useCallback(
    (datasetId: string, range: ValueRange) => setDatasetFilters(current => ({ ...current, [datasetId]: range })),
    []
  );
  // Only filters narrowed by the user hide areas on the map
  const mapFilters = useMemo(
    () =>
      Object.fromEntries(Object.entries(datasetFilters).filter((entry): entry is [string, ValueRange] => !!entry[1])),
    [datasetFilters]
  );

  // Children of the selected area with their geometry and the attached datasets' values, for the map and the table
  useEffect(() => {
    setLocations([]);
    // Filters that are on start again from the full range of the new areas (as on Simulation)
    setDatasetFilters(current => Object.fromEntries(Object.keys(current).map(id => [id, undefined])));
    if (!selectedNode || !simulationId) return;
    // Ignore a slower response for an area that is no longer selected
    let isCurrent = true;
    setIsLoading('locations', true);
    getLocationData({
      simulationId,
      ...JSON.parse(datasetIdsKey),
      includeGeometry: true,
      parentLocationId: selectedNode.identifier,
      campaignManagementFeatures: false
    })
      .then(res => isCurrent && setLocations(res))
      .catch(err => isCurrent && toast.error(err))
      .finally(() => isCurrent && setIsLoading('locations', false));
    return () => {
      isCurrent = false;
      setIsLoading('locations', false);
    };
  }, [selectedNode, simulationId, datasetIdsKey, setIsLoading]);

  // Stable handlers, so the memoised panels don't re-render when unrelated state changes
  const openAddDataset = useCallback(() => setIsAddDatasetOpen(true), []);
  const closeAddDataset = useCallback(() => setIsAddDatasetOpen(false), []);
  const toggleTable = useCallback(() => setIsTableOpen(open => !open), []);

  return (
    <div className={styles.deck} style={{ '--table-space': tableSpace } as CSSProperties}>
      <CampaignMap
        mapStyle={mapStyle}
        locations={mapLocations}
        datasets={datasets}
        filters={mapFilters}
        targetAreas={targetAreas}
        showAssigned={showAssigned}
      />
      <TopBar path={selectedPath} />
      {loading.locations && (
        <div className={styles.mapLoading} role="status">
          <Spinner animation="border" size="sm" />
          {t('campaignPlanning.loadingLocations')}
        </div>
      )}
      {instanceId ? (
        <LeftPanel
          hierarchy={hierarchy}
          datasets={datasets}
          rasterDatasets={rasterDatasets}
          valueBounds={valueBounds}
          datasetFilters={datasetFilters}
          onDatasetFilterToggle={toggleDatasetFilter}
          onDatasetFilterChange={changeDatasetFilter}
          simulationId={simulationId}
          onAddDataset={openAddDataset}
          onDatasetSave={saveDataset}
          teams={teams}
          isHierarchyLoading={loading.hierarchy}
          isDatasetsLoading={loading.simulation}
          isTeamsLoading={loading.teams}
          selectedId={selectedNode?.identifier}
          onSelect={setSelectedNode}
        />
      ) : (
        <div className={styles.notice}>{t('campaignPlanning.selectInstance')}</div>
      )}
      {selectedNode && (
        <>
          <RightPanel node={selectedNode} isCollapsed={isDetailsCollapsed} onCollapsedChange={setIsDetailsCollapsed} />
          <BottomTable
            rows={tableRows}
            locations={locations}
            datasets={datasets}
            isLoading={loading.locations}
            isOpen={isTableOpen}
            isNarrow={isDetailsCollapsed}
            onToggle={toggleTable}
            onSelect={setSelectedNode}
          />
        </>
      )}
      <MapLegend
        datasets={datasets}
        rasterDatasets={rasterDatasets}
        showAssigned={showAssigned}
        onShowAssignedChange={setShowAssigned}
      />
      <MapTools mapStyle={mapStyle} onMapStyleChange={setMapStyle} />
      {isAddDatasetOpen && simulationId && (
        <AddDatasetDialog
          simulationId={simulationId}
          parentLocationId={selectedNode?.identifier ?? hierarchy[0]?.identifier}
          datasets={datasets}
          onClose={closeAddDataset}
          onAdded={addDataset}
        />
      )}
    </div>
  );
};

export default CampaignPlanning;
