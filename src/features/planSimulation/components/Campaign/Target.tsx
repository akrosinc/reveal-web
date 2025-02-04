import { useState } from 'react';
import style from './Target.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Target = () => {
  const targetAreas = [
    { id: 1, value: 26, progress: 80 },
    { id: 2, value: 26, progress: 70 },
    { id: 3, value: 26, progress: 90 }
  ];

  return (
    <>
      <div className={style.container}>
        {targetAreas.map(area => (
          <div key={area.id} className={style.targetItem}>
            <div className={style.text}>
              <div className={style.dot}></div>
              <div>Target Areas #{area.id}</div>
            </div>
            <div className={style.value}>{area.value}</div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Target;
