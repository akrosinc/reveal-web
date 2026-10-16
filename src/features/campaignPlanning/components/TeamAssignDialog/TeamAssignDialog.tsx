import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { assignLocationsToTeam, getTeamLocations } from '../../api';
import { Team } from '../../providers/types';
import DeckModal from '../DeckModal';
import styles from './TeamAssignDialog.module.css';

interface Props {
  planId: string;
  locationId: string;
  locationName: string;
  teams: Team[];
  onDone: () => void;
  onClose: () => void;
}

const TeamAssignDialog = ({ planId, locationId, locationName, teams, onDone, onClose }: Props) => {
  const { t } = useTranslation();
  const [teamLocations, setTeamLocations] = useState<Record<string, string[]>>();
  const [selectedId, setSelectedId] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);
  const selectedLocations = selectedId ? teamLocations?.[selectedId] ?? [] : [];
  const isSelectedAssigned = selectedLocations.includes(locationId);

  useEffect(() => {
    let isCurrent = true;
    Promise.all(teams.map(team => getTeamLocations(team.identifier, planId)))
      .then(results => {
        if (isCurrent)
          setTeamLocations(Object.fromEntries(teams.map((team, index) => [team.identifier, results[index]])));
      })
      .catch(err => isCurrent && toast.error(err));
    return () => {
      isCurrent = false;
    };
  }, [teams, planId]);

  const save = () => {
    if (!selectedId) return;
    const locationIds = isSelectedAssigned
      ? selectedLocations.filter(id => id !== locationId)
      : [...selectedLocations, locationId];
    setIsSaving(true);
    assignLocationsToTeam(selectedId, locationIds, planId)
      .then(() => {
        onDone();
        onClose();
      })
      .catch(err => {
        toast.error(err);
        setIsSaving(false);
      });
  };

  return (
    <DeckModal
      title={t('campaignPlanning.selectTeam')}
      subtitle={t('campaignPlanning.catchment', { name: locationName })}
      onClose={onClose}
    >
      {!teamLocations ? (
        <div className={styles.loading}>{t('campaignPlanning.loadingTeams')}</div>
      ) : (
        <div className={styles.list} role="radiogroup">
          {teams.map(team => {
            const isAssigned = teamLocations[team.identifier]?.includes(locationId);
            return (
              <button
                key={team.identifier}
                type="button"
                role="radio"
                aria-checked={team.identifier === selectedId}
                className={team.identifier === selectedId ? `${styles.team} ${styles.selected}` : styles.team}
                onClick={() => setSelectedId(team.identifier)}
              >
                <span className={styles.teamName}>{team.name}</span>
                <span className={styles.teamMeta}>
                  {t('campaignPlanning.teamMembersCount', { count: team.members.length })}
                  {isAssigned && <span className={styles.badge}>{t('campaignPlanning.assigned')}</span>}
                </span>
              </button>
            );
          })}
        </div>
      )}
      <div className={styles.actions}>
        <button type="button" id="campaign-planning-team-cancel" className={styles.cancel} onClick={onClose}>
          {t('buttons.cancel')}
        </button>
        <button
          type="button"
          id="campaign-planning-team-save"
          className={isSelectedAssigned ? styles.unassign : styles.assign}
          disabled={!selectedId || isSaving}
          onClick={save}
        >
          {isSelectedAssigned ? t('campaignPlanning.unassign') : t('campaignPlanning.assign')}
        </button>
      </div>
    </DeckModal>
  );
};

export default TeamAssignDialog;
