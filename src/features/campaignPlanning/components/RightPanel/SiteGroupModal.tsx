import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import { SiteGroup } from '../../utils/sites';
import DeckModal from '../DeckModal';
import modal from '../DeckModal/DeckModal.module.css';

const PAGE_SIZE = 5;

interface Props {
  group: SiteGroup;
  name: string;
  onClose: () => void;
}

const SiteGroupModal = ({ group, name, onClose }: Props) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const pageCount = Math.ceil(group.sites.length / PAGE_SIZE);
  const currentPage = Math.min(page, Math.max(pageCount - 1, 0));
  const from = currentPage * PAGE_SIZE;
  const pageSites = group.sites.slice(from, from + PAGE_SIZE);

  return (
    <DeckModal title={group.label} subtitle={t('campaignPlanning.catchment', { name })} onClose={onClose}>
      {group.types.map(type => (
        <div key={type.label} className={modal.row}>
          <span className={modal.rowLabel}>{type.label}</span>
          <span className={modal.rowValue}>{type.count}</span>
        </div>
      ))}
      {!!group.sites.length && (
        <>
          <div className={modal.sectionLabel}>
            {t('campaignPlanning.sitesShown', { shown: pageSites.length, total: group.sites.length })}
          </div>
          {pageSites.map(site => (
            <div key={site.name} className={modal.miniRow}>
              <span className={modal.miniName}>{site.name}</span>
              <span className={modal.miniType}>{site.type}</span>
              <span className={`${modal.miniStatus} ${site.isMapped ? modal.mapped : modal.notMapped}`}>
                {t(site.isMapped ? 'campaignPlanning.mapped' : 'campaignPlanning.notMapped')}
              </span>
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
