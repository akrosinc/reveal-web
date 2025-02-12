import { useState, useEffect } from 'react';
import styles from './AssignToTeamsDialog.module.css';
import CheckIcon from '../../../../assets/svgs/check-circle.svg';
import { usePolygonContext } from '../../../../contexts/PolygonContext';
import { assignLocationToTeam, getLocationsAssignedToATeam } from './api/teamAssignmentAPI';
import { getSimulationData } from '../SimulationMapView/api/datasetsAPI';

interface AssignToTeamsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  teams: any[];
  selectedLocation: any;
}

export function AssignToTeamsDialog({ isOpen, onOpenChange, teams, selectedLocation }: AssignToTeamsDialogProps) {
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null);
  const { state, dispatch } = usePolygonContext();
  const planId = state.planid;

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!selectedLocation) return null;

  const assignedTeamsToLocation = JSON.parse(selectedLocation?.properties?.teamsAssigned || '[]');
  const assignedTeamIdentifiers = assignedTeamsToLocation.map((team: any) => team.identifier);

  const unassignedTeams = teams.filter(team => !assignedTeamIdentifiers.includes(team.identifier));
  const assignedTeams = teams.filter(team => assignedTeamIdentifiers.includes(team.identifier));

  const handleAssign = async () => {
    if (selectedTeam && selectedLocation) {
      getLocationsAssignedToATeam(selectedTeam.identifier, planId).then(response => {
        const selectedLocationsId = [...response, selectedLocation.properties.id];
        assignLocationToTeam(selectedTeam.identifier, selectedLocationsId, planId).then(async () => {
          const simulationData = await getSimulationData(state.planid);
          dispatch({
            type: 'LOCATIONS_WITH_TEAMS_ASSIGNED',
            payload: { [selectedLocation.properties.id]: selectedTeam.identifier }
          });
          dispatch({ type: 'SET_TARGET_AREAS', payload: simulationData.targetAreas });
          dispatch({ type: 'CLEAR_SELECTION' });
        });
      });
      setSelectedTeam(null);
      onOpenChange(false);
    }
  };

  const handleUnassign = async () => {
    if (selectedTeam && selectedLocation) {
      getLocationsAssignedToATeam(selectedTeam.identifier, planId).then(response => {
        const selectedLocationsId = response.filter((location: any) => location !== selectedLocation.properties.id);
        assignLocationToTeam(selectedTeam.identifier, selectedLocationsId, planId).then(async () => {
          const simulationData = await getSimulationData(state.planid);
          dispatch({ type: 'SET_TARGET_AREAS', payload: simulationData.targetAreas });
          dispatch({ type: 'CLEAR_SELECTION' });
        });
      });
      setSelectedTeam(null);
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setSelectedTeam(null);
    onOpenChange(false);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.dialog} onClick={e => e.stopPropagation()}>
        <header className={styles.header}>
          <h2 className={styles.title}>Select Team</h2>
        </header>

        <div className={`${styles.teamsList} ${styles.customScroll}`}>
          {assignedTeams.map(team => (
            <button
              key={team.identifier}
              onClick={() => setSelectedTeam(team)}
              className={`${styles.teamButton} ${selectedTeam?.identifier === team.identifier ? styles.selected : ''}`}
            >
              <div className={styles.teamInfo}>
                <div className={styles.teamHeader}>
                  <span className={styles.teamName}>{team.name}</span>
                  <div className={`${styles.statusDot} ${team.active ? styles.active : styles.inactive}`} />
                </div>
                <span className={styles.teamMembers}>
                  {team.members.length} members • {team.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className={styles.assignedTeam}>
                <span>assigned</span>
              </div>
            </button>
          ))}
          {unassignedTeams.map(team => (
            <button
              key={team.identifier}
              onClick={() => setSelectedTeam(team)}
              className={`${styles.teamButton} ${selectedTeam?.identifier === team.identifier ? styles.selected : ''}`}
            >
              <div className={styles.teamInfo}>
                <div className={styles.teamHeader}>
                  <span className={styles.teamName}>{team.name}</span>
                  <div className={`${styles.statusDot} ${team.active ? styles.active : styles.inactive}`} />
                </div>
                <span className={styles.teamMembers}>
                  {team.members.length} members • {team.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              {selectedTeam?.identifier === team.identifier && team.active && (
                <img src={CheckIcon} alt="Check Icon" className={styles.checkIcon} />
              )}
            </button>
          ))}
        </div>

        <div className={styles.actions}>
          <button onClick={handleClose} className={styles.cancelButton}>
            Cancel
          </button>
          {selectedTeam && assignedTeams.some(team => team.identifier === selectedTeam.identifier) ? (
            <button onClick={handleUnassign} className={styles.unassignButton}>
              Unassign
            </button>
          ) : (
            <button onClick={handleAssign} disabled={!selectedTeam} className={styles.assignButton}>
              Assign
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
