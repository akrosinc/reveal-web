import { FeatureCollection, MultiPolygon, Polygon, Properties } from '@turf/turf';
import { Map } from 'mapbox-gl';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import { MAPBOX_STYLE_SATELLITE, MAPBOX_STYLE_SATELLITE_STREETS, MAPBOX_STYLE_STREETS } from '../../../../constants';
import { fitCollectionToBounds, initMap } from '../../../../utils';

interface Props {
  fullScreenHandler: () => void;
  fullScreen: boolean;
  mapData?: FeatureCollection<Polygon | MultiPolygon, Properties>;
}

const SimulationMapView = ({ fullScreenHandler, fullScreen, mapData }: Props) => {
  const mapContainer = useRef<any>();
  const map = useRef<Map>();
  const [lng, setLng] = useState(28.33);
  const [lat, setLat] = useState(-15.44);
  const [zoom, setZoom] = useState(10);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = initMap(mapContainer, [lng, lat], zoom, 'bottom-left', MAPBOX_STYLE_STREETS);
  });

  useEffect(() => {
    const mapInstance = map.current;
    if (mapInstance) {
      //delete old location
      if (mapInstance.getSource('main')) {
        mapInstance.removeLayer('main-border');
        mapInstance.removeLayer('main-label');
        mapInstance.removeSource('main');
      }
      if (mapData && mapData.features.length) {
        mapInstance.addSource('main', {
          type: 'geojson',
          promoteId: 'id',
          data: mapData,
          tolerance: 1
        });
        mapInstance.addLayer(
          {
            id: 'main-border',
            type: 'line',
            source: 'main',
            layout: {},
            paint: {
              'line-color': 'black',
              'line-width': 4
            }
          },
          'label-layer'
        );
        fitCollectionToBounds(mapInstance, mapData, 'main');
      } else {
        mapInstance.flyTo({
          zoom: 6
        });
      }
    }
  }, [mapData]);

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
    };
  }, []);

  const setMapStyle = (style: string) => {
    map.current?.remove();
    map.current = undefined;
    const mapboxInstance = initMap(mapContainer, [lng, lat], zoom, 'bottom-left', style);
    //set zoom to another value to trigger a rerender
    setZoom(Number((zoom + Math.random()).toPrecision(2)));
    map.current = mapboxInstance;
  };

  return (
    <Container fluid style={{ position: 'relative' }} className="mx-0 px-0">
      <div className="sidebar text-dark bg-light p-2 rounded">
        <p className="lead mb-1">Layer style</p>
        <label>Streets</label>
        <input defaultChecked type="radio" id='styleSwitch' name='styleSwitch' className="ms-2" onChange={() => setMapStyle(MAPBOX_STYLE_STREETS)} />
        <br />
        <label>Satellite</label>
        <input type="radio" id='styleSwitch' name='styleSwitch' className="ms-2" onChange={() => setMapStyle(MAPBOX_STYLE_SATELLITE)} />
        <br />
        <label>Satellite Streets</label>
        <input type="radio" id='styleSwitch' name='styleSwitch' className="ms-2" onChange={() => setMapStyle(MAPBOX_STYLE_SATELLITE_STREETS)}/>
      </div>
      <div className="clearButton">
        <p className="small text-dark bg-white p-2 rounded">
          Lat: {lat} Lng: {lng} Zoom: {zoom}
        </p>
        <Button
          onClick={() => {
            fullScreenHandler();
            setTimeout(() => {
              map.current?.resize();
              document.getElementById('mapContainer')?.scrollIntoView({ behavior: 'smooth' });
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
