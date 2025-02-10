import { useState, useEffect } from 'react';
import styles from './AssignToTeamsDialog.module.css';

interface AssignToTeamsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign: (teamId: number) => void;
  teams: any[];
}

export function AssignToTeamsDialog({ isOpen, onOpenChange, onAssign, teams }: AssignToTeamsDialogProps) {
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  console.log(teams);

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

  const filteredTeams = teams.filter(team => team.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleAssign = () => {
    if (selectedTeam) {
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

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.dialog} onClick={e => e.stopPropagation()}>
        <header className={styles.header}>
          <h2 className={styles.title}>Select Team</h2>
        </header>

        <div className={`${styles.teamsList} ${styles.customScroll}`}>
          {filteredTeams.map(team => (
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
              {selectedTeam === team.identifier && team.active && '✔'}
            </button>
          ))}
        </div>

        <div className={styles.actions}>
          <button onClick={handleClose} className={styles.cancelButton}>
            Cancel
          </button>
          <button onClick={handleAssign} disabled={!selectedTeam} className={styles.assignButton}>
            Assign
          </button>
        </div>
      </div>
    </div>
  );
}
