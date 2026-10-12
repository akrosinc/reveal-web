import { CSSProperties, useEffect, useMemo, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useAppSelector } from '../../../../store/hooks';
import { getInstanceHierarchy, getInstanceTeams, getLocationData, getPlanSimulation } from '../../api';
import { MAP_STYLE_LIGHT } from '../../constants';
import { HierarchyNode, LocationFeature, PlanSimulation, Team } from '../../providers/types';
import { findPath } from '../../utils/hierarchyTree';
import BottomTable from '../BottomTable';
import CampaignMap from '../CampaignMap';
import LeftPanel from '../LeftPanel';
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
  const selectedPath = useMemo(
    () => (selectedNode ? findPath(hierarchy, selectedNode.identifier) : []),
    [hierarchy, selectedNode]
  );
  const setIsLoading = (key: keyof typeof loading, value: boolean) =>
    setLoading(current => ({ ...current, [key]: value }));
  const tableSpace = selectedNode ? TABLE_SPACE[isTableOpen ? 'sheet' : 'bar'] : TABLE_SPACE.none;

  useEffect(() => {
    // An area from the previous instance's hierarchy doesn't belong to a newly switched one
    setSelectedNode(undefined);
    if (!instanceId) return;
    setIsLoading('hierarchy', true);
    getInstanceHierarchy(instanceId)
      .then(res => setHierarchy(res.geoTree ?? []))
      .catch(err => toast.error(err))
      .finally(() => setIsLoading('hierarchy', false));
    setIsLoading('teams', true);
    getInstanceTeams(instanceId)
      .then(setTeams)
      .catch(err => toast.error(err))
      .finally(() => setIsLoading('teams', false));
  }, [instanceId]);

  useEffect(() => {
    if (!planId) return;
    setIsLoading('simulation', true);
    getPlanSimulation(planId)
      .then(setSimulation)
      .catch(err => toast.error(err))
      .finally(() => setIsLoading('simulation', false));
  }, [planId]);

  const datasets = useMemo(() => simulation?.datasets ?? [], [simulation]);
  const rasterDatasets = useMemo(() => simulation?.rasterDatasets ?? [], [simulation]);
  // location-data also returns the clicked area itself; the map shows only its children unless it has none
  const mapLocations = useMemo(() => {
    const children = locations.filter(location => location.identifier !== selectedNode?.identifier);
    return children.length ? children : locations;
  }, [locations, selectedNode]);

  // Children of the selected area with their geometry and the attached datasets' values, for the map and the table
  useEffect(() => {
    setLocations([]);
    if (!selectedNode || !simulation) return;
    // Ignore a slower response for an area that is no longer selected
    let isCurrent = true;
    setIsLoading('locations', true);
    getLocationData({
      simulationId: simulation.identifier,
      datasetsIds: datasets.filter(dataset => !dataset.isUserDataset).map(dataset => dataset.identifier),
      userDatasetIds: datasets.filter(dataset => dataset.isUserDataset).map(dataset => dataset.identifier),
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
  }, [selectedNode, simulation, datasets]);

  return (
    <div className={styles.deck} style={{ '--table-space': tableSpace } as CSSProperties}>
      <CampaignMap mapStyle={mapStyle} locations={mapLocations} datasets={datasets} />
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
            rows={selectedPath[selectedPath.length - 1]?.children ?? []}
            locations={locations}
            datasets={datasets}
            isLoading={loading.locations}
            isOpen={isTableOpen}
            isNarrow={isDetailsCollapsed}
            onToggle={() => setIsTableOpen(open => !open)}
            onSelect={setSelectedNode}
          />
        </>
      )}
      <MapTools mapStyle={mapStyle} onMapStyleChange={setMapStyle} />
    </div>
  );
};

export default CampaignPlanning;
