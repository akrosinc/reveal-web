import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeckModal from '../DeckModal';
import styles from './ZonesSchoolsModal.module.css';

export type ZonesSchoolsKey = 'zones' | 'schools';

export type ZonesSchoolsCounts = Record<ZonesSchoolsKey, number>;

const KEYS: ZonesSchoolsKey[] = ['zones', 'schools'];

const isWholeNumber = (value: string) => /^\d+$/.test(value);

interface Props {
  name: string;
  counts: ZonesSchoolsCounts;
  onSave: (counts: ZonesSchoolsCounts) => void;
  onClose: () => void;
}

const ZonesSchoolsModal = ({ name, counts, onSave, onClose }: Props) => {
  const { t } = useTranslation();
  const [key, setKey] = useState<ZonesSchoolsKey>('zones');
  const [values, setValues] = useState<Record<ZonesSchoolsKey, string>>({
    zones: String(counts.zones),
    schools: String(counts.schools)
  });
  const isValid = KEYS.every(option => isWholeNumber(values[option]));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSave({ zones: Number(values.zones), schools: Number(values.schools) });
    onClose();
  };

  return (
    <DeckModal
      title={t('campaignPlanning.editZonesAndSchools')}
      subtitle={t('campaignPlanning.catchment', { name })}
      onClose={onClose}
      className={styles.card}
    >
      <form className={styles.form} onSubmit={submit}>
        <label className={styles.label} htmlFor="campaign-planning-zones-schools-type">
          {t('campaignPlanning.zonesSchoolsType')}
        </label>
        <select
          id="campaign-planning-zones-schools-type"
          className={styles.control}
          value={key}
          onChange={e => setKey(e.target.value as ZonesSchoolsKey)}
        >
          {KEYS.map(option => (
            <option key={option} value={option}>
              {t(`campaignPlanning.${option}`)}
            </option>
          ))}
        </select>
        <label className={styles.label} htmlFor="campaign-planning-zones-schools-value">
          {t('campaignPlanning.zonesSchoolsValue')}
        </label>
        <input
          id="campaign-planning-zones-schools-value"
          className={styles.control}
          type="number"
          min={0}
          step={1}
          inputMode="numeric"
          value={values[key]}
          autoFocus
          onChange={e => setValues(current => ({ ...current, [key]: e.target.value }))}
        />
        <div className={styles.summary}>
          {KEYS.map(option => (
            <span key={option}>
              {t(`campaignPlanning.${option}`)}: <strong>{values[option] || '—'}</strong>
            </span>
          ))}
        </div>
        <div className={styles.actions}>
          <button type="button" id="campaign-planning-zones-schools-cancel" className={styles.cancel} onClick={onClose}>
            {t('buttons.cancel')}
          </button>
          <button type="submit" id="campaign-planning-zones-schools-save" className={styles.save} disabled={!isValid}>
            {t('buttons.save')}
          </button>
        </div>
      </form>
    </DeckModal>
  );
};

export default ZonesSchoolsModal;
