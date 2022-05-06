import React, { useEffect, useState, useRef } from 'react';
import mapboxgl, { Map } from 'mapbox-gl';
import './index.css';
import { Button, Col, Container, Row } from 'react-bootstrap';

mapboxgl.accessToken = process.env.REACT_APP_GISIDA_MAPBOX_TOKEN ?? '';
const legend = [
  'Complete',
  'SPAQ Complete',
  'SMC Complete',
  'Not Dispensed',
  'Family Registered',
  'Ineligible',
  'Not Eligible',
  'Not Visited',
  'No Tasks'
];
const legendColors = ['green', 'orange', 'darkorange', 'orange', 'teal', 'gray', 'black', 'yellow', 'gray'];

const MapViewDetail = () => {
  const mapContainer = useRef<any>();
  const map = useRef<Map>();
  const [lng, setLng] = useState(24.651775360107422);
  const [lat, setLat] = useState(-34.16764168475747);
  const [zoom, setZoom] = useState(16);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [lng, lat],
      zoom: zoom
    });
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
    <Container fluid style={{ position: 'relative' }}>
      <Row className="mb-4 mt-3">
        <Col md={9} className="px-0">
          <div className="sidebar text-light">
            Longitude: {(Math.round(lng * 100)) / 100} | Latitude: {(Math.round(lat * 100)) / 100} | Zoom: {(Math.round(zoom * 100)) / 100}
          </div>
          <div ref={mapContainer} className="map-container" />
        </Col>
        <Col md={3} className="bg-dark text-light">
          <h4 className="text-light text-center pt-3">Zambia - Report details</h4>
          <hr className="bg-light" />
          <div className="p-3">
            <Button className='w-100'>Details</Button>
            <hr />
            <p className="lead">Legend</p>
            <ul style={{ listStyle: 'none' }}>
              {legend.map((el, index) => {
                return (
                  <li key={index}>
                    <span className="sidebar-legend" style={{ backgroundColor: legendColors[index] }} />
                    {el}
                  </li>
                );
              })}
            </ul>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default MapViewDetail;
