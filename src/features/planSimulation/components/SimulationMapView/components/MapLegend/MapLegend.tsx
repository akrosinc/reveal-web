import { useMemo } from 'react';
import { usePolygonContext } from '../../../../../../contexts/PolygonContext';
import style from './MapLegend.module.css';
import SwitchButton from '../../../../../../components/SwitchButton/SwitchButton';
import Accordion from '../../../../../location/components/accordion/Accordion';
import LayerIcon from '../../../../../../assets/svgs/layers-icon.svg';
import { COLOR_OPTIONS } from '../../../../../../utils/rasterHelper';
import { useAuthorization } from '../../../../../../hooks/useAuthorization';
import { VIEW_RASTER_LISTING } from '../../../../../../constants/roles';

interface Dataset {
  identifier: string;
  name: string;
  hexColor: string;
  hidden?: boolean;
}

interface RasterItem {
  identifier: string;
  datasetIdentifier?: string;
  name: string;
  colorRamp?: string;
  hidden?: boolean;
  opacity?: number;
}

function MapLegend({
  teamsList,
  handleClickedSwitchOnMap,
  assigned,
  rasterDatasets: propRasterDatasets
}: {
  handleClickedSwitchOnMap: (toggle: any) => void;
  assigned: boolean;
  teamsList?: any[];
  rasterDatasets?: RasterItem[];
}) {
  const { state } = usePolygonContext();
  const canViewRaster = useAuthorization([VIEW_RASTER_LISTING]);

  const datasets = useMemo(
    () => (state.datasets || []).filter((d: any) => !d.hidden),
    [state.datasets]
  );

  const rasterDatasets = useMemo(
    () => (propRasterDatasets || state.rasterDatasets || []).filter((r: any) => !r.hidden),
    [propRasterDatasets, state.rasterDatasets]
  );

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
          {(teamsList ?? []).length === 0 && (
            <>
              {datasets.length > 0 && (
                <>
                  <li className={style.legendSectionHeader}>Datasets</li>
                  {datasets.map((dataset: Dataset) => (
                    <li className={style.legendItem} key={dataset.identifier}>
                      <div className={style.colorBox} style={{ backgroundColor: dataset.hexColor }}></div>
                      <span className={style.legendName}>{dataset.name}</span>
                    </li>
                  ))}
                </>
              )}
              {canViewRaster && rasterDatasets.length > 0 && (
                <>
                  <li className={style.legendSectionHeader}>Rasters</li>
                  {rasterDatasets.map((raster: RasterItem) => {
                    const matchedPreset = COLOR_OPTIONS.find(
                      c =>
                        c.color.toLowerCase() === (raster.colorRamp || '').toLowerCase() ||
                        c.value.toLowerCase() === (raster.colorRamp || '').toLowerCase() ||
                        c.colors.some(col => col.toLowerCase() === (raster.colorRamp || '').toLowerCase())
                    );
                    const currentColor =
                      raster.colorRamp && raster.colorRamp.startsWith('#') && (raster.colorRamp.length === 7 || raster.colorRamp.length === 4)
                        ? (raster.colorRamp.length === 4
                            ? `#${raster.colorRamp[1]}${raster.colorRamp[1]}${raster.colorRamp[2]}${raster.colorRamp[2]}${raster.colorRamp[3]}${raster.colorRamp[3]}`
                            : raster.colorRamp)
                        : matchedPreset?.color || '#fd8d3c';

                    return (
                      <li className={style.legendItem} key={raster.identifier || raster.datasetIdentifier}>
                        <div
                          className={style.colorBox}
                          style={{
                            backgroundColor: currentColor,
                            border: '1px solid rgba(0,0,0,0.2)',
                            minWidth: '1rem',
                            flexShrink: 0
                          }}
                        />
                        <span className={style.legendName} title={raster.name || raster.datasetIdentifier}>
                          {raster.name || raster.datasetIdentifier}
                        </span>
                      </li>
                    );
                  })}
                </>
              )}
            </>
          )}
          {(teamsList ?? []).length > 0 && (
            <>
              <li className={style.legendItem}>
                <div className={`${style.colorBox} ${style.unassignedLocationColor}`}></div>
                Assigned locations to a campaign
              </li>
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
