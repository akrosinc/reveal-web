import style from './Target.module.css';
import Delete from '../../../../assets/svgs/trash-bin.svg';

const Target = ({ targetAreas }: any) => {
  return (
    <>
      <ul className={style.container}>
        {targetAreas.targetAreasList.map((area: any, index: number) => (
          <li className={style.targetItem} key={index}>
            <div className={style.text}>
              <div className={style.dot}></div>
              <div>{area?.properties?.name || ''}</div>
            </div>
            <div className={style.value}>
              <div>{Math.round(area?.properties?.population?.sum) || ''}</div>
              <button className={style.hoverButton}>
                {targetAreas.remove && (
                  <img src={Delete} alt="Delete" onClick={() => targetAreas.remove(area.identifier)} />
                )}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
};

export default Target;
