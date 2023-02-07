import { LngLatBounds, Map, Popup } from 'mapbox-gl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Container, Form } from 'react-bootstrap';
import { MAPBOX_STYLE_SATELLITE, MAPBOX_STYLE_SATELLITE_STREETS, MAPBOX_STYLE_STREETS } from '../../../../constants';
import {
  fitCollectionToBounds
  // , getFeatureCentres
  , getLocationsFilteredByGeoLevel, initMap
} from '../../../../utils';
import { PlanningLocationResponse } from '../../providers/types';

interface Props {
  fullScreenHandler: () => void;
  fullScreen: boolean;
  mapData: PlanningLocationResponse | undefined;
  toLocation: LngLatBounds | undefined;
  openModalHandler: (id: string) => void;
}

const SimulationMapView = ({ fullScreenHandler, fullScreen, mapData, toLocation, openModalHandler }: Props) => {
  const mapContainer = useRef<any>();
  const map = useRef<Map>();
  const [lng, setLng] = useState(28.33);
  const [lat, setLat] = useState(-15.44);
  const [zoom, setZoom] = useState(10);
  const [metadataList, setMetadatList] = useState<Set<string>>();
  const [selectedGeoLevel, setSelectedGeoLevel] = useState<string>("");
  const [geoList, setGeoList] = useState<Set<string>>();
  const [mapLayerStyle, setMapLayerStyle] = useState<string>();
  const [selectedMetadata, setSelectedMetadata] = useState<string>();
  const hoverPopup = useRef<Popup>(new Popup({ closeOnClick: false, closeButton: false, offset: 20 }));

  useEffect(() => {
    if (map.current) return; // initialize map only once
    const mapInstance = initMap(mapContainer, [lng, lat], zoom, 'bottom-left', MAPBOX_STYLE_STREETS);
    // clickHandler(mapInstance);
    map.current = mapInstance;
  });

  // const clickHandler = useCallback((mapInstance: Map) => {
  //   mapInstance.on('click', e => {
  //     const features = mapInstance.queryRenderedFeatures(e.point);
  //     if (features.length) {
  //       //convert to location properties feature
  //       const feature = features[0];
  //       if (feature && feature.properties && (feature.source === 'main' || feature.source === 'main-label')) {
  //         openModalHandler(feature.properties['identifier']);
  //       }
  //     }
  //   });
  // }, []);

  const getMetadataListFromMapData = (mapData: PlanningLocationResponse | undefined) => {

    let arr = new Set<string>();
    arr.add("None");
    mapData?.features.flatMap(feature => feature.properties).flatMap(property => property.metadata)
      .forEach(metadata => arr.add(metadata?.type));
    return arr;
  };

  const getGeoListFromMapData = (mapData: PlanningLocationResponse | undefined) => {

    let arr = new Set<string>();
    arr.add("All");
    mapData?.features.flatMap(feature => feature.properties).forEach(property => arr.add(property.geographicLevel))
    return arr;

  };

  useEffect(() => {
    if (toLocation && map && map.current) map.current?.fitBounds(toLocation);
  }, [toLocation]);

  // const loadHeatMap = useCallback((mapInstance: Map, tag: string, mapData?: PlanningLocationResponse) => {
  //   if (mapData && mapData.features.length) {
  //     mapInstance.addSource('parent', {
  //       type: 'geojson',
  //       data: { type: 'FeatureCollection', features: mapData.parents ?? [] },
  //       tolerance: 1.5
  //     });


  //     let featureSet = getFeatureCentres(mapData);
  //     //let featureSet = getFeatureCentres({ type: 'FeatureCollection', features: mapData.parents ?? [] });
  //     featureSet.forEach(feature => {
  //       feature.properties?.metadata?.forEach((element: any) => {
  //         if (element.type === tag) {
  //           if (feature?.properties) {
  //             feature.properties.selectedTagValue = element.value;
  //             feature.properties.selectedTag = element.type;
  //           }
  //         }

  //       });
  //       if (!feature.properties?.selectedTagValue) {
  //         if (feature?.properties) {
  //           feature.properties.selectedTagValue = 0;
  //           feature.properties.selectedTag = tag;
  //         }
  //       }
  //     })

  //     mapInstance.addSource('heatmap', {
  //       type: 'geojson',
  //       data: {
  //         type: 'FeatureCollection',
  //         features: featureSet
  //       },
  //       tolerance: 1.5
  //     });


  //     console.log(featureSet)

  //     mapInstance.addLayer(
  //       {
  //         id: 'heatmap-map',
  //         type: 'heatmap',
  //         source: 'heatmap',
  //         paint: {
  //           // 'heatmap-weight': [
  //           //   'interpolate',
  //           //   ['linear'],
  //           //   ['get', 'selectedTagValue'],
  //           //   1,
  //           //   1,
  //           //   25,
  //           //   25
  //           // ],
  //           // 'heatmap-radius': [
  //           //   'interpolate',
  //           //   ['linear'],
  //           //   ['zoom'],
  //           //   1,
  //           //   1,
  //           //   6,
  //           //   10,
  //           //   8,
  //           //   20,
  //           //   10,
  //           //   40,
  //           //   12,
  //           //   160,
  //           //   14,
  //           //   640,
  //           //   15,
  //           //   2560,
  //           //   20,
  //           //   10000
  //           // ],
  //           // 'heatmap-intensity': [
  //           //   'interpolate',
  //           //   ['linear'],
  //           //   ['zoom'],
  //           //   0,
  //           //   0,
  //           //   10,
  //           //   1,
  //           //   20,
  //           //   2
  //           // ],
  //           'heatmap-radius': ["/", ['get', 'selectedTagValue'], 1000],
  //           'heatmap-weight': ["/", ['get', 'selectedTagValue'], 10000],
  //           // 'heatmap-radius': ['get', 'selectedTagValue']
  //           // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
  //           // Begin color ramp at 0-stop with a 0-transparancy color
  //           'heatmap-opacity': 0.5
  //         }
  //       },
  //       'label-layer'
  //     );

  //   }
  // }, []);


  const getTagStats = (mapData: PlanningLocationResponse | undefined, geographicLevel?: string) => {

    let val = mapData?.features.filter(feature => geographicLevel ? feature.properties?.geographicLevel === geographicLevel : feature).reduce((map: any, obj) => {
      if (obj.properties) {
        if (obj.properties?.metadata) {
          let metadata = obj.properties?.metadata;
          map.max = map.max ?? {};
          map.min = map.min ?? {};
          map.avg = map.avg ?? {};
          map.sum = map.sum ?? {};
          map.cnt = map.cnt ?? {};

          metadata.forEach((element: any) => {
            if (element.type) {
              if (map.max[element.type]) {
                map.max[element.type] = map.max[element.type] < element.value ? element.value : map.max[element.type]
              } else {
                map.max[element.type] = element.value;
              }

              if (map.min[element.type]) {
                map.min[element.type] = map.min[element.type] > element.value ? element.value : map.min[element.type]
              } else {
                map.min[element.type] = element.value;
              }

              if (map.sum[element.type]) {
                map.sum[element.type] = map.sum[element.type] + element.value
              } else {
                map.sum[element.type] = element.value
              }

              if (map.cnt[element.type]) {
                map.cnt[element.type] = map.cnt[element.type] + 1
              } else {
                map.cnt[element.type] = 1
              }
            }

          });

        }
      }


      return map
    }, {})
    return val;
  }

  const loadLocation = useCallback((mapInstance: Map, mapData?: PlanningLocationResponse, geographicLevel?: string, tag?: string) => {
    if (mapData && mapData.features.length) {
      mapInstance.addSource('parent', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: mapData.parents ?? [] },
        tolerance: 1.5
      });
      mapInstance.addLayer(
        {
          id: 'parent-border',
          type: 'line',
          source: 'parent',
          paint: {
            'line-color': ['get', 'levelColor'],
            'line-width': 4
          }
        },
        'label-layer'
      );

      mapInstance.addLayer({
        id: 'result-parent-label',
        type: 'symbol',
        source: 'parent',
        layout: {
          'text-field': ['format', ['get', 'name'], { 'font-scale': 1.2, 'text-font': ['literal', ['Open Sans Bold', 'Open Sans Semibold']] }],
          'text-anchor': 'bottom'
        },
        paint: {
          'text-color': 'lightgrey'
        }
      }, 'label-layer');


      let tagStats: any;
      if (tag && tag !== 'None') {
        tagStats = getTagStats(mapData, geographicLevel)

        mapData.features.forEach(feature => {
          feature.properties?.metadata?.forEach((element: any) => {
            if (element.type === tag && tagStats.max && tagStats.max[tag]) {
              if (feature?.properties) {
                feature.properties.selectedTagValue = element.value;
                feature.properties.selectedTag = element.type;
                feature.properties.selectedTagValuePercent = element.value / tagStats.max[tag];

              }
            }

          });
          if (!feature.properties?.selectedTagValue) {
            if (feature?.properties) {
              feature.properties.selectedTagValue = 0;
              feature.properties.selectedTag = tag;
              feature.properties.selectedTagValuePercent = 0;
            }
          }
        })

      }

      let info: any;
      if (geographicLevel && geographicLevel !== "All") {
        info = {
          type: 'FeatureCollection',
          features: getLocationsFilteredByGeoLevel(mapData, geographicLevel)
        }
      } else {
        info = mapData;
      }


      mapInstance.addSource('main', {
        type: 'geojson',
        data: info,
        tolerance: 0.75
      });

      mapInstance.addLayer(
        {
          id: 'main-border',
          type: 'line',
          source: 'main',
          paint: {
            'line-color': 'black',
            'line-width': 4
          }
        },
        'label-layer'
      );
      if (tag) {
        mapInstance.addLayer(
          {
            id: 'fill-layer',
            type: 'fill',
            source: 'main',
            paint: {
              'fill-color': 'green',
              'fill-opacity': ['get', 'selectedTagValuePercent']
            }
          },
          'label-layer'
        );
      } else {
        mapInstance.addLayer(
          {
            id: 'fill-layer',
            type: 'fill',
            source: 'main',
            paint: {
              'fill-color': 'green',
              'fill-opacity': .2
            }
          },
          'label-layer'
        );
      }

      mapInstance.addLayer({
        id: 'result-label',
        type: 'symbol',
        source: 'main',
        layout: {
          'text-field': ['format', ['get', 'name'], { 'font-scale': 0.8, 'text-font': ['literal', ['Open Sans Bold', 'Open Sans Semibold']] }]
          ,

          'text-anchor': 'bottom'
        },
        paint: {
          'text-color': 'black'
        }
      });

      mapInstance.on('mouseover', 'result-label', e => {
        const feature = mapInstance.queryRenderedFeatures(e.point)[0];
        const properties = feature.properties;
        if (properties && properties['selectedTagValue']) {

          let htmlText = '<p class="text-danger">Data not parsed correctly.</p>';

          const selectedValue: any[] = JSON.parse(properties['selectedTagValue']);
          htmlText = `<p class="text-success">Tag: ${tag} Value: ${selectedValue}</p>`;
          mapInstance.getCanvas().style.cursor = 'pointer';
          hoverPopup.current.setLngLat(e.lngLat).setHTML(htmlText).addTo(mapInstance);
        }
      });
      mapInstance.on('mouseleave', 'result-label', () => {
        mapInstance.getCanvas().style.cursor = '';
        hoverPopup.current.remove();
      });
      fitCollectionToBounds(mapInstance, info, 'main');
    } else {
      mapInstance.flyTo({
        zoom: 6
      });
    }

    setMetadatList(getMetadataListFromMapData(mapData));

    let geoListArr = getGeoListFromMapData(mapData);
    setGeoList(geoListArr);

  }, []);

  useEffect(() => {
    const mapInstance = map.current;
    if (mapInstance) {
      //delete old location
      if (mapInstance.getSource('main')) {
        mapInstance.removeLayer('main-border');
        if (mapInstance.getSource('main-label')) {
          if (mapInstance.getLayer('main-label')) {
            mapInstance.removeLayer('main-label');
          }
          mapInstance.removeSource('main-label');
          if (mapInstance.getLayer('result-label')) {
            mapInstance.removeLayer('result-label');
          }
        }
        mapInstance.removeLayer('fill-layer');
        mapInstance.removeSource('main');
      }
      if (mapInstance.getSource('parent')) {
        if (mapInstance.getLayer('parent-border')) {
          mapInstance.removeLayer('parent-border');
        }
        if (mapInstance.getLayer('result-parent-label')) {
          mapInstance.removeLayer('result-parent-label');
        }
        mapInstance.removeSource('parent');

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

  // const setMapStyle = (style: string) => {
  //   //store current position of the map before reloading to new style
  //   const currentPosition: [number, number] | undefined = map.current
  //     ? [map.current.getCenter().lng, map.current.getCenter().lat]
  //     : undefined;
  //   map.current?.remove();
  //   map.current = undefined;
  //   const mapboxInstance = initMap(mapContainer, currentPosition ?? [lng, lat], zoom, 'bottom-left', style);
  //   //set zoom to another value to trigger a rerender
  //   setZoom(Number((zoom + Math.random()).toPrecision(2)));
  //   clickHandler(mapboxInstance);
  //   mapboxInstance.once('load', () => loadLocation(mapboxInstance, mapData));
  //   map.current = mapboxInstance;
  // };

  // const setHeatMapStyle = (tag: string) => {
  //   //store current position of the map before reloading to new style
  //   const currentPosition: [number, number] | undefined = map.current
  //     ? [map.current.getCenter().lng, map.current.getCenter().lat]
  //     : undefined;
  //   map.current?.remove();
  //   map.current = undefined;
  //   const mapboxInstance = initMap(mapContainer, currentPosition ?? [lng, lat], zoom, 'bottom-left', MAPBOX_STYLE_STREETS);
  //   //set zoom to another value to trigger a rerender
  //   setZoom(Number((zoom + Math.random()).toPrecision(2)));
  //   clickHandler(mapboxInstance);
  //   mapboxInstance.once('load', () => loadHeatMap(mapboxInstance, tag, mapData));
  //   map.current = mapboxInstance;
  // };

  // const setGeoLevelStyle = (tag: string) => {
  //   //store current position of the map before reloading to new style
  //   const currentPosition: [number, number] | undefined = map.current
  //     ? [map.current.getCenter().lng, map.current.getCenter().lat]
  //     : undefined;
  //   map.current?.remove();
  //   map.current = undefined;
  //   const mapboxInstance = initMap(mapContainer, currentPosition ?? [lng, lat], zoom, 'bottom-left', MAPBOX_STYLE_STREETS);
  //   //set zoom to another value to trigger a rerender
  //   setZoom(Number((zoom + Math.random()).toPrecision(2)));
  //   clickHandler(mapboxInstance);
  //   mapboxInstance.once('load', () => loadLocation(mapboxInstance, mapData, tag));
  //   map.current = mapboxInstance;
  // };

  useEffect(() => {

    const clickHandler = (mapInstance: Map) => {
      mapInstance.on('click', e => {
        const features = mapInstance.queryRenderedFeatures(e.point);
        if (features.length) {
          //convert to location properties feature
          const feature = features[0];
          if (feature && feature.properties && (feature.source === 'main' || feature.source === 'main-label')) {
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
    mapboxInstance.once('load', () => loadLocation(mapboxInstance, mapData, selectedGeoLevel, selectedMetadata));
    map.current = mapboxInstance;
   // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGeoLevel, mapLayerStyle, selectedMetadata]);

  return (
    <Container fluid style={{ position: 'relative' }} className="mx-0 px-0">
      <div className="sidebar text-dark bg-light p-2 rounded">
        <p className="lead mb-1">Layer style</p>
        <Form.Select onChange={e => setMapLayerStyle(e.target.value)}>
          <option value={MAPBOX_STYLE_STREETS}>Streets</option>
          <option value={MAPBOX_STYLE_SATELLITE_STREETS}>Streets Satellite</option>
          <option value={MAPBOX_STYLE_SATELLITE}>Satellite</option>
        </Form.Select>
      </div>
      <div className="sidebar-right-further text-dark bg-light p-2 rounded">
        <p className="lead mb-1">Metadata</p>
        <Form.Select onChange={e => setSelectedMetadata(e.target.value)}>
          {metadataList && Array.from(metadataList).map(metaDataItem => {
            return (<option key={metaDataItem} value={metaDataItem}>{metaDataItem}</option>);
          })}
        </Form.Select>
      </div>
      {
        (geoList !== undefined && geoList.size > 0) && (<div className="sidebar-right text-dark bg-light p-2 rounded">
          <p className="lead mb-1">Geographic Levels</p>
          <Form.Select onChange={e => setSelectedGeoLevel(e.target.value)}>
            {geoList && Array.from(geoList).map(geoLevel => {
              return (<option key={geoLevel} value={geoLevel}>{geoLevel}</option>);
            })}
          </Form.Select>
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
              document.getElementById('mapRow')?.scrollIntoView({ behavior: 'smooth' });
            }, 0);
          }}
          className="mb-2 float-end"
        >
          Full Screen
        </Button>
      </div>
      <div id="mapContainer" ref={mapContainer} style={{ height: fullScreen ? '95vh' : '650px', width: '100%' }} />
    </Container>
  );
};

export default SimulationMapView;
