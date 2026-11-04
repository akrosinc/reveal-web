import { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsChevronUp, BsPlusCircle } from 'react-icons/bs';
import { toast } from 'react-toastify';
import { getRecaptureLimitsByInstanceAndLocation } from '../../api';
import { POPULATION, SCHOOLS, ZONES } from '../../placeholderData';
import { Action, HierarchyNode, Site, SiteGeometry, SiteTargets } from '../../providers/types';
import { getSiteGroups } from '../../utils/sites';
import ActivityTab from './ActivityTab';
import AddActionModal from './AddActionModal';
import DemographicsTab from './DemographicsTab';
import Field from './Field';
import PopulationModal from './PopulationModal';
import SiteGroupModal from './SiteGroupModal';
import SitesTab from './SitesTab';
import ZonesSchoolsModal, { ZonesSchoolsCounts } from './ZonesSchoolsModal';
import styles from './RightPanel.module.css';

type Tab = 'sites' | 'activity' | 'demographics';

const TABS: Tab[] = ['sites', 'activity', 'demographics'];

const NO_TARGETS: SiteTargets = {};

interface Props {
  node: HierarchyNode;
  isCollapsed: boolean;
  onCollapsedChange: (isCollapsed: boolean) => void;
  sites: Site[];
  onAddSite: (geometry: SiteGeometry) => void;
  actions: Action[];
  instanceId?: string;
}

const RightPanel = ({
  node,
  isCollapsed,
  onCollapsedChange: setIsCollapsed,
  sites,
  onAddSite,
  actions,
  instanceId
}: Props) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('sites');
  const [isAddActionOpen, setIsAddActionOpen] = useState(false);
  const [isPopulationOpen, setIsPopulationOpen] = useState(false);
  const [openSiteGeometry, setOpenSiteGeometry] = useState<SiteGeometry>();
  const [siteTargetsByArea, setSiteTargetsByArea] = useState<Record<string, SiteTargets>>({});
  const [isZonesSchoolsOpen, setIsZonesSchoolsOpen] = useState(false);
  const [zonesSchoolsByArea, setZonesSchoolsByArea] = useState<Record<string, ZonesSchoolsCounts>>({});
  // Activities the user has added per area, from the add-action modal
  const [activitiesByArea, setActivitiesByArea] = useState<Record<string, Action[]>>({});
  const activities = activitiesByArea[node.identifier] ?? [];
  const addActivity = (action: Action) =>
    setActivitiesByArea(current => {
      const existing = current[node.identifier] ?? [];
      if (existing.some(item => item.identifier === action.identifier)) return current;
      return { ...current, [node.identifier]: [...existing, action] };
    });

  // On entry, surface the activities already captured for this instance+location so they render
  // (ActivityTab only shows activities present in this list). Saved actions are resolved from the
  // instance's actions, and merged with any the user has added in this session.
  const areaId = node.identifier;
  useEffect(() => {
    if (!instanceId || !areaId || !actions.length) return;
    let isCurrent = true;
    getRecaptureLimitsByInstanceAndLocation(instanceId, areaId)
      .then(limits => {
        if (!isCurrent) return;
        const savedActions = limits
          .map(limit => actions.find(action => action.identifier === limit.actionIdentifier))
          .filter((action): action is Action => !!action);
        if (!savedActions.length) return;
        setActivitiesByArea(current => {
          const existing = current[areaId] ?? [];
          const existingIds = new Set(existing.map(item => item.identifier));
          const merged = [...existing, ...savedActions.filter(action => !existingIds.has(action.identifier))];
          return { ...current, [areaId]: merged };
        });
      })
      .catch(err => isCurrent && toast.error(String(err)));
    return () => {
      isCurrent = false;
    };
  }, [instanceId, areaId, actions]);
  const zonesSchools = zonesSchoolsByArea[node.identifier] ?? { zones: ZONES, schools: SCHOOLS };
  const saveZonesSchools = (counts: ZonesSchoolsCounts) =>
    setZonesSchoolsByArea(current => ({ ...current, [node.identifier]: counts }));
  const siteTargets = siteTargetsByArea[node.identifier] ?? NO_TARGETS;
  const saveSiteTarget = (typeId: string, target: number) =>
    setSiteTargetsByArea(current => ({
      ...current,
      [node.identifier]: { ...current[node.identifier], [typeId]: target }
    }));
  const siteGroups = useMemo(() => getSiteGroups(sites, siteTargets), [sites, siteTargets]);
  const openSiteGroup = siteGroups.find(group => group.geometry === openSiteGeometry);
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
            <div className={styles.pillGroup}>
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
            <button
              type="button"
              id="campaign-planning-add-action-button"
              className={styles.addAction}
              title={t('campaignPlanning.addAction')}
              aria-label={t('campaignPlanning.addAction')}
              onClick={() => setIsAddActionOpen(true)}
            >
              <BsPlusCircle />
            </button>
          </div>
          {activeTab === 'sites' && (
            <SitesTab
              siteGroups={siteGroups}
              zonesSchools={zonesSchools}
              onEditZonesSchools={() => setIsZonesSchoolsOpen(true)}
              onOpenGroup={group => setOpenSiteGeometry(group.geometry)}
              isLowestLevel={!node.children?.length}
              onAddSite={onAddSite}
            />
          )}
          {activeTab === 'activity' && (
            <ActivityTab activities={activities} instanceId={instanceId} locationId={node.identifier} />
          )}
          {activeTab === 'demographics' && <DemographicsTab />}
        </>
      )}

      {isAddActionOpen && (
        <AddActionModal
          name={name}
          actions={actions}
          addedIds={activities.map(activity => activity.identifier)}
          onAdd={addActivity}
          onClose={() => setIsAddActionOpen(false)}
        />
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
          onClose={() => setOpenSiteGeometry(undefined)}
        />
      )}
    </div>
  );
};

export default memo(RightPanel);
