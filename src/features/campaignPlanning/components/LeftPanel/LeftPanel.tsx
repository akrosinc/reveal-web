import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsChevronLeft } from 'react-icons/bs';
import { DATASET_COLORS } from '../../constants';
import { HierarchyNode, InstanceDataset, Team } from '../../providers/types';
import { filterHierarchy } from '../../utils/hierarchyTree';
import HierarchyTree from '../HierarchyTree';
import PanelSection from './PanelSection';
import styles from './LeftPanel.module.css';

interface Props {
  hierarchy: HierarchyNode[];
  datasets: InstanceDataset[];
  teams: Team[];
  selectedId?: string;
  onSelect: (node: HierarchyNode) => void;
}

const LeftPanel = ({ hierarchy, datasets, teams, selectedId, onSelect }: Props) => {
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
          <HierarchyTree
            nodes={filteredHierarchy}
            selectedId={selectedId}
            expandAll={!!searchTerm.trim()}
            onSelect={onSelect}
          />
          {!filteredHierarchy.length && <div className={styles.empty}>{t('campaignPlanning.noLocations')}</div>}

          <PanelSection title={t('campaignPlanning.datasets')}>
            {datasets.length ? (
              datasets.map((dataset, index) => (
                <div key={dataset.identifier} className={styles.item}>
                  <span
                    className={styles.swatch}
                    style={{ background: DATASET_COLORS[index % DATASET_COLORS.length] }}
                  />
                  {dataset.name}
                </div>
              ))
            ) : (
              <div className={styles.empty}>{t('campaignPlanning.noDatasets')}</div>
            )}
          </PanelSection>

          <PanelSection title={t('campaignPlanning.teams')}>
            {teams.length ? (
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
