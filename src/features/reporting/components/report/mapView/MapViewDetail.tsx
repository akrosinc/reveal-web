import React, { useEffect, useState, useRef } from 'react';
import mapboxgl, { Map } from 'mapbox-gl';
import { Button, Container } from 'react-bootstrap';
import { initMap, loadLocationSet } from '../../../../../utils';
import PopoverComponent from '../../../../../components/Popover';

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

interface Props {
  locations: any;
}

const MapViewDetail = ({ locations }: Props) => {
  const mapContainer = useRef<any>();
  const map = useRef<Map>();
  const [lng, setLng] = useState(20);
  const [lat, setLat] = useState(10);
  const [zoom, setZoom] = useState(4);
  const [render, rerender] = useState(false);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = initMap(mapContainer, [lng, lat], zoom, 'bottom-left');
  });

  useEffect(() => {
    if (map.current && Object.keys(locations).length) {
      loadLocationSet(map.current, locations);
    }
  }, [locations]);

  useEffect(() => {
    return () => {
      //Clear map and all WebGLContext from browser memory
      map.current?.remove();
      map.current = undefined;
    };
  }, []);

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
        <PopoverComponent title="Map Legend">
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
        </PopoverComponent>
      </div>
      <div className="clearButton">
        <p className="small m-0 p-0 text-white rounded mb-1">
          Lat: {lat} Lng: {lng} Zoom: {zoom}
        </p>
        <Button
          id="clear-map-button"
          className="float-end"
          style={{ boxShadow: '4px 4px 3px rgba(24, 24, 24, 0.8)' }}
          onClick={() => {
            if (map.current) {
              map.current.remove();
              map.current = undefined;
              setZoom(4);
              setLat(10);
              setLng(20);
              rerender(!render);
            }
          }}
        >
          Clear Map
        </Button>
      </div>
      <div ref={mapContainer} className="map-container" />
    </Container>
  );
};

export default MapViewDetail;
