import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Action } from '../../providers/types';
import DeckModal from '../DeckModal';
import styles from './AddActionModal.module.css';

interface Props {
  name: string;
  actions: Action[];
  // Identifiers of actions already added to the activity tab, hidden from the dropdown
  addedIds: string[];
  onAdd: (action: Action) => void;
  onClose: () => void;
}

// Lists the instance's actions (not yet added) in a dropdown and adds the chosen one as an activity
const AddActionModal = ({ name, actions, addedIds, onAdd, onClose }: Props) => {
  const { t } = useTranslation();
  const available = useMemo(
    () => actions.filter(action => !addedIds.includes(action.identifier)),
    [actions, addedIds]
  );
  const [selectedId, setSelectedId] = useState(available[0]?.identifier ?? '');
  const selected = available.find(action => action.identifier === selectedId);
  const hasActions = available.length > 0;

  const submit = () => {
    if (!selected) return;
    onAdd(selected);
    onClose();
  };

  return (
    <DeckModal
      title={t('campaignPlanning.addAction')}
      subtitle={t('campaignPlanning.addActionTo', { name })}
      onClose={onClose}
      className={styles.card}
    >
      <div className={styles.form}>
        <label className={styles.label} htmlFor="campaign-planning-action-select">
          {t('campaignPlanning.action')}
        </label>
        <select
          id="campaign-planning-action-select"
          className={styles.control}
          value={selectedId}
          disabled={!hasActions}
          onChange={e => setSelectedId(e.target.value)}
        >
          {hasActions ? (
            available.map(action => (
              <option key={action.identifier} value={action.identifier}>
                {action.title}
              </option>
            ))
          ) : (
            <option value="">{t('campaignPlanning.noActions')}</option>
          )}
        </select>
        {selected?.description && <div className={styles.description}>{selected.description}</div>}
        <div className={styles.actions}>
          <button type="button" id="campaign-planning-action-cancel" className={styles.cancel} onClick={onClose}>
            {t('buttons.cancel')}
          </button>
          <button
            type="button"
            id="campaign-planning-action-add"
            className={styles.add}
            disabled={!selected}
            onClick={submit}
          >
            {t('buttons.add')}
          </button>
        </div>
      </div>
    </DeckModal>
  );
};

export default AddActionModal;
