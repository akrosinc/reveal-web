import { Expression, LngLatBounds, Map, Popup } from 'mapbox-gl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Container, Form } from 'react-bootstrap';
import { MAPBOX_STYLE_SATELLITE, MAPBOX_STYLE_SATELLITE_STREETS, MAPBOX_STYLE_STREETS } from '../../../../constants';
import {
  createSearchResultFillLayer,
  createSearchResultFillLayerWeightedOnTagValue,
  createSearchResultLabelLayer,
  createSearchResultLineLayer,
  fitCollectionToBounds
  , getFeatureCentres
  , getGeoListFromMapData, getLocationsFilteredByGeoLevel, getMetadataListFromMapData, initMap
} from '../../../../utils';
import { EntityTag, PlanningLocationResponse } from '../../providers/types';
import { createParentLayers, getTagStats, createHeatMapLayer } from '../../../../utils';
import { Feature, MultiPolygon, Point, Polygon } from '@turf/turf';


interface Props {
  fullScreenHandler: () => void;
  fullScreen: boolean;
  mapData: PlanningLocationResponse | undefined;
  toLocation: LngLatBounds | undefined;
  openModalHandler: (id: string) => void;
  entityTags: EntityTag[];
}

const SEARCH_RESULT_LABEL_SOURCE = 'main-labels';
const HEATMAP_SOURCE_LABEL = 'parent-heatmap';
const HEAT_MAP_LAYER_LABEL = 'heatmap-layer';

const SEARCH_RESULT_LABEL_LAYER_LABEL = 'result-label';
const PARENT_SOURCE = 'parent';
const PARENT_LABEL_SOURCE = 'parent-labels';
const PARENT_LAYER = 'parent-border';
const PARENT_LABEL_LAYER = 'result-parent-label';

