import { useMemo, useState } from 'react';
import { usePolygonContext } from '../../../../../../contexts/PolygonContext';
import style from './MapLegend.module.css';
import SwitchButton from '../../../../../../components/SwitchButton/SwitchButton';
import Accordion from '../../../../../location/components/accordion/Accordion';

interface Dataset {
  identifier: string;
  name: string;
  hexColor: string;
}

function MapLegend() {
  const { state } = usePolygonContext();
  const [checked, setChecked] = useState(false);

  const datasets = useMemo(() => state.datasets, [state.datasets]);

  const handleToggle = () => {
    setChecked(!checked);
  };

  return (
    <div className={style.legendBody}>
      <Accordion title="Legend" open={false}>
        <p className={style.legendName}>Toggle assigned</p>
        <ul>
          <li className={`${style.legendItem} ${style.assignedItemToggle}`}>
            <div className={style.assignedItemInfo}>
              <div className={style.colorBox} style={{ backgroundColor: '#D3D3D3' }}></div>
              Assigned
            </div>
            <SwitchButton
              colorOne="#03a60d"
              title=""
              id="AssignedMapPolygons"
              isOn={checked}
              handleToggle={handleToggle}
            />
          </li>
          {datasets.map((dataset: Dataset) => (
            <li className={style.legendItem} key={dataset.identifier}>
              <div className={style.colorBox} style={{ backgroundColor: dataset.hexColor }}></div>
              {dataset.name}
            </li>
          ))}
        </ul>
      </Accordion>
    </div>
  );
}

export default MapLegend;
