import { FeatureCollection, MultiPolygon, Polygon, Properties } from '@turf/turf';
import { Map } from 'mapbox-gl';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Container, Form } from 'react-bootstrap';
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

  const loadLocation = useCallback(
    (mapInstance: Map, mapData?: FeatureCollection<Polygon | MultiPolygon, Properties>) => {
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
    },
    []
  );

  useEffect(() => {
    const mapInstance = map.current;
    if (mapInstance) {
      //delete old location
      if (mapInstance.getSource('main')) {
        mapInstance.removeLayer('main-border');
        mapInstance.removeLayer('main-label');
        mapInstance.removeSource('main-label');
        mapInstance.removeSource('main');
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
    };
  }, []);

  const setMapStyle = (style: string) => {
    //store current position of the map before reloading to new style
    const currentPosition: [number, number] | undefined = map.current
      ? [map.current.getCenter().lng, map.current.getCenter().lat]
      : undefined;
    map.current?.remove();
    map.current = undefined;
    const mapboxInstance = initMap(mapContainer, currentPosition ?? [lng, lat], zoom, 'bottom-left', style);
    //set zoom to another value to trigger a rerender
    setZoom(Number((zoom + Math.random()).toPrecision(2)));
    mapboxInstance.once('load', () => loadLocation(mapboxInstance, mapData));
    map.current = mapboxInstance;
  };

  return (
    <Container fluid style={{ position: 'relative' }} className="mx-0 px-0">
      <div className="sidebar text-dark bg-light p-2 rounded">
        <p className="lead mb-1">Layer style</p>
        <Form.Select onChange={e => setMapStyle(e.target.value)}>
          <option value={MAPBOX_STYLE_STREETS}>Streets</option>
          <option value={MAPBOX_STYLE_SATELLITE_STREETS}>Streets Satellite</option>
          <option value={MAPBOX_STYLE_SATELLITE}>Satellite</option>
        </Form.Select>
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
