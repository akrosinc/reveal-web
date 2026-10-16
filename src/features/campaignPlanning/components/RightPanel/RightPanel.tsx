import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsChevronUp } from 'react-icons/bs';
import { POPULATION, SCHOOLS, ZONES } from '../../placeholderData';
import { HierarchyNode, Site, SiteGeometry } from '../../providers/types';
import { getSiteGroups, SiteGroup } from '../../utils/sites';
import ActivityTab from './ActivityTab';
import DemographicsTab from './DemographicsTab';
import Field from './Field';
import PopulationModal from './PopulationModal';
import SiteGroupModal from './SiteGroupModal';
import SitesTab from './SitesTab';
import ZonesSchoolsModal, { ZonesSchoolsCounts } from './ZonesSchoolsModal';
import styles from './RightPanel.module.css';

type Tab = 'sites' | 'activity' | 'demographics';

const TABS: Tab[] = ['sites', 'activity', 'demographics'];

interface Props {
  node: HierarchyNode;
  isCollapsed: boolean;
  onCollapsedChange: (isCollapsed: boolean) => void;
  sites: Site[];
  onAddSite: (geometry: SiteGeometry) => void;
}

const RightPanel = ({ node, isCollapsed, onCollapsedChange: setIsCollapsed, sites, onAddSite }: Props) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('sites');
  const [isPopulationOpen, setIsPopulationOpen] = useState(false);
  const [openSiteGroup, setOpenSiteGroup] = useState<SiteGroup>();
  const [isZonesSchoolsOpen, setIsZonesSchoolsOpen] = useState(false);
  const [zonesSchoolsByArea, setZonesSchoolsByArea] = useState<Record<string, ZonesSchoolsCounts>>({});
  const zonesSchools = zonesSchoolsByArea[node.identifier] ?? { zones: ZONES, schools: SCHOOLS };
  const saveZonesSchools = (counts: ZonesSchoolsCounts) =>
    setZonesSchoolsByArea(current => ({ ...current, [node.identifier]: counts }));
  const siteGroups = useMemo(() => getSiteGroups(sites), [sites]);
  const { name, geographicLevel } = node.properties;

  return (
    // Collapsed (design state 4): only the header stays, the rail and panel body fold away
    <div className={isCollapsed ? `${styles.panel} ${styles.collapsed}` : styles.panel}>
      <div className={styles.header}>
        <div className={styles.name}>{name}</div>
        {!isCollapsed && (
          <button
            type="button"
            id="campaign-planning-hide-details-button"
            className={styles.collapseButton}
            title={t('campaignPlanning.hideDetails')}
            aria-label={t('campaignPlanning.hideDetails')}
            onClick={() => setIsCollapsed(true)}
          >
            <BsChevronUp />
          </button>
        )}
      </div>
      <div className={styles.type}>{geographicLevel}</div>
      <Field
        label={t('campaignPlanning.mohPopulation')}
        value={POPULATION.moh}
        onClick={() => setIsPopulationOpen(true)}
      />
      <Field
        label={t('campaignPlanning.userPopulation')}
        value={POPULATION.user}
        className={isCollapsed ? styles.fieldDivider : undefined}
      />
      {isCollapsed ? (
        <button
          type="button"
          id="campaign-planning-show-details-button"
          className={styles.strip}
          title={t('campaignPlanning.showDetails')}
          aria-label={t('campaignPlanning.showDetails')}
          onClick={() => setIsCollapsed(false)}
        >
          ⌄
        </button>
      ) : (
        <>
          <div className={styles.pills}>
            {TABS.map(tab => (
              <button
                key={tab}
                id={`campaign-planning-${tab}-tab`}
                type="button"
                className={tab === activeTab ? `${styles.pill} ${styles.pillActive}` : styles.pill}
                onClick={() => setActiveTab(tab)}
              >
                {t(`campaignPlanning.${tab}Tab`)}
              </button>
            ))}
          </div>
          {activeTab === 'sites' && (
            <SitesTab
              siteGroups={siteGroups}
              zonesSchools={zonesSchools}
              onEditZonesSchools={() => setIsZonesSchoolsOpen(true)}
              onOpenGroup={setOpenSiteGroup}
              canAddSites={!node.children?.length}
              onAddSite={onAddSite}
            />
          )}
          {activeTab === 'activity' && <ActivityTab />}
          {activeTab === 'demographics' && <DemographicsTab />}
        </>
      )}

      {isPopulationOpen && <PopulationModal name={name} onClose={() => setIsPopulationOpen(false)} />}
      {isZonesSchoolsOpen && (
        <ZonesSchoolsModal
          name={name}
          counts={zonesSchools}
          onSave={saveZonesSchools}
          onClose={() => setIsZonesSchoolsOpen(false)}
        />
      )}
      {openSiteGroup && (
        <SiteGroupModal group={openSiteGroup} name={name} onClose={() => setOpenSiteGroup(undefined)} />
      )}
    </div>
  );
};

export default memo(RightPanel);
