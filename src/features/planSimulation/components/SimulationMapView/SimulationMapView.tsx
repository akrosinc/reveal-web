import { FeatureCollection, MultiPolygon, Polygon, Properties } from '@turf/turf';
import { Map } from 'mapbox-gl';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import { MAPBOX_STYLE_SATELLITE, MAPBOX_STYLE_STREETS } from '../../../../constants';
import { createLocation, fitCollectionToBounds, initMap } from '../../../../utils';
import { getLocationById } from '../../../location/api';

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
        })
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
    mapboxInstance.once('load', () => {
      getLocationById('ff0a2978-6fa4-4073-8f1c-d60569f9b7e6').then(res => {
        createLocation(
          map.current!,
          res,
          () => {
            console.log('callback');
          },
          0.8
        );
      });
    });
    setZoom(Number((zoom + Math.random()).toPrecision(2)));
    map.current = mapboxInstance;
  };

  return (
    <Container fluid style={{ position: 'relative' }} className="mx-0 px-0">
      <div className="sidebar text-light">
        <Button variant="info" className="me-2" onClick={() => setMapStyle(MAPBOX_STYLE_STREETS)}>
          Streets
        </Button>
        <Button className="me-2" variant="success" onClick={() => setMapStyle(MAPBOX_STYLE_SATELLITE)}>
          Satellite
        </Button>
        <Button
          className="me-2"
          variant="warning"
          onClick={() => setMapStyle('mapbox://styles/mapbox/satellite-streets-v11')}
        >
          Satellite Streets
        </Button>
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
