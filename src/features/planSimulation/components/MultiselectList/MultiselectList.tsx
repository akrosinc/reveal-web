import task from '../../../../assets/svgs/task.svg';
import Delete from '../../../../assets/svgs/trash-bin.svg';
import styles from './MultiselectList.module.css';
import { SelectedPolygon, usePolygonContext } from '../../../../contexts/PolygonContext';

function MultiselectList({ selectedPolygon }: { selectedPolygon: any }) {
  const { dispatch } = usePolygonContext();

  return (
    <div className={styles.multiselectItem}>
      <div className={styles.multiselectItem_info}>
        <img className={styles.selectedIcon} src={task} alt="selected Polygon" />
        <p>{selectedPolygon.properties.name}</p>
      </div>
      <button
        className={styles.removeLocationButton}
        onClick={() => dispatch({ type: 'TOGGLE_MULTISELECT', payload: selectedPolygon })}
      >
        <img src={Delete} alt="Delete" />
      </button>
    </div>
  );
}
export default MultiselectList;
