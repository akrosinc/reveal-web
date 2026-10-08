import { useTranslation } from 'react-i18next';
import { SiteGroup } from '../../placeholderData';
import DeckModal from '../DeckModal';
import modal from '../DeckModal/DeckModal.module.css';

interface Props {
  group: SiteGroup;
  name: string;
  onClose: () => void;
}

const SiteGroupModal = ({ group, name, onClose }: Props) => {
  const { t } = useTranslation();

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
            {t('campaignPlanning.sitesShown', { shown: group.sites.length, total: group.target })}
          </div>
          {group.sites.map(site => (
            <div key={site.name} className={modal.miniRow}>
              <span className={modal.miniName}>{site.name}</span>
              <span className={modal.miniType}>{site.type}</span>
              <span className={`${modal.miniStatus} ${site.isMapped ? modal.mapped : modal.notMapped}`}>
                {t(site.isMapped ? 'campaignPlanning.mapped' : 'campaignPlanning.notMapped')}
              </span>
            </div>
          ))}
        </>
      )}
    </DeckModal>
  );
};

export default SiteGroupModal;
