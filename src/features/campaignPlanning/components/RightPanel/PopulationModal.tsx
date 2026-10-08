import { useTranslation } from 'react-i18next';
import { AGE_SEX_BANDS } from '../../placeholderData';
import DeckModal from '../DeckModal';
import modal from '../DeckModal/DeckModal.module.css';

interface Props {
  name: string;
  onClose: () => void;
}

const PopulationModal = ({ name, onClose }: Props) => {
  const { t } = useTranslation();

  return (
    <DeckModal
      title={t('campaignPlanning.ageSexBands')}
      subtitle={t('campaignPlanning.readOnly', { name })}
      onClose={onClose}
    >
      {AGE_SEX_BANDS.map(band => (
        <div key={band.label} className={modal.row}>
          <span className={modal.rowLabel}>{band.label}</span>
          <span className={modal.rowValue}>{band.count}</span>
        </div>
      ))}
      <div className={modal.note}>{t('campaignPlanning.bandsNote')}</div>
    </DeckModal>
  );
};

export default PopulationModal;
