import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsChevronLeft } from 'react-icons/bs';
import { DATASET_COLORS } from '../../constants';
import { HierarchyNode, RasterDataset, SimulationDataset, Team } from '../../providers/types';
import { filterHierarchy } from '../../utils/hierarchyTree';
import HierarchyTree from '../HierarchyTree';
import Skeleton from '../Skeleton';
import PanelSection from './PanelSection';
import styles from './LeftPanel.module.css';

interface Props {
  hierarchy: HierarchyNode[];
  datasets: SimulationDataset[];
  rasterDatasets: RasterDataset[];
  teams: Team[];
  isHierarchyLoading: boolean;
  isDatasetsLoading: boolean;
  isTeamsLoading: boolean;
  selectedId?: string;
  onSelect: (node: HierarchyNode) => void;
}

const LeftPanel = ({
  hierarchy,
  datasets,
  rasterDatasets,
  teams,
  isHierarchyLoading,
  isDatasetsLoading,
  isTeamsLoading,
  selectedId,
  onSelect
}: Props) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
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
      <div className={styles.panel} hidden={isCollapsed}>
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

          <PanelSection title={t('campaignPlanning.datasets')}>
            {isDatasetsLoading ? (
              <Skeleton widths={['58%', '44%']} />
            ) : datasets.length ? (
              datasets.map((dataset, index) => (
                <div key={dataset.identifier} className={styles.item}>
                  <span
                    className={styles.swatch}
                    style={{ background: dataset.hexColor || DATASET_COLORS[index % DATASET_COLORS.length] }}
                  />
                  {dataset.name}
                </div>
              ))
            ) : (
              <div className={styles.empty}>{t('campaignPlanning.noDatasets')}</div>
            )}
          </PanelSection>

          <PanelSection title={t('campaignPlanning.rasterDatasets')}>
            {isDatasetsLoading ? (
              <Skeleton widths={['50%']} />
            ) : rasterDatasets.length ? (
              rasterDatasets.map(raster => (
                <div key={raster.identifier} className={styles.item}>
                  <span className={`${styles.swatch} ${styles.rasterSwatch}`} />
                  {raster.name}
                </div>
              ))
            ) : (
              <div className={styles.empty}>{t('campaignPlanning.noRasterDatasets')}</div>
            )}
          </PanelSection>

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
      </div>
    </>
  );
};

export default LeftPanel;
