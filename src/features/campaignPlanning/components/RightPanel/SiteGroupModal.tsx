import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsCheckLg, BsChevronLeft, BsChevronRight, BsPencil, BsPlusLg, BsXLg } from 'react-icons/bs';
import { SiteGroup } from '../../utils/sites';
import DeckModal from '../DeckModal';
import modal from '../DeckModal/DeckModal.module.css';

const PAGE_SIZE = 5;

const isWholeNumber = (value: string) => /^\d+$/.test(value);

interface Props {
  group: SiteGroup;
  name: string;
  onTargetChange: (typeId: string, target: number) => void;
  canAddSites: boolean;
  onAddSite: () => void;
  onEditSite: (identifier: string) => void;
  onClose: () => void;
}

const SiteGroupModal = ({ group, name, onTargetChange, canAddSites, onAddSite, onEditSite, onClose }: Props) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const pageCount = Math.ceil(group.sites.length / PAGE_SIZE);
  const currentPage = Math.min(page, Math.max(pageCount - 1, 0));
  const from = currentPage * PAGE_SIZE;
  const pageSites = group.sites.slice(from, from + PAGE_SIZE);

  const changeTarget = (typeId: string, value: string) => setDrafts(current => ({ ...current, [typeId]: value }));

  const clearDraft = (typeId: string) => setDrafts(({ [typeId]: _removed, ...current }) => current);

  const [pendingAction, setPendingAction] = useState<() => void>();
  const isDirty = group.types.some(type => drafts[type.id] !== undefined && drafts[type.id] !== String(type.target));
  const confirmIfDirty = (action: () => void) => (isDirty ? setPendingAction(() => action) : action());

  const saveTarget = (typeId: string) => {
    const value = drafts[typeId];
    if (value === undefined || !isWholeNumber(value)) return;
    onTargetChange(typeId, Number(value));
    clearDraft(typeId);
  };

  return (
    <DeckModal
      title={group.label}
      subtitle={t('campaignPlanning.catchment', { name })}
      onClose={() => confirmIfDirty(onClose)}
      discardConfirm={pendingAction && { onConfirm: pendingAction, onCancel: () => setPendingAction(undefined) }}
    >
      {group.types.map(type => {
        const draft = drafts[type.id];
        const isEdited = draft !== undefined && draft !== String(type.target);
        return (
          <div key={type.id} className={`${modal.row} ${modal.editRow}`}>
            <label className={modal.rowLabel} htmlFor={`campaign-planning-site-target-${type.id}`}>
              {type.label}
            </label>
            <span className={modal.rowControls}>
              <input
                id={`campaign-planning-site-target-${type.id}`}
                className={modal.rowInput}
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                value={draft ?? String(type.target)}
                style={{ width: `${Math.max((draft ?? String(type.target)).length, 1) + 0.5}ch` }}
                onChange={e => changeTarget(type.id, e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') saveTarget(type.id);
                  if (e.key === 'Escape') clearDraft(type.id);
                }}
              />
              <span className={modal.rowActions} hidden={!isEdited}>
                <button
                  type="button"
                  id={`campaign-planning-save-site-target-${type.id}`}
                  className={`${modal.rowAction} ${modal.rowSave}`}
                  title={t('campaignPlanning.saveTarget')}
                  aria-label={t('campaignPlanning.saveTarget')}
                  disabled={!isWholeNumber(draft ?? '')}
                  onClick={() => saveTarget(type.id)}
                >
                  <BsCheckLg />
                </button>
                <button
                  type="button"
                  id={`campaign-planning-cancel-site-target-${type.id}`}
                  className={`${modal.rowAction} ${modal.rowCancel}`}
                  title={t('campaignPlanning.cancelTarget')}
                  aria-label={t('campaignPlanning.cancelTarget')}
                  onClick={() => clearDraft(type.id)}
                >
                  <BsXLg />
                </button>
              </span>
            </span>
          </div>
        );
      })}
      <div className={`${modal.sectionLabel} ${modal.sectionRow}`}>
        {group.sites.length
          ? t('campaignPlanning.sitesShown', { shown: pageSites.length, total: group.sites.length })
          : t('campaignPlanning.sites')}
        <button
          type="button"
          id={`campaign-planning-add-${group.geometry}-site-button`}
          className={modal.addButton}
          title={
            canAddSites
              ? t('campaignPlanning.addSiteTo', { name: group.label })
              : t('campaignPlanning.sitesCatchmentOnly')
          }
          aria-label={t('campaignPlanning.addSiteTo', { name: group.label })}
          aria-disabled={!canAddSites}
          onClick={() => canAddSites && confirmIfDirty(onAddSite)}
        >
          <BsPlusLg />
        </button>
      </div>
      {!!group.sites.length && (
        <>
          {pageSites.map(site => (
            <div key={site.identifier} className={modal.miniRow}>
              <span className={modal.miniName}>{site.name}</span>
              <span className={modal.miniType}>{site.type}</span>
              <span className={`${modal.miniStatus} ${site.isMapped ? modal.mapped : modal.notMapped}`}>
                {t(site.isMapped ? 'campaignPlanning.mapped' : 'campaignPlanning.notMapped')}
              </span>
              <button
                type="button"
                id={`campaign-planning-edit-site-${site.identifier}`}
                className={modal.miniEdit}
                title={t('campaignPlanning.editSite', { name: site.name })}
                aria-label={t('campaignPlanning.editSite', { name: site.name })}
                onClick={() => confirmIfDirty(() => onEditSite(site.identifier))}
              >
                <BsPencil />
              </button>
            </div>
          ))}
          {pageCount > 1 && (
            <div className={modal.pager}>
              <span className={modal.pagerRange}>
                {t('campaignPlanning.pageRange', {
                  from: from + 1,
                  to: from + pageSites.length,
                  total: group.sites.length
                })}
              </span>
              <button
                type="button"
                id="campaign-planning-sites-previous-page"
                className={modal.pagerButton}
                aria-label={t('campaignPlanning.previousPage')}
                disabled={currentPage === 0}
                onClick={() => setPage(currentPage - 1)}
              >
                <BsChevronLeft />
              </button>
              <button
                type="button"
                id="campaign-planning-sites-next-page"
                className={modal.pagerButton}
                aria-label={t('campaignPlanning.nextPage')}
                disabled={currentPage === pageCount - 1}
                onClick={() => setPage(currentPage + 1)}
              >
                <BsChevronRight />
              </button>
            </div>
          )}
        </>
      )}
    </DeckModal>
  );
};

export default SiteGroupModal;
