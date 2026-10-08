import { CSSProperties, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useAppSelector } from '../../../../store/hooks';
import { getInstanceDatasets, getInstanceHierarchy, getInstanceTeams } from '../../api';
import { MAP_STYLE_LIGHT } from '../../constants';
import { HierarchyNode, InstanceDataset, Team } from '../../providers/types';
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
  const [hierarchy, setHierarchy] = useState<HierarchyNode[]>([]);
  const [datasets, setDatasets] = useState<InstanceDataset[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedNode, setSelectedNode] = useState<HierarchyNode>();
  const [isDetailsCollapsed, setIsDetailsCollapsed] = useState(false);
  const [isTableOpen, setIsTableOpen] = useState(false);
  const [mapStyle, setMapStyle] = useState(MAP_STYLE_LIGHT);
  const selectedPath = useMemo(
    () => (selectedNode ? findPath(hierarchy, selectedNode.identifier) : []),
    [hierarchy, selectedNode]
  );
  const tableSpace = selectedNode ? TABLE_SPACE[isTableOpen ? 'sheet' : 'bar'] : TABLE_SPACE.none;

  useEffect(() => {
    if (!instanceId) return;
    getInstanceHierarchy(instanceId)
      .then(res => setHierarchy(res.geoTree ?? []))
      .catch(err => toast.error(err));
    getInstanceDatasets()
      .then(setDatasets)
      .catch(err => toast.error(err));
    getInstanceTeams(instanceId)
      .then(setTeams)
      .catch(err => toast.error(err));
  }, [instanceId]);

  return (
    <div className={styles.deck} style={{ '--table-space': tableSpace } as CSSProperties}>
      <CampaignMap mapStyle={mapStyle} />
      <TopBar path={selectedPath} />
      {instanceId ? (
        <LeftPanel
          hierarchy={hierarchy}
          datasets={datasets}
          teams={teams}
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
