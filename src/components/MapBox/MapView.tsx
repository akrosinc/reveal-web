import React, { useEffect, useState, useRef } from 'react';
import mapboxgl, { Map } from 'mapbox-gl';
import './index.css';
import { Button } from 'react-bootstrap';
import { createLocation, createLocationLabel } from '../../utils';
import { MAPBOX_STYLE } from '../../constants';
import AssignModal from '../../features/assignment/components/assign/assignModal/AssignModal';
import { Properties } from '../../features/location/providers/types';

mapboxgl.accessToken = process.env.REACT_APP_GISIDA_MAPBOX_TOKEN ?? '';

interface Props {
  latitude?: number;
  longitude?: number;
  startingZoom: number;
  data: any;
  clearHandler: () => void;
  moveend?: () => void;
  children: JSX.Element;
  assignment: boolean;
  reloadData?: () => void;
}

const MapView = ({
  latitude,
  longitude,
  startingZoom,
  data,
  clearHandler,
  children,
  assignment,
  moveend,
  reloadData
}: Props) => {
  const mapContainer = useRef<any>(null);
  const map = useRef<Map>();
  const [lng, setLng] = useState(longitude ?? 28.283333);
  const [lat, setLat] = useState(latitude ?? -15.416667);
  const [zoom, setZoom] = useState(startingZoom);
  const [show, setShow] = useState(false);
  const [locationData, setLocationData] = useState<[string, Properties]>();
  const [currentLocation, setCurrentLocation] = useState<string>();

  useEffect(() => {
    // initialize map only once
    if (map.current === undefined) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: MAPBOX_STYLE,
        center: [lng, lat],
        zoom: zoom
      });
      //set listeners
      if (map !== undefined && map.current !== undefined) {
        map.current.on('move', e => {
          if (map.current !== undefined) {
            setLng(Math.round(map.current.getCenter().lng * 100) / 100);
            setLat(Math.round(map.current.getCenter().lat * 100) / 100);
            setZoom(Math.round(map.current.getZoom() * 100) / 100);
          }
        });
        map.current.on('moveend', e => {
          if (e.data !== undefined && map.current !== undefined) {
            createLocationLabel(map.current, e.data, e.center);
            if (moveend) {
              moveend();
            }
          }
        });
        map.current.on('load', e => {
          //resize map after load
          setTimeout(() => {
            e.target.resize();
          }, 200);
        });
      }
    } else {
      if (data !== undefined && map.current.getSource(data.identifier) === undefined) {
        if (currentLocation && assignment) {
          map.current.removeLayer(currentLocation + 'Outline');
          map.current.removeLayer(currentLocation + 'Fill');
          map.current.removeLayer(currentLocation + 'Label');
          if (map.current.getSource(currentLocation + 'Label')) {
            map.current.removeSource(currentLocation + 'Label');
          }
          map.current.removeSource(currentLocation);
        }
        setCurrentLocation(data.identifier);
        createLocation(map.current, data);
        if (assignment) {
          // When a click event occurs on a feature in the states layer,
          // open a popup at the location of the click, with description
          map.current.on('click', data.identifier + 'Fill', e => {
            setShow(true);
            setLocationData([data.identifier, data.properties]);
          });
        }
      }
    }
  }, [setCurrentLocation, data, lng, lat, zoom, currentLocation, assignment, moveend]);

  useEffect(() => {
    return () => {
      //Clear map and all WebGLContext from browser memory
      map.current?.remove();
      map.current = undefined;
    };
  }, []);

  const deleteMapData = () => {
    if (data) {
      setCurrentLocation(undefined);
      clearHandler();
      map.current?.remove();
      map.current = undefined;
    }
  };

  return (
    <div className="flex-grow-1" style={{ position: 'relative' }}>
      <div className="sidebar">{children}</div>
      <div className="clearButton">
        <p className="small m-0 p-0 text-white rounded mb-1">
          Lat: {lat} Lng: {lng} Zoom: {zoom}
        </p>
        <Button
          className="float-end"
          style={{ boxShadow: '4px 4px 3px rgba(24, 24, 24, 0.8)' }}
          onClick={() => deleteMapData()}
        >
          Clear Map
        </Button>
      </div>
      <div ref={mapContainer} className="mapbox-container" />
      {show && locationData && (
        <AssignModal
          closeHandler={() => {
            setShow(false);
            if (reloadData) reloadData();
          }}
          locationData={locationData}
        />
      )}
    </div>
  );
};

export default MapView;
