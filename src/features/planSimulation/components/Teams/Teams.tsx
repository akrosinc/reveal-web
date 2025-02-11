import { useEffect } from 'react';
import style from './Teams.module.css';
import Accordion from '../../../location/components/accordion/Accordion';
import Users from '../../../../assets/svgs/users.svg';

interface TeamsProps {
  teamsList: Team[];
  fetchTeamsData: () => void;
}

interface Member {
  identifier: string;
  firstName: string;
  lastName: string;
  username: string;
}

interface Team {
  identifier: string;
  name: string;
  members: Member[];
  active?: boolean;
}

const Teams = ({ teamsList, fetchTeamsData }: TeamsProps) => {
  useEffect(() => {
    fetchTeamsData();
  }, []);

  return (
    <>
      <div className={style.container}>
        {teamsList.map(team => (
          <Accordion
            key={team.identifier}
            title=""
            border={false}
            customTitle={
              <div className={style.teamHeader}>
                <div className={style.teamName}>
                  <div className={`${style.statusIndicator} ${team.active ? style.active : style.inactive}`} />
                  <img className={style.usersIcon} src={Users} alt="users" />
                  <span>{team.name}</span>
                </div>
                {/* <ChevronRight size={16} className={style.chevron} /> */}
              </div>
            }
            open
          >
            <div className={style.membersList}>
              {team.members.length > 0 ? (
                team.members.map(member => (
                  <div key={member.identifier} className={style.member}>
                    <div className={style.memberInfo}>
                      <span className={style.memberName}>
                        {member.firstName} {member.lastName}
                      </span>
                      <span className={style.memberUsername}>{member.username}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className={style.emptyTeam}>No members</div>
              )}
            </div>
          </Accordion>
        ))}
      </div>
    </>
  );
};

export default Teams;
