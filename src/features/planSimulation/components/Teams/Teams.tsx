import { useState } from 'react';
import style from './Teams.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Accordion from '../../../location/components/accordion/Accordion';

const Teams = () => {
  const targetAreas = [
    { id: 1, text: "Mutele Mwapa", value: 26, progress: 80 },
    { id: 2, text: "Boniface Jere", value: 26, progress: 70 },
    { id: 3, text: "Boniface Jere", value: 26, progress: 90 }
  ];

  return (
    <>
      <div className={style.container}>
      <Accordion title="Team 1" open>
        {targetAreas.map(area => (
          <div key={area.id} className={style.teamItem}>
            <div className={style.text}>
              <div>{area.text}</div>
            </div>
            
          </div>
        ))}
        </Accordion>
        <Accordion title="Team 2"  open>
        {targetAreas.map(area => (
          <div key={area.id} className={style.teamItem}>
            <div className={style.text}>
              <div>{area.text}</div>
            </div>
            
          </div>
        ))}
        </Accordion>
      </div>
    </>
  );
};

export default Teams;
