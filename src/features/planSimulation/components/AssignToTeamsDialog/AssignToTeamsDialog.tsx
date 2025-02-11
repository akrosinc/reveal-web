import { useState, useEffect } from 'react';
import styles from './AssignToTeamsDialog.module.css';
import CheckIcon from '../../../../assets/svgs/check-circle.svg';
import RemoveIcon from '../../../../assets/svgs/remove-minus.svg';
import { usePolygonContext } from '../../../../contexts/PolygonContext';
import { assignLocationToTeam } from './api/teamAssignmentAPI';
import { getSimulationData } from '../SimulationMapView/api/datasetsAPI';

interface AssignToTeamsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign: (teamId: number) => void;
  teams: any[];
  selectedLocation: any;
}

export function AssignToTeamsDialog({
  isOpen,
  onOpenChange,
  onAssign,
  teams,
  selectedLocation
}: AssignToTeamsDialogProps) {
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { state, dispatch } = usePolygonContext();
  const planId = state.planid;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!selectedLocation) return null;

  const assignedTeamsToLocation = JSON.parse(selectedLocation?.properties?.teamsAssigned || '[]');

  // Extract identifiers from assigned teams
  const assignedTeamIdentifiers = assignedTeamsToLocation.map((team: any) => team.identifier);

  const unassignedTeams = teams.filter(team => !assignedTeamIdentifiers.includes(team.identifier));
  const assignedTeams = teams.filter(team => assignedTeamIdentifiers.includes(team.identifier));

  //   console.log('Unassigned Teams', unassignedTeams);
  //   console.log('Assigned Teams', assignedTeamsToLocation);

  const handleAssign = async () => {
    if (selectedTeam && selectedLocation) {
      if (assignedTeams.some(team => team.identifier === selectedTeam)) {
        assignLocationToTeam(selectedTeam, '', planId);
        console.log('Unassigning Location from Team');
      } else {
        assignLocationToTeam(selectedTeam, selectedLocation.properties?.id, planId);
        console.log('Assigning Location to Team', selectedTeam);
      }
      const simulationData = await getSimulationData(state.planid);
      dispatch({ type: 'SET_TARGET_AREAS', payload: simulationData.targetAreas });
      dispatch({ type: 'CLEAR_SELECTION' });

      onAssign(selectedTeam);
      setSelectedTeam(null);
      setSearchQuery('');
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setSelectedTeam(null);
    setSearchQuery('');
    onOpenChange(false);
  };

  //   console.log('Selected Team', selectedTeam);
  //   console.log('AssignedTeams', assignedTeams);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.dialog} onClick={e => e.stopPropagation()}>
        <header className={styles.header}>
          <h2 className={styles.title}>Select Team</h2>
        </header>

        <div className={`${styles.teamsList} ${styles.customScroll}`}>
          {assignedTeams.length > 0 && (
            <>
              {assignedTeams.map(team => (
                <button
                  key={team.identifier}
                  onClick={() => setSelectedTeam(team.identifier)}
                  className={`${styles.teamButton} ${selectedTeam === team.identifier ? styles.selected : ''}`}
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
            </>
          )}
          {unassignedTeams.map(team => (
            <button
              key={team.identifier}
              onClick={() => setSelectedTeam(team.identifier)}
              className={`${styles.teamButton} ${selectedTeam === team.identifier ? styles.selected : ''}`}
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
              {selectedTeam === team.identifier && team.active && (
                <img src={CheckIcon} alt="Check Icon" className={styles.checkIcon} />
              )}
            </button>
          ))}
        </div>

        <div className={styles.actions}>
          <button onClick={handleClose} className={styles.cancelButton}>
            Cancel
          </button>

          {selectedTeam && assignedTeams.some(team => team.identifier === selectedTeam) ? (
            <button onClick={handleAssign} className={styles.unassignButton}>
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
