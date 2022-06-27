import { Map } from 'mapbox-gl';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import { MAPBOX_STYLE_SATELLITE, MAPBOX_STYLE_STREETS } from '../../../../constants';
import { initMap } from '../../../../utils';

interface Props {
  fullScreenHandler: () => void;
  fullScreen: boolean;
}

const SimulationMapView = ({ fullScreenHandler, fullScreen }: Props) => {
  const mapContainer = useRef<any>();
  const map = useRef<Map>();
  const [lng, setLng] = useState(28.33);
  const [lat, setLat] = useState(-15.44);
  const [zoom, setZoom] = useState(10);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = initMap(mapContainer, [lng, lat], zoom, 'bottom-left', MAPBOX_STYLE_STREETS);
    mapContainer.current = map.current;
  });

  useEffect(() => {
    if (map.current !== undefined && map !== undefined) {
      map.current.on('move', () => {
        if (map !== undefined && map.current !== undefined) {
          setLng(Math.round(map.current.getCenter().lng * 100) / 100);
          setLat(Math.round(map.current.getCenter().lat * 100) / 100);
          setZoom(Math.round(map.current.getZoom() * 100) / 100);
        }
      });
    }
  });

  const setMapStyle = (style: string) => {
    map.current?.setStyle(style);
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
