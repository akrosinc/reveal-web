import { Map } from 'mapbox-gl';
import { CSSProperties, useCallback, useEffect, useMemo, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { CAMPAIGN_PLANNING_INSTANCE_SELECTION } from '../../../../constants';
import { useAuthorization } from '../../../../hooks/useAuthorization';
import { useAppSelector } from '../../../../store/hooks';
import {
  deleteSimulationDataset,
  getInstanceHierarchy,
  getInstances,
  getInstanceTeams,
  getLocationData,
  getPlanSimulation,
  updateSimulationDataset
} from '../../api';
import { MAP_STYLE_LIGHT } from '../../constants';
import {
  HierarchyNode,
  InstanceListItem,
  LocationFeature,
  PlanSimulation,
  RasterDataset,
  SimulationDataset,
  Site,
  SiteGeometry,
  Team,
  ValueRange
} from '../../providers/types';
import { getValueBounds } from '../../utils/datasets';
import { findPath } from '../../utils/hierarchyTree';
import { splitRasterDatasets } from '../../utils/rasters';
import AddDatasetDialog from '../AddDatasetDialog';
import AddRasterDialog from '../AddRasterDialog';
import BottomTable from '../BottomTable';
import CampaignMap from '../CampaignMap';
import LeftPanel from '../LeftPanel';
import MapLegend from '../MapLegend';
import MapTools from '../MapTools';
import RightPanel from '../RightPanel';
import SiteWizard from '../SiteWizard';
import TopBar from '../TopBar';
import styles from './CampaignPlanning.module.css';

// Height the bottom table takes (incl. gap), so the left card stops above it instead of overlapping
const TABLE_SPACE = { none: '0px', bar: '55px', sheet: '274px' };

const CampaignPlanning = () => {
  const { t } = useTranslation();
  const contextInstanceId = useAppSelector(state => state.instanceContext.selectedInstance?.identifier);
  const contextPlanId = useAppSelector(state => state.instanceContext.instancePlan?.identifier);
  const canSelectInstance = useAuthorization([CAMPAIGN_PLANNING_INSTANCE_SELECTION]);
  const [instances, setInstances] = useState<InstanceListItem[]>([]);
  const [viewedInstance, setViewedInstance] = useState<InstanceListItem>();
  const instanceId = viewedInstance ? viewedInstance.identifier : contextInstanceId;
  const planId = viewedInstance ? viewedInstance.planIdentifier : contextPlanId;
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
  const [isAddRasterOpen, setIsAddRasterOpen] = useState(false);
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

  useEffect(() => setViewedInstance(undefined), [contextInstanceId]);

  useEffect(() => {
    setInstances([]);
    if (!canSelectInstance) return;
    let isCurrent = true;
    getInstances()
      .then(res => isCurrent && setInstances(res.content ?? []))
      .catch(err => isCurrent && toast.error(err));
    return () => {
      isCurrent = false;
    };
  }, [canSelectInstance]);

  const selectInstance = useCallback(
    (id: string) => setViewedInstance(instances.find(instance => instance.identifier === id)),
    [instances]
  );

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
      .then(res => isCurrent && setSimulation(splitRasterDatasets(res)))
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
  const [hiddenDatasetIds, setHiddenDatasetIds] = useState<string[]>([]);
  const toggleDatasetVisibility = useCallback(
    (datasetId: string) =>
      setHiddenDatasetIds(current =>
        current.includes(datasetId) ? current.filter(id => id !== datasetId) : [...current, datasetId]
      ),
    []
  );
  const setAllDatasetsHidden = useCallback(
    (isHidden: boolean) => setHiddenDatasetIds(isHidden ? datasets.map(dataset => dataset.identifier) : []),
    [datasets]
  );
  const [hiddenRasterIds, setHiddenRasterIds] = useState<string[]>([]);
  const toggleRasterVisibility = useCallback(
    (rasterId: string) =>
      setHiddenRasterIds(current =>
        current.includes(rasterId) ? current.filter(id => id !== rasterId) : [...current, rasterId]
      ),
    []
  );
  // location-data also returns the clicked area itself; the map shows only its children unless it has none
  const mapLocations = useMemo(() => {
    const children = locations.filter(location => location.identifier !== selectedNode?.identifier);
    return children.length ? children : locations;
  }, [locations, selectedNode]);

  const [map, setMap] = useState<Map>();
  const [sitesByArea, setSitesByArea] = useState<Record<string, Site[]>>({});
  const [siteWizardGeometry, setSiteWizardGeometry] = useState<SiteGeometry>();
  const selectedId = selectedNode?.identifier;
  const areaSites = useMemo(() => (selectedId ? sitesByArea[selectedId] ?? [] : []), [sitesByArea, selectedId]);
  const catchment = useMemo(
    () => locations.find(location => location.identifier === selectedId)?.geometry,
    [locations, selectedId]
  );
  const snapGeometries = useMemo(
    () => [
      ...locations.filter(location => location.geometry).map(location => location.geometry),
      ...areaSites.flatMap(site => (site.boundary ? [site.boundary] : []))
    ],
    [locations, areaSites]
  );
  const saveSite = useCallback(
    (site: Site) => {
      if (!selectedId) return;
      setSitesByArea(current => ({ ...current, [selectedId]: [...(current[selectedId] ?? []), site] }));
      setSiteWizardGeometry(undefined);
      toast.success(t('campaignPlanning.siteAdded', { name: site.name }));
    },
    [selectedId, t]
  );
  const closeSiteWizard = useCallback(() => setSiteWizardGeometry(undefined), []);

  useEffect(() => setSiteWizardGeometry(undefined), [selectedId]);

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

  const deleteDataset = useCallback(
    async (dataset: SimulationDataset) => {
      if (!dataset.isUserDataset && simulationId) {
        await deleteSimulationDataset({ simulationId, datasetId: [dataset.identifier] }).catch(err => {
          toast.error(err);
          throw err;
        });
      }
      const datasetId = dataset.identifier;
      setSimulation(
        current => current && { ...current, datasets: current.datasets.filter(item => item.identifier !== datasetId) }
      );
      setHiddenDatasetIds(current => current.filter(id => id !== datasetId));
      setDatasetFilters(current => Object.fromEntries(Object.entries(current).filter(([id]) => id !== datasetId)));
    },
    [simulationId]
  );

  const deleteRasterDataset = useCallback(
    async (raster: RasterDataset) => {
      if (!simulationId) return;
      await deleteSimulationDataset({ simulationId, datasetId: [raster.identifier], datasetType: 'RASTER' }).catch(
        err => {
          toast.error(err);
          throw err;
        }
      );
      setSimulation(
        current =>
          current && {
            ...current,
            rasterDatasets: current.rasterDatasets?.filter(item => item.identifier !== raster.identifier)
          }
      );
      setHiddenRasterIds(current => current.filter(id => id !== raster.identifier));
    },
    [simulationId]
  );

  const saveRasterDataset = useCallback(
    async (raster: RasterDataset, colorRamp: string, opacity?: number, name?: string) => {
      if (!simulationId) return;
      const finalName = name?.trim() || raster.name;
      await updateSimulationDataset({
        simulationId,
        datasetId: raster.identifier,
        name: finalName,
        hexColor: colorRamp,
        lineWidth: 0,
        borderColor: '#000000',
        datasetType: 'RASTER'
      }).catch(err => {
        toast.error(err);
        throw err;
      });
      setSimulation(
        current =>
          current && {
            ...current,
            rasterDatasets: current.rasterDatasets?.map(item =>
              item.identifier === raster.identifier
                ? { ...item, name: finalName, colorRamp, opacity: opacity ?? item.opacity }
                : item
            )
          }
      );
    },
    [simulationId]
  );

  const reloadRasterDatasets = useCallback(() => {
    if (!planId) return;
    getPlanSimulation(planId)
      .then(res =>
        setSimulation(current => current && { ...current, rasterDatasets: splitRasterDatasets(res).rasterDatasets })
      )
      .catch(err => toast.error(err));
  }, [planId]);

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
  const openAddRaster = useCallback(() => setIsAddRasterOpen(true), []);
  const closeAddRaster = useCallback(() => setIsAddRasterOpen(false), []);
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
        hiddenDatasetIds={hiddenDatasetIds}
        rasterDatasets={rasterDatasets}
        hiddenRasterIds={hiddenRasterIds}
        sites={areaSites}
        onLoad={setMap}
      />
      <TopBar path={selectedPath} />
      {loading.locations && (
        <div className={styles.mapLoading} role="status">
          <Spinner animation="border" size="sm" />
          {t('campaignPlanning.loadingLocations')}
        </div>
      )}
      {instanceId || instances.length ? (
        <LeftPanel
          instances={instances}
          instanceId={instanceId}
          onInstanceSelect={selectInstance}
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
          hiddenDatasetIds={hiddenDatasetIds}
          onDatasetVisibilityToggle={toggleDatasetVisibility}
          onAllDatasetsVisibilityChange={setAllDatasetsHidden}
          onDatasetDelete={deleteDataset}
          onAddRaster={openAddRaster}
          hiddenRasterIds={hiddenRasterIds}
          onRasterVisibilityToggle={toggleRasterVisibility}
          onRasterDatasetSave={saveRasterDataset}
          onRasterDatasetDelete={deleteRasterDataset}
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
          <RightPanel
            node={selectedNode}
            isCollapsed={isDetailsCollapsed}
            onCollapsedChange={setIsDetailsCollapsed}
            sites={areaSites}
            onAddSite={setSiteWizardGeometry}
          />
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
      {selectedNode && map && siteWizardGeometry && (
        <SiteWizard
          key={siteWizardGeometry}
          map={map}
          geometry={siteWizardGeometry}
          areaName={selectedNode.properties.name}
          catchment={catchment}
          snapGeometries={snapGeometries}
          onSave={saveSite}
          onClose={closeSiteWizard}
        />
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
      {isAddRasterOpen && simulationId && (
        <AddRasterDialog
          simulationId={simulationId}
          parentLocationId={selectedNode?.identifier ?? hierarchy[0]?.identifier}
          onClose={closeAddRaster}
          onAdded={reloadRasterDatasets}
        />
      )}
    </div>
  );
};

export default CampaignPlanning;
