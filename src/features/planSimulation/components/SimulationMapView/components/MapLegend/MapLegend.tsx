import { Fragment, useMemo } from 'react';
import { usePolygonContext } from '../../../../../../contexts/PolygonContext';
import style from './MapLegend.module.css';
import SwitchButton from '../../../../../../components/SwitchButton/SwitchButton';
import Accordion from '../../../../../location/components/accordion/Accordion';
import LayerIcon from '../../../../../../assets/svgs/layers-icon.svg';
import { COLOR_OPTIONS, parseColorOrGradient } from '../../../../../../utils/rasterHelper';
import { formatRasterClassRange, getRasterClasses } from '../../../../../../utils/rasterClasses';
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
                    const parsed = parseColorOrGradient(raster.colorRamp);
                    const swatchBackground = parsed.isGradient
                      ? `linear-gradient(to right, ${parsed.colors.join(', ')})`
                      : parsed.primaryColor;
                    const classes = getRasterClasses(raster.datasetIdentifier || raster.identifier);

                    return (
                      <Fragment key={raster.identifier || raster.datasetIdentifier}>
                      <li className={style.legendItem}>
                        <div
                          className={style.colorBox}
                          style={{
                            background: swatchBackground,
                            border: '1px solid rgba(0,0,0,0.2)',
                            minWidth: '1rem',
                            flexShrink: 0
                          }}
                        />
                        <span className={style.legendName} title={raster.name || raster.datasetIdentifier}>
                          {raster.name || raster.datasetIdentifier}
                        </span>
                      </li>
                      {classes?.map(item => (
                        <li
                          className={style.legendItem}
                          key={`${item.from}-${item.to}`}
                          style={{ marginTop: '4px', paddingLeft: '1.75rem', fontSize: '12px' }}
                        >
                          <div className={style.colorBox} style={{ background: item.color, flexShrink: 0 }} />
                          {formatRasterClassRange(item)}
                        </li>
                      ))}
                      </Fragment>
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
