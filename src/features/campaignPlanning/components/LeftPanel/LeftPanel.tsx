import { memo, useMemo, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { BsCheckLg, BsChevronDown, BsChevronLeft, BsEye, BsEyeSlash, BsPlusCircle } from 'react-icons/bs';
import AuthorizedElement from '../../../../components/AuthorizedElement';
import {
  CAMPAIGN_PLANNING_ADD_DATASET,
  CAMPAIGN_PLANNING_ADD_RASTER,
  CAMPAIGN_PLANNING_VIEW_RASTER
} from '../../../../constants';
import {
  HierarchyNode,
  InstanceListItem,
  RasterDataset,
  SimulationDataset,
  Team,
  ValueRange
} from '../../providers/types';
import { getDatasetColor } from '../../utils/datasets';
import { filterHierarchy } from '../../utils/hierarchyTree';
import DatasetFilter from '../DatasetFilter';
import HierarchyTree from '../HierarchyTree';
import Skeleton from '../Skeleton';
import RasterDatasetRow from '../RasterDatasetRow';
import PanelSection from './PanelSection';
import styles from './LeftPanel.module.css';

interface Props {
  instances: InstanceListItem[];
  instanceId?: string;
  onInstanceSelect: (instanceId: string) => void;
  hierarchy: HierarchyNode[];
  datasets: SimulationDataset[];
  rasterDatasets: RasterDataset[];
  valueBounds: Record<string, ValueRange>;
  datasetFilters: Record<string, ValueRange | undefined>;
  onDatasetFilterToggle: (datasetId: string) => void;
  onDatasetFilterChange: (datasetId: string, range: ValueRange) => void;
  // The plan's simulation, which datasets are added to and saved in; no simulation = no add / edit
  simulationId?: string;
  onAddDataset: () => void;
  onDatasetSave: (dataset: SimulationDataset) => void;
  hiddenDatasetIds: string[];
  onDatasetVisibilityToggle: (datasetId: string) => void;
  onAllDatasetsVisibilityChange: (isHidden: boolean) => void;
  onDatasetDelete: (dataset: SimulationDataset) => Promise<void>;
  onAddRaster: () => void;
  hiddenRasterIds: string[];
  onRasterVisibilityToggle: (rasterId: string) => void;
  onRasterDatasetSave: (
    raster: RasterDataset,
    colorRamp: string,
    opacity?: number,
    name?: string,
    metadata?: Record<string, unknown>
  ) => Promise<void>;
  onRasterDatasetDelete: (raster: RasterDataset) => Promise<void>;
  teams: Team[];
  isHierarchyLoading: boolean;
  isDatasetsLoading: boolean;
  isTeamsLoading: boolean;
  selectedId?: string;
  onSelect: (node: HierarchyNode) => void;
}

const LeftPanel = ({
  instances,
  instanceId,
  onInstanceSelect,
  hierarchy,
  datasets,
  rasterDatasets,
  valueBounds,
  datasetFilters,
  onDatasetFilterToggle,
  onDatasetFilterChange,
  simulationId,
  onAddDataset,
  onDatasetSave,
  hiddenDatasetIds,
  onDatasetVisibilityToggle,
  onAllDatasetsVisibilityChange,
  onDatasetDelete,
  onAddRaster,
  hiddenRasterIds,
  onRasterVisibilityToggle,
  onRasterDatasetSave,
  onRasterDatasetDelete,
  teams,
  isHierarchyLoading,
  isDatasetsLoading,
  isTeamsLoading,
  selectedId,
  onSelect
}: Props) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const areAllDatasetsHidden =
    !!datasets.length && datasets.every(dataset => hiddenDatasetIds.includes(dataset.identifier));
  const toggleAllDatasetsLabel = t(
    areAllDatasetsHidden ? 'campaignPlanning.showAllDatasets' : 'campaignPlanning.hideAllDatasets'
  );
  const [isCollapsed, setIsCollapsed] = useState(false);
  const selectedInstance = instances.find(instance => instance.identifier === instanceId);
  const filteredHierarchy = useMemo(() => filterHierarchy(hierarchy, searchTerm), [hierarchy, searchTerm]);

  return (
    <>
      {isCollapsed && (
        <button
          type="button"
          id="campaign-planning-show-hierarchy-button"
          className={styles.toggle}
          title={t('campaignPlanning.showHierarchy')}
          aria-label={t('campaignPlanning.showHierarchy')}
          onClick={() => setIsCollapsed(false)}
        >
          <span className={styles.toggleDot} />
          <span className={styles.toggleDot} />
          <span className={styles.toggleDot} />
        </button>
      )}
      {/* Kept mounted while collapsed so search and expanded nodes survive */}
      {/* data-popup-edge: the dataset colour panel opens just right of this card */}
      <div className={styles.panel} hidden={isCollapsed} data-popup-edge>
        {!!instances.length && (
          <Dropdown className={styles.instance}>
            <Dropdown.Toggle
              as="button"
              id="campaign-planning-instance-select"
              className={styles.instanceToggle}
              aria-label={t('campaignPlanning.instance')}
            >
              <span className={selectedInstance ? styles.instanceName : styles.instancePlaceholder}>
                {selectedInstance?.instanceName ?? t('campaignPlanning.selectInstanceOption')}
              </span>
              <BsChevronDown className={styles.instanceChevron} />
            </Dropdown.Toggle>
            <Dropdown.Menu className={styles.instanceMenu}>
              {instances.map(instance => (
                <Dropdown.Item
                  key={instance.identifier}
                  as="button"
                  type="button"
                  className={styles.instanceItem}
                  active={instance.identifier === instanceId}
                  onClick={() => onInstanceSelect(instance.identifier)}
                >
                  <span className={styles.instanceText}>
                    <span className={styles.instanceItemName} title={instance.instanceName}>
                      {instance.instanceName}
                    </span>
                    {instance.planTitle && <span className={styles.instancePlan}>{instance.planTitle}</span>}
                  </span>
                  {instance.identifier === instanceId && <BsCheckLg className={styles.instanceCheck} />}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        )}
        {instanceId ? (
          <>
            <div className={styles.searchRow}>
              <input
                id="campaign-planning-search-input"
                className={styles.search}
                placeholder={t('campaignPlanning.searchHierarchy')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <button
                type="button"
                id="campaign-planning-hide-hierarchy-button"
                className={styles.collapseButton}
                title={t('campaignPlanning.hideHierarchy')}
                aria-label={t('campaignPlanning.hideHierarchy')}
                onClick={() => setIsCollapsed(true)}
              >
                <BsChevronLeft />
              </button>
            </div>
            <div className={styles.body}>
              {/* Fixed-height scroll area so opening the tree doesn't push Datasets and Teams down */}
              <div className={styles.tree}>
                <HierarchyTree
                  nodes={filteredHierarchy}
                  selectedId={selectedId}
                  expandAll={!!searchTerm.trim()}
                  onSelect={onSelect}
                />
                {isHierarchyLoading ? (
                  <Skeleton widths={['45%', '60%', '52%', '68%']} />
                ) : (
                  !filteredHierarchy.length && <div className={styles.empty}>{t('campaignPlanning.noLocations')}</div>
                )}
              </div>

              <PanelSection
                title={t('campaignPlanning.datasets')}
                tools={
                  !!datasets.length && (
                    <button
                      type="button"
                      id="campaign-planning-toggle-all-datasets-button"
                      className={styles.sectionTool}
                      title={toggleAllDatasetsLabel}
                      aria-label={toggleAllDatasetsLabel}
                      aria-pressed={areAllDatasetsHidden}
                      onClick={() => onAllDatasetsVisibilityChange(!areAllDatasetsHidden)}
                    >
                      {areAllDatasetsHidden ? <BsEyeSlash /> : <BsEye />}
                    </button>
                  )
                }
                action={
                  simulationId && (
                    <AuthorizedElement roles={[CAMPAIGN_PLANNING_ADD_DATASET]}>
                      <button
                        type="button"
                        id="campaign-planning-add-dataset-button"
                        className={styles.addButton}
                        title={t('campaignPlanning.addDataset')}
                        aria-label={t('campaignPlanning.addDataset')}
                        onClick={onAddDataset}
                      >
                        <BsPlusCircle />
                      </button>
                    </AuthorizedElement>
                  )
                }
              >
                {isDatasetsLoading ? (
                  <Skeleton widths={['58%', '44%']} />
                ) : datasets.length ? (
                  datasets.map((dataset, index) => (
                    <DatasetFilter
                      key={dataset.identifier}
                      dataset={dataset}
                      color={getDatasetColor(dataset, index)}
                      bounds={valueBounds[dataset.identifier]}
                      isOn={dataset.identifier in datasetFilters}
                      range={datasetFilters[dataset.identifier]}
                      onToggle={onDatasetFilterToggle}
                      onChange={onDatasetFilterChange}
                      canEdit={!!simulationId}
                      onSave={onDatasetSave}
                      isHidden={hiddenDatasetIds.includes(dataset.identifier)}
                      onVisibilityToggle={onDatasetVisibilityToggle}
                      onDelete={onDatasetDelete}
                    />
                  ))
                ) : (
                  <div className={styles.empty}>{t('campaignPlanning.noDatasets')}</div>
                )}
              </PanelSection>

              <AuthorizedElement roles={[CAMPAIGN_PLANNING_VIEW_RASTER]}>
                <PanelSection
                  title={t('campaignPlanning.rasterDatasets')}
                  action={
                    simulationId && (
                      <AuthorizedElement roles={[CAMPAIGN_PLANNING_ADD_RASTER]}>
                        <button
                          type="button"
                          id="campaign-planning-add-raster-button"
                          className={styles.addButton}
                          title={t('campaignPlanning.addRaster')}
                          aria-label={t('campaignPlanning.addRaster')}
                          onClick={onAddRaster}
                        >
                          <BsPlusCircle />
                        </button>
                      </AuthorizedElement>
                    )
                  }
                >
                  {isDatasetsLoading ? (
                    <Skeleton widths={['50%']} />
                  ) : rasterDatasets.length ? (
                    rasterDatasets.map(raster => (
                      <RasterDatasetRow
                        key={raster.identifier}
                        raster={raster}
                        canEdit={!!simulationId}
                        isHidden={hiddenRasterIds.includes(raster.identifier)}
                        onVisibilityToggle={onRasterVisibilityToggle}
                        onSave={onRasterDatasetSave}
                        onDelete={onRasterDatasetDelete}
                      />
                    ))
                  ) : (
                    <div className={styles.empty}>{t('campaignPlanning.noRasterDatasets')}</div>
                  )}
                </PanelSection>
              </AuthorizedElement>

              <PanelSection title={t('campaignPlanning.teams')}>
                {isTeamsLoading ? (
                  <Skeleton widths={['72%']} />
                ) : teams.length ? (
                  teams.map(team => (
                    <div key={team.identifier} className={styles.item}>
                      {t('campaignPlanning.teamMembers', { name: team.name, count: team.members?.length ?? 0 })}
                    </div>
                  ))
                ) : (
                  <div className={styles.empty}>{t('campaignPlanning.noTeams')}</div>
                )}
              </PanelSection>
            </div>
          </>
        ) : (
          <div className={styles.empty}>{t('campaignPlanning.selectInstance')}</div>
        )}
      </div>
    </>
  );
};

export default memo(LeftPanel);