const SEARCH_RESULT_SOURCE = 'main';
const SEARCH_RESULT_FILL_LAYER = 'fill-layer';
const SEARCH_RESULT_LINE_LAYER = 'main-border';
const SimulationMapView = ({ fullScreenHandler, fullScreen, mapData, toLocation, openModalHandler, entityTags }: Props) => {
  const mapContainer = useRef<any>();
  const map = useRef<Map>();
  const [lng, setLng] = useState(28.33);
  const [lat, setLat] = useState(-15.44);
  const [zoom, setZoom] = useState(10);
  const [metadataList, setMetadataList] = useState<Set<string>>();
  const [selectedGeoLevel, setSelectedGeoLevel] = useState<string>();
  const [geoList, setGeoList] = useState<Set<string>>(new Set(["All"]));
  const [mapLayerStyle, setMapLayerStyle] = useState<string>();
  const [selectedMetadata, setSelectedMetadata] = useState<string>();
  const [selectedHeatMapMetadata, setSelectedHeatMapMetadata] = useState<string>();
  const hoverPopup = useRef<Popup>(new Popup({ closeOnClick: false, closeButton: false, offset: 20 }));
  const [metadataListCounter] = useState<number>(1);
  const [showMapControls, setShowMapControls] = useState<boolean>(true);
  const [mapStateData, setMapStateData] = useState<PlanningLocationResponse>();

  useEffect(() => {

    if (map.current) return; // initialize map only once
    const mapInstance = initMap(mapContainer, [lng, lat], zoom, 'bottom-left', MAPBOX_STYLE_STREETS);
    map.current = mapInstance;

  });

  useEffect(() => {
    if (toLocation && map && map.current) map.current?.fitBounds(toLocation);
  }, [toLocation]);

  useEffect(() => {
    setSelectedMetadata("None");
    setMapStateData(mapData);
  }, [mapData])

  const loadLocation = useCallback((mapInstance: Map, mapData?: PlanningLocationResponse, geographicLevel?: string, tag?: string, heatMapTag?: string) => {
    if (mapData && mapData.features.length) {
      createParentLayers(mapInstance, mapData, PARENT_SOURCE, PARENT_LABEL_SOURCE, PARENT_LAYER, PARENT_LABEL_LAYER);

      let tagStats: any;
      if (tag && tag !== 'None') {
        tagStats = getTagStats(mapData, geographicLevel)
        mapData.features.forEach(feature => {
          updateFeaturesWithTagStats(feature, tagStats, tag);
        })
      }

      let info: any;
      let filteredParentFeatures: any;
      if (geographicLevel && geographicLevel !== "All") {
        info = {
          type: 'FeatureCollection',
          features: getLocationsFilteredByGeoLevel(mapData, geographicLevel)
        }
        filteredParentFeatures = getLocationsFilteredByGeoLevel({ type: 'FeatureCollection', features: mapData.parents ?? [] }, geographicLevel);
      } else {
        info = mapData;
      }

      createSearchResultLineLayer(mapInstance, info, SEARCH_RESULT_SOURCE, SEARCH_RESULT_LINE_LAYER);

      if (tag && tag !== "None") {
        createSearchResultFillLayerWeightedOnTagValue(mapInstance, SEARCH_RESULT_SOURCE, SEARCH_RESULT_FILL_LAYER);
      } else {
        createSearchResultFillLayer(mapInstance, SEARCH_RESULT_SOURCE, SEARCH_RESULT_FILL_LAYER);
      }

      if (heatMapTag && heatMapTag !== "None") {
        let featureCentres = getFeatureCentres({ type: 'FeatureCollection', features: filteredParentFeatures });
        tagStats = getTagStats({ identifier: undefined, type: 'FeatureCollection', features: featureCentres, parents: [] }, geographicLevel)
        featureCentres.forEach(feature => {
          updateFeaturesWithTagStats(feature, tagStats, heatMapTag);
        })
        createHeatMapLayer(mapInstance, featureCentres, HEATMAP_SOURCE_LABEL, HEAT_MAP_LAYER_LABEL);
      }

      createSearchResultLabelLayer(mapInstance, info, SEARCH_RESULT_LABEL_SOURCE, SEARCH_RESULT_LABEL_LAYER_LABEL);

      mapInstance.on('mouseover', SEARCH_RESULT_LABEL_LAYER_LABEL, e => {
        const feature = mapInstance.queryRenderedFeatures(e.point)[0];
        const properties = feature.properties;
        if (properties && (properties['selectedTagValue'] === 0 || properties['selectedTagValue'])) {

          let htmlText = '<p class="text-danger">Data not parsed correctly.</p>';

          const selectedValue: any[] = JSON.parse(properties['selectedTagValue']);
          htmlText = `<p class="text-success">Tag: ${tag} Value: ${selectedValue}</p > `;
          mapInstance.getCanvas().style.cursor = 'pointer';
          hoverPopup.current.setLngLat(e.lngLat).setHTML(htmlText).addTo(mapInstance);
        }
      });

      mapInstance.on('mouseleave', SEARCH_RESULT_LABEL_LAYER_LABEL, () => {
        mapInstance.getCanvas().style.cursor = '';
        hoverPopup.current.remove();
      });
      fitCollectionToBounds(mapInstance, info, SEARCH_RESULT_SOURCE);

    } else {
      mapInstance.flyTo({
        zoom: 6
      });
    }

    setMetadataList(getMetadataListFromMapData(mapData));

    let geoListArr = getGeoListFromMapData(mapData);
    setGeoList(geoListArr);
    if ((!geographicLevel || geographicLevel === 'All') && geoListArr.size > 1) {
      setSelectedGeoLevel(Array.from(geoListArr)[0]);
    }
  }, []);

  useEffect(() => {
    const mapInstance = map.current;
    if (mapInstance) {
      //delete old location
      if (mapInstance.getSource(SEARCH_RESULT_SOURCE)) {
        if (mapInstance.getLayer(SEARCH_RESULT_LINE_LAYER)) {
          mapInstance.removeLayer(SEARCH_RESULT_LINE_LAYER);
        }
        if (mapInstance.getSource(SEARCH_RESULT_LABEL_SOURCE)) {
          if (mapInstance.getLayer(SEARCH_RESULT_LABEL_LAYER_LABEL)) {
            mapInstance.removeLayer(SEARCH_RESULT_LABEL_LAYER_LABEL);
          }
          mapInstance.removeSource(SEARCH_RESULT_LABEL_SOURCE);
        }
        if (mapInstance.getSource(HEATMAP_SOURCE_LABEL)) {
          if (mapInstance.getLayer(HEAT_MAP_LAYER_LABEL)) {
            mapInstance.removeLayer(HEAT_MAP_LAYER_LABEL);
          }
          mapInstance.removeSource(HEATMAP_SOURCE_LABEL)
        }
        if (mapInstance.getLayer(SEARCH_RESULT_FILL_LAYER)) {
          mapInstance.removeLayer(SEARCH_RESULT_FILL_LAYER);
        }
        mapInstance.removeSource(SEARCH_RESULT_SOURCE);
      }
      if (mapInstance.getSource(PARENT_SOURCE)) {
        if (mapInstance.getLayer(PARENT_LAYER)) {
          mapInstance.removeLayer(PARENT_LAYER);
        }
        if (mapInstance.getSource(PARENT_LABEL_SOURCE)) {
          if (mapInstance.getLayer(PARENT_LABEL_LAYER)) {
            mapInstance.removeLayer(PARENT_LABEL_LAYER);
          }
          mapInstance.removeSource(PARENT_LABEL_SOURCE);
        }
        mapInstance.removeSource(PARENT_SOURCE);

      }
      loadLocation(mapInstance, mapData);
    }
  }, [mapData, loadLocation]);

  useEffect(() => {
    if (map.current !== undefined && map !== undefined) {
      map.current.on('move', () => {
        if (map !== undefined && map.current !== undefined) {
          setLng(Number(map.current.getCenter().lng.toPrecision(4)));
          setLat(Number(map.current.getCenter().lat.toPrecision(4)));
          setZoom(Number(map.current.getZoom().toPrecision(3)));
        }
      });
    }
  });

  useEffect(() => {
    return () => {
      //Clear map and all WebGLContext from browser memory
      map.current?.remove();
      map.current = undefined;
      //cache delete for possible performance improvements on larger datasets
      caches.keys().then(keys => {
        keys.forEach(key => caches.delete(key));
      });
    };
  }, []);

  useEffect(() => {

    const clickHandler = (mapInstance: Map) => {
      mapInstance.on('click', e => {
        const features = mapInstance.queryRenderedFeatures(e.point);
        if (features.length) {
          //convert to location properties feature
          const feature = features[0];
          if (feature && feature.properties && (feature.source === SEARCH_RESULT_SOURCE || feature.source === SEARCH_RESULT_LABEL_SOURCE)) {
            openModalHandler(feature.properties['identifier']);
          }
        }
      });
    };

    //store current position of the map before reloading to new style
    const currentPosition: [number, number] | undefined = map.current
      ? [map.current.getCenter().lng, map.current.getCenter().lat]
      : undefined;
    map.current?.remove();
    map.current = undefined;
    const mapboxInstance = initMap(mapContainer, currentPosition ?? [lng, lat], zoom, 'bottom-left', mapLayerStyle ?? MAPBOX_STYLE_STREETS);
    //set zoom to another value to trigger a rerender
    setZoom(Number((zoom + Math.random()).toPrecision(2)));
    clickHandler(mapboxInstance);
    mapboxInstance.once('load', () => loadLocation(mapboxInstance, mapData, selectedGeoLevel, selectedMetadata, selectedHeatMapMetadata));
    map.current = mapboxInstance;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGeoLevel, mapLayerStyle, selectedMetadata, selectedHeatMapMetadata]);

  const intArrGenerator = (num: number) => {
    let arr = [];
    for (let i = 0; i < num; i++) {
      arr[i] = i;
    }
    return arr;
  }

  const updateFeaturesWithTagStats = (feature: Feature<Point | Polygon | MultiPolygon>, tagStats: any, tag: string) => {
    feature.properties?.metadata?.forEach((element: any) => {
      if (feature?.properties) {
        if (element.type === tag && tagStats.max && tagStats.max[tag]) {
          feature.properties.selectedTagValue = element.value;
          feature.properties.selectedTag = element.type;
          if (element.value < 0) {
            feature.properties.selectedTagValuePercent = (-1 * element.value) / (-1 * tagStats.min[tag]);
          } else {
            feature.properties.selectedTagValuePercent = (element.value) / (tagStats.max[tag]);
          }
          feature.properties.selectedTagValueMin = tagStats.min[tag];
          feature.properties.selectedTagValueMax = tagStats.max[tag];
        }
      }
    });
    if (!feature.properties?.selectedTagValue) {
      if (feature?.properties) {
        feature.properties.selectedTagValue = 0;
        feature.properties.selectedTag = tag;
        feature.properties.selectedTagValuePercent = 0;
        feature.properties.selectedTagValueMin = 0;
        feature.properties.selectedTagValueMax = 0;
      }
    }
  }

  const getTagSumValues = (tag: string | undefined) => {
    if (mapStateData) {
      let stats = getTagStats(mapStateData, selectedGeoLevel);
      if (stats && stats.sum && selectedGeoLevel && tag && stats.sum[tag]) {
        return stats.sum[tag];
      }
    }
    return 'N/A';
  }

  return (
    <Container fluid style={{ position: 'relative' }} className="mx-0 px-0">

      <div style={{ left: '0%', width: '10px' }} className="sidebar-adjust " >
        <Button onClick={() => setShowMapControls(!showMapControls)}
          className="rounded" size='sm' variant="primary">{(showMapControls ? "Hide" : "Show")} </Button>
      </div>

      {showMapControls && (
        <>
          <div style={{ left: '10%' }} className="sidebar-adjust text-dark bg-light p-2 rounded">
            <p className="lead mb-1">Layer style</p>
            <Form.Select onChange={e => setMapLayerStyle(e.target.value)}>
              <option value={MAPBOX_STYLE_STREETS}>Streets</option>
              <option value={MAPBOX_STYLE_SATELLITE_STREETS}>Streets Satellite</option>
              <option value={MAPBOX_STYLE_SATELLITE}>Satellite</option>
            </Form.Select>
          </div>


          {(selectedGeoLevel) && (selectedGeoLevel !== 'All') && (<div style={{ left: '30%' }} className="sidebar-adjust text-dark bg-light p-2 rounded">
            <p className="lead mb-1">Geographic Levels</p>
            <Form.Select onChange={e => setSelectedGeoLevel(e.target.value)} value={selectedGeoLevel}>
              {geoList && Array.from(geoList).map(geoLevel => {
                return (<option key={geoLevel} value={geoLevel} >{geoLevel}</option>);
              })}
            </Form.Select>
          </div>)}

          {(selectedGeoLevel) && (selectedGeoLevel !== 'All') && (<div style={{ right: '3%', bottom: '3%' }} className="sidebar-adjust text-dark bg-light p-2 rounded">
            <p className="lead mb-1" style={{ fontSize: 'small' }}><u><b>Totals</b></u></p>
            {entityTags && Array.from(entityTags).filter(tag => tag.simulationDisplay).map(tag => {
              return (<p style={{ fontSize: 'smaller' }} key={tag.identifier} >{tag.definition ?? tag.tag}: {getTagSumValues(tag.tag)}</p>);
            })}
          </div>)}

          {(selectedGeoLevel) && (selectedGeoLevel !== 'All') && (<div style={{ left: '50%' }} className="sidebar-adjust text-dark bg-light p-2 rounded">
            <p className="lead mb-1">Metadata</p>
            {metadataListCounter && intArrGenerator(metadataListCounter).map(counter => {

              return <div key={"metadataList" + counter}><Form.Select style={{ display: 'inline-block' }} key={"metadataList" + counter} onChange={e => setSelectedMetadata(e.target.value)} value={selectedMetadata}>
                {metadataList && Array.from(metadataList).map(metaDataItem => {
                  return (<option key={metaDataItem + counter} value={metaDataItem}>{metaDataItem}</option>);
                })}
              </Form.Select>
              </div>
            })}
          </div>)}

          {(selectedGeoLevel) && (selectedGeoLevel !== 'All') && (false) && (<div style={{ left: '70%' }} className="sidebar-adjust text-dark bg-light p-2 rounded">
            <p className="lead mb-1">HeatMap</p>
            {metadataListCounter && intArrGenerator(metadataListCounter).map(counter => {

              return <div key={"heatMapMetadataList"}><Form.Select style={{ display: 'inline-block' }} key={"metadataList" + counter} onChange={e => setSelectedHeatMapMetadata(e.target.value)} value={selectedHeatMapMetadata}>
                {metadataList && Array.from(metadataList).map(metaDataItem => {
                  return (<option key={metaDataItem + counter} value={metaDataItem}>{metaDataItem}</option>);
                })}
              </Form.Select>
                <Form.Range min={0} max={100} onChange={(e) => { map.current?.setPaintProperty(HEAT_MAP_LAYER_LABEL, 'heatmap-opacity', Number(e.target.value) / 100) }} />
                <Form.Range min={0} max={100} onChange={(e) => {
                  let expression: Expression = map.current?.getPaintProperty(HEAT_MAP_LAYER_LABEL, 'heatmap-radius');
                  expression[2] = Number(e.target.value)
                  map.current?.setPaintProperty(HEAT_MAP_LAYER_LABEL, 'heatmap-radius', expression)
                }} />
                <Form.Range min={0} max={100} onChange={(e) => { map.current?.setPaintProperty(HEAT_MAP_LAYER_LABEL, 'heatmap-intensity', Number(e.target.value)) }} />
              </div>
            })}
          </div>)}
        </>
      )
      }


      <div className="clearButton">
        <p className="small text-dark bg-white p-2 rounded">
          Lat: {lat} Lng: {lng} Zoom: {zoom}
        </p>
        <Button
          onClick={() => {
            fullScreenHandler();
            setTimeout(() => {
              map.current?.resize();
              document.getElementById('mapRow')?.scrollIntoView({ behavior: 'smooth' });
            }, 0);
          }}
          className="mb-2 float-end"
        >
          Full Screen
        </Button>
      </div>
      <div id="mapContainer" ref={mapContainer} style={{ height: fullScreen ? '95vh' : '650px', width: '100%' }} />
    </Container >
  );
};

export default SimulationMapView;