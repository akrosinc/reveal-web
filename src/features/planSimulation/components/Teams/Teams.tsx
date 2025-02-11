import { useEffect } from 'react';
import style from './Teams.module.css';
import Accordion from '../../../location/components/accordion/Accordion';

interface TeamsProps {
  teamsList: any[];
  fetchTeamsData: () => void;
}

const Teams = ({ teamsList, fetchTeamsData }: TeamsProps) => {
  useEffect(() => {
    fetchTeamsData();
  }, []);

  return (
    <>
      <div className={style.container}>
        {teamsList.map((team: any) => (
          <Accordion key={team.identifier} title={team.name} open>
            {team.members.length > 0 ? (
              team.members.map((member: any) => (
                <div key={member.identifier} className={style.teamItem}>
                  <div className={style.text}>
                    {member.firstName} {member.lastName}
                  </div>
                  <div>{member.username}</div>
                </div>
              ))
            ) : (
              <div>No members</div>
            )}
          </Accordion>
        ))}
      </div>
    </>
  );
};

export default Teams;
