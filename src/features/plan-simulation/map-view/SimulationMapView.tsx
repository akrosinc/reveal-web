import { Map } from 'mapbox-gl';
import React, { useEffect, useRef, useState } from 'react';
import { Container } from 'react-bootstrap';
import { MAPBOX_STYLE_STREETS } from '../../../constants';
import { initMap } from '../../../utils';

const SimulationMapView = () => {
  const mapContainer = useRef<any>();
  const map = useRef<Map>();
  const [lng, setLng] = useState(20);
  const [lat, setLat] = useState(10);
  const [zoom, setZoom] = useState(4);

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
        <p className="small text-dark">
          Lat: {lat} Lng: {lng} Zoom: {zoom}
        </p>
      </div>
      <div ref={mapContainer} className="map-container" />
    </Container>
  );
};

export default SimulationMapView;
