import {Expression, LngLatBounds, Map, Popup} from 'mapbox-gl';
import {useCallback, useEffect, useRef, useState} from 'react';
import {Button, Container, Form} from 'react-bootstrap';
import {
  MAPBOX_STYLE_SATELLITE,
  MAPBOX_STYLE_SATELLITE_STREETS,
  MAPBOX_STYLE_STREETS
} from '../../../../constants';
import {
  createHeatMapLayer,
  createParentLayers,
  createSearchResultFillLayer,
  createSearchResultFillLayerWeightedOnTagValue,
  createSearchResultLabelLayer,
  createSearchResultLineLayer,
  fitCollectionToBounds,
  getFeatureCentres,
  getGeoListFromMapData,
  getLocationsFilteredByGeoLevel,
  getMetadataListFromMapData,
  getTagStats,
  initMap
} from '../../../../utils';
import {EntityTag, PlanningLocationResponse} from '../../providers/types';
import {Feature, MultiPolygon, Point, Polygon} from '@turf/turf';
import {ColorPicker, useColor} from "react-color-palette";
import "react-color-palette/lib/css/styles.css";

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
const SimulationMapView = ({
                             fullScreenHandler,
                             fullScreen,
                             mapData,
                             toLocation,
                             openModalHandler,
                             entityTags
                           }: Props) => {
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
  const hoverPopup = useRef<Popup>(new Popup({
    closeOnClick: false,
    closeButton: false,
    offset: 20
  }));
  const [metadataListCounter] = useState<number>(1);
  const [showMapControls, setShowMapControls] = useState<boolean>(true);
  const [showLayerStyle, setShowLayerStyle] = useState<Boolean>(true);
  const [showMetaStyle, setShowMetaStyle] = useState<Boolean>(true);
  const [showGeoLevelStyle, setShowGeoLevelStyle] = useState<Boolean>(true);
  const [showHeatMapStyle, setShowHeatMapStyle] = useState<Boolean>(true);
  const [mapStateData, setMapStateData] = useState<PlanningLocationResponse>();
  const [color, setColor] = useColor("hex", "#005512");

  const [showColorPicker,setShowColorPicker] = useState(false);
  const [showStats,setShowStats] = useState(true);
  const [showHeatMapToggles,setShowHeatMapToggles] = useState(false);

  useEffect(() => {

    if (map.current) return; // initialize map only once
    map.current = initMap(mapContainer, [lng, lat], zoom, 'bottom-left', MAPBOX_STYLE_STREETS);

  });
  
  
  useEffect(() => {
    if (toLocation && map && map.current) map.current?.fitBounds(toLocation);
  }, [toLocation]);

  useEffect(() => {
    setSelectedMetadata("None");
    setMapStateData(mapData);
  }, [mapData])

  const loadLocation = useCallback((mapInstance: Map, mapData?: PlanningLocationResponse, geographicLevel?: string, tag?: string, heatMapTag?: string,selectedColor?:string) => {
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
        filteredParentFeatures = getLocationsFilteredByGeoLevel({
          type: 'FeatureCollection',
          features: mapData.parents ?? []
        }, geographicLevel);
      } else {
        info = mapData;
      }

      createSearchResultLineLayer(mapInstance, info, SEARCH_RESULT_SOURCE, SEARCH_RESULT_LINE_LAYER);

      if (tag && tag !== "None") {
        createSearchResultFillLayerWeightedOnTagValue(mapInstance, SEARCH_RESULT_SOURCE, SEARCH_RESULT_FILL_LAYER,selectedColor??'green' );
      } else {
        createSearchResultFillLayer(mapInstance, SEARCH_RESULT_SOURCE, SEARCH_RESULT_FILL_LAYER,selectedColor??'green' );
      }

      if (heatMapTag && heatMapTag !== "None") {
        let featureCentres = getFeatureCentres({
          type: 'FeatureCollection',
          features: filteredParentFeatures
        });
        tagStats = getTagStats({
          identifier: undefined,
          type: 'FeatureCollection',
          features: featureCentres,
          parents: []
        }, geographicLevel)
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



          const selectedValue: any[] = JSON.parse(properties['selectedTagValue']);
          let htmlText = `<p class="text-success">Tag: ${tag} Value: ${selectedValue}</p > `;
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
    if (map !== undefined  &&  map.current !== undefined) {
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

  useEffect(()=>{
    if (map.current?.getSource(SEARCH_RESULT_SOURCE)){
      if ( map.current?.getLayer(SEARCH_RESULT_FILL_LAYER)){
        map.current?.setPaintProperty(SEARCH_RESULT_FILL_LAYER, 'fill-color', color.hex)
      }
    }
  },[color])

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
    mapboxInstance.once('load', () => loadLocation(mapboxInstance, mapData, selectedGeoLevel, selectedMetadata, selectedHeatMapMetadata,color.hex));
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
      <Container fluid style={{position: 'relative'}} className="mx-0 px-0">
        <div style={{position: "absolute", zIndex: 2, width: '100%'}} className="mx-0 px-0">
          <div style={{float: 'left', position: 'relative'}} className="sidebar-adjust ">
            <div>
              <Button style={{width: '75px'}} onClick={() => {
                setShowMapControls(!showMapControls);
                console.log("Clicked")
              }}
                      className="rounded" size='sm'
                      variant="primary">{(showMapControls ? "Hide" : "Show")} </Button>
            </div>
            {showMapControls && (
                <>
                  <div style={{paddingTop: '1em'}}>
                    <Button style={{width: '75px', fontSize: 'smaller'}}
                            onClick={() => setShowLayerStyle(!showLayerStyle)}
                            className="rounded" size='sm'
                            variant="success">{((showLayerStyle ? "Hide" : "") + " Style")} </Button>
                  </div>
                  {selectedGeoLevel && (selectedGeoLevel !== 'All') && (
                      <div style={{paddingTop: '1em'}}>
                        <Button style={{width: '75px', fontSize: 'smaller'}}
                                onClick={() => setShowGeoLevelStyle(!showGeoLevelStyle)}
                                className="rounded" size='sm'
                                variant="success">{((showGeoLevelStyle ? "Hide" : "") + " Level")} </Button>
                      </div>)}

                  {selectedGeoLevel && (selectedGeoLevel !== 'All') && (
                      <div style={{paddingTop: '1em'}}>
                        <Button style={{width: '75px', fontSize: 'smaller'}}
                                onClick={() => setShowMetaStyle(!showMetaStyle)}
                                className="rounded" size='sm'
                                variant="success">{((showMetaStyle ? "Hide" : "") + " Meta")} </Button>
                      </div>
                  )}
                  {selectedGeoLevel && (selectedGeoLevel !== 'All') && (
                      <div style={{paddingTop: '1em'}}>
                        <Button style={{width: '75px', fontSize: 'smaller'}}
                                onClick={() => setShowHeatMapStyle(!showHeatMapStyle)}
                                className="rounded" size='sm'
                                variant="success">{((showHeatMapStyle ? "Hide" : "") + " Heatmap")} </Button>
                      </div>
                  )}
                </>)}
          </div>

          {(showMapControls) &&
              (<div>
                {(showLayerStyle) && (<div style={{float: 'left'}}
                                           className="sidebar-adjust-list text-dark bg-light p-2 rounded">
                  <p className="lead mb-1">Layer style</p>
                  <Form.Select onChange={e => setMapLayerStyle(e.target.value)}>
                    <option value={MAPBOX_STYLE_STREETS}>Streets</option>
                    <option value={MAPBOX_STYLE_SATELLITE_STREETS}>Streets Satellite</option>
                    <option value={MAPBOX_STYLE_SATELLITE}>Satellite</option>
                  </Form.Select>

                </div>)}

                {(showGeoLevelStyle) && (selectedGeoLevel) && (selectedGeoLevel !== 'All') && (
                    <div style={{float: 'left'}}
                         className="sidebar-adjust-list text-dark bg-light p-2 rounded">
                      <p className="lead mb-1" onClick={()=>{setShowColorPicker(!showColorPicker)}}>Geographic Levels</p>
                      <Form.Select onChange={e => setSelectedGeoLevel(e.target.value)}
                                   value={selectedGeoLevel}>
                        {geoList && Array.from(geoList).map(geoLevel => {
                          return (<option key={geoLevel} value={geoLevel}>{geoLevel}</option>);
                        })}
                      </Form.Select>
                      {showColorPicker && (
                          <div>
                              <ColorPicker width={(fullScreen)?287:190} color={color} onChange={setColor} hideHEX={true} hideHSV={true} hideRGB={true}/>
                          </div>
                      )}
                    </div>)}



                {(showMetaStyle) && (selectedGeoLevel) && (selectedGeoLevel !== 'All') && (
                    <div style={{float: 'left'}}
                         className="sidebar-adjust-list text-dark bg-light p-2 rounded">
                      <p className="lead mb-1">Metadata</p>
                      {metadataListCounter && intArrGenerator(metadataListCounter).map(counter => {

                        return <div key={"metadataList" + counter}><Form.Select
                            style={{display: 'inline-block'}} key={"metadataList" + counter}
                            onChange={e => setSelectedMetadata(e.target.value)}
                            value={selectedMetadata}>
                          {metadataList && Array.from(metadataList).map(metaDataItem => {
                            return (<option key={metaDataItem + counter}
                                            value={metaDataItem}>{metaDataItem}</option>);
                          })}
                        </Form.Select>
                        </div>
                      })}
                    </div>)}

                {/* enable when needed by setting false to true */}
                {(showHeatMapStyle) && (selectedGeoLevel) && (selectedGeoLevel !== 'All') && true && (
                    <div style={{float: 'left'}}
                         className="sidebar-adjust-list text-dark bg-light p-2 rounded"
                         >
                      <p className="lead mb-1" onClick={()=>setShowHeatMapToggles(!showHeatMapToggles)}>HeatMap</p>
                      {metadataListCounter && intArrGenerator(metadataListCounter).map(counter => {

                        return <div key={"heatMapMetadataList"}><Form.Select
                            style={{display: 'inline-block'}} key={"metadataList" + counter}
                            onChange={e => setSelectedHeatMapMetadata(e.target.value)}
                            value={selectedHeatMapMetadata}>
                          {metadataList && Array.from(metadataList).map(metaDataItem => {
                            return (<option key={metaDataItem + counter}
                                            value={metaDataItem}>{metaDataItem}</option>);
                          })}
                        </Form.Select>
                          {(showHeatMapToggles && (<><b>Opacity</b><Form.Range min={0} max={100} onChange={(e) => {
                            map.current?.setPaintProperty(HEAT_MAP_LAYER_LABEL, 'heatmap-opacity', Number(e.target.value) / 100)
                          }}/>
                          <b>Radius</b><Form.Range min={0} max={100} onChange={(e) => {
                            let expression: Expression = map.current?.getPaintProperty(HEAT_MAP_LAYER_LABEL, 'heatmap-radius');
                            expression[2] = Number(e.target.value)
                            map.current?.setPaintProperty(HEAT_MAP_LAYER_LABEL, 'heatmap-radius', expression)
                          }}/></>))}
                        </div>
                      })}
                    </div>)}
              </div>)
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
                    document.getElementById('mapRow')?.scrollIntoView({behavior: 'smooth'});
                  }, 0);
                }}
                className="mb-2 float-end"
            >
              Full Screen
            </Button>
          </div>
        </div>
        {/* enable when needed by setting false to true */}
        {(selectedGeoLevel) && true && (selectedGeoLevel !== 'All') && (
            <div style={{right: '2%', bottom: '3%',position: "absolute", zIndex: 2, width:'20%'}}
                 className="sidebar-adjust-list text-dark bg-light p-2 rounded" onClick={()=>setShowStats(!showStats)}>
              <p className="lead mb-1" style={{fontSize: 'small'}}><u><b>Stats</b></u></p>
              {showStats && entityTags && Array.from(entityTags).filter(tag => tag.simulationDisplay).map(tag => {
                return (<p style={{fontSize: 'smaller'}}
                           key={tag.identifier}>{tag.definition ?? tag.tag}: {getTagSumValues(tag.tag)}</p>);
              })}
            </div>)}

        <div id="mapContainer" ref={mapContainer}
             style={{height: fullScreen ? '95vh' : '75vh', width: '100%'}}/>


      </Container>
  );
};
export default SimulationMapView;