import { useMemo, useState } from 'react';
import { usePolygonContext } from '../../../../../../contexts/PolygonContext';
import style from './MapLegend.module.css';
import SwitchButton from '../../../../../../components/SwitchButton/SwitchButton';
import Accordion from '../../../../../location/components/accordion/Accordion';
import LayerIcon from '../../../../../../assets/svgs/layers-icon.svg';

interface Dataset {
  identifier: string;
  name: string;
  hexColor: string;
}

function MapLegend({
  targetAreas,
  teamsList,
  handleClickedSwitchOnMap,
  assigned
}: {
    targetAreas:any[];
  handleClickedSwitchOnMap: (toggle: any) => void;
  assigned: boolean;
  teamsList?: any[];
}) {
  const { state } = usePolygonContext();

  const datasets = useMemo(() => state.datasets, [state.datasets]);

  return (
    <div className={style.legendBody}>
      <Accordion
        title="Legend"
        open={false}
        customTitle={
          <div className={style.legendTitleWrapper}>
            <img className={style.legendIcon} src={LayerIcon} alt="map legend icon" />
            <span className={style.legendTitle}>Legend</span>
          </div>
        }
      >
        <ul className={style.legendList}>
          <li className={`${style.assignedItemToggle}`}>
            <div className={style.assignedItemInfo}>Toggle assigned</div>
            <SwitchButton
              colorOne="#03a60d"
              colorTwo="#ddd"
              title=""
              id="AssignedMapPolygons"
              isOn={assigned}
              handleToggle={(e: any) => handleClickedSwitchOnMap(e.target.checked)}
            />
          </li>
          {(datasets ?? []).length > 0 &&
            datasets.map((dataset: Dataset) => (
              <li className={style.legendItem} key={dataset.identifier}>
                <div className={style.colorBox} style={{ backgroundColor: dataset.hexColor }}></div>
                {dataset.name}
              </li>
            ))}
            {(targetAreas ?? []).length > 0 && (
                <>
                    <li className={style.legendItem}>
                        <div className={`${style.colorBox} ${style.unassignedLocationColor}`}></div>
                        Assigned locations to a campaign
                    </li>
                </>
            )}
          {(teamsList ?? []).length > 0 && (
            <>
              <li className={style.legendItem}>
                <div className={`${style.colorBox} ${style.assignedLocationColor}`}></div>
                Locations with assigned teams
              </li>
            </>
          )}
        </ul>
      </Accordion>
    </div>
  );
}

export default MapLegend;
