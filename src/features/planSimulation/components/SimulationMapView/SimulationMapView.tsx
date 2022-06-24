import { Map } from 'mapbox-gl';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import { MAPBOX_STYLE_STREETS } from '../../../../constants';
import { initMap } from '../../../../utils';

interface Props {
  fullScreenHandler: () => void;
}

const SimulationMapView = ({ fullScreenHandler }: Props) => {
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
  return (
    <Container fluid style={{ position: 'relative' }} className="mx-0 px-0">
      <div className="sidebar text-light">
        <Button
          onClick={() => {
            fullScreenHandler();
            setTimeout(() => {
              map.current?.resize();
            }, 0);
          }}
        >
          Full Screen
        </Button>
        <p className="small text-dark mt-2">
          Lat: {lat} Lng: {lng} Zoom: {zoom}
        </p>
      </div>
      <div ref={mapContainer} style={{ height: '650px', width: '100%' }} />
    </Container>
  );
};

export default SimulationMapView;
