import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsChevronUp } from 'react-icons/bs';
import {
  getSiteTargetTag,
  SITE_GEOGRAPHIC_LEVEL,
  SITE_TYPES,
  TAG_MOH_POPULATION,
  TAG_SCHOOLS,
  TAG_USER_POPULATION,
  TAG_ZONES
} from '../../constants';
import { useTagCounts } from '../../hooks/useTagCounts';
import { HierarchyNode, Site, SiteGeometry, TagValues } from '../../providers/types';
import { getSiteGroups } from '../../utils/sites';
import { formatTagValue, toSitesAdded, toSiteTargets } from '../../utils/tagCounts';
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

const NO_VALUES: TagValues = {};

interface Props {
  node: HierarchyNode;
  instanceId?: string;
  areaTagValues?: TagValues;
  isCollapsed: boolean;
  onCollapsedChange: (isCollapsed: boolean) => void;
  sites: Site[];
  onAddSite: (geometry: SiteGeometry) => void;
  onEditSite: (site: Site) => void;
  onDeleteSite: (identifier: string) => Promise<void>;
}

const RightPanel = ({
  node,
  instanceId,
  areaTagValues,
  isCollapsed,
  onCollapsedChange: setIsCollapsed,
  sites,
  onAddSite,
  onEditSite,
  onDeleteSite
}: Props) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('sites');
  const [isPopulationOpen, setIsPopulationOpen] = useState(false);
  const [openSiteGeometry, setOpenSiteGeometry] = useState<SiteGeometry>();
  const [isZonesSchoolsOpen, setIsZonesSchoolsOpen] = useState(false);
  const { name, geographicLevel } = node.properties;
  const isCatchment = geographicLevel?.toLowerCase() === SITE_GEOGRAPHIC_LEVEL;
  const { values, save } = useTagCounts(node.identifier, isCatchment, instanceId);
  const tagValues = (isCatchment ? values : areaTagValues) ?? NO_VALUES;
  const canEditCounts = isCatchment && !!values;
  const zonesSchools = { zones: tagValues[TAG_ZONES] ?? 0, schools: tagValues[TAG_SCHOOLS] ?? 0 };
  const saveZonesSchools = (counts: ZonesSchoolsCounts) => {
    const tags = [
      { tag: TAG_ZONES, count: counts.zones },
      { tag: TAG_SCHOOLS, count: counts.schools }
    ].filter(item => item.count !== (tagValues[item.tag] ?? 0));
    return tags.length ? save(tags) : Promise.resolve();
  };
  const saveSiteTarget = (typeId: string, target: number) => {
    const type = SITE_TYPES.find(item => item.id === typeId);
    return type ? save([{ tag: getSiteTargetTag(type.subtype), count: target }]) : Promise.resolve();
  };
  const siteGroups = useMemo(
    () => getSiteGroups(sites, toSiteTargets(tagValues), isCatchment ? undefined : toSitesAdded(tagValues)),
    [sites, tagValues, isCatchment]
  );
  const openSiteGroup = siteGroups.find(group => group.geometry === openSiteGeometry);

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
        value={formatTagValue(tagValues[TAG_MOH_POPULATION])}
        onClick={() => setIsPopulationOpen(true)}
      />
      <Field
        label={t('campaignPlanning.userPopulation')}
        value={formatTagValue(tagValues[TAG_USER_POPULATION])}
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
              onOpenGroup={group => setOpenSiteGeometry(group.geometry)}
              isCatchment={isCatchment}
              canEditCounts={canEditCounts}
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
        <SiteGroupModal
          group={openSiteGroup}
          name={name}
          onTargetChange={saveSiteTarget}
          canEditTargets={canEditCounts}
          canAddSites={isCatchment}
          onAddSite={() => {
            setOpenSiteGeometry(undefined);
            onAddSite(openSiteGroup.geometry);
          }}
          onEditSite={identifier => {
            const site = sites.find(item => item.identifier === identifier);
            setOpenSiteGeometry(undefined);
            if (site) onEditSite(site);
          }}
          onDeleteSite={onDeleteSite}
          onClose={() => setOpenSiteGeometry(undefined)}
        />
      )}
    </div>
  );
};

export default memo(RightPanel);
