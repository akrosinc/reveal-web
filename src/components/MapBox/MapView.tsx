import React, { useEffect, useState, useRef } from 'react';
import mapboxgl, { Map } from 'mapbox-gl';
import './index.css';
import { Button } from 'react-bootstrap';
import { createLocation, createLocationLabel, getPolygonCenter } from '../../utils';
import { LocationModel } from '../../features/location/providers/types';
import { getLocationById } from '../../features/location/api';

mapboxgl.accessToken = process.env.REACT_APP_GISIDA_MAPBOX_TOKEN ?? '';

interface Props {
  latitude?: number;
  longitude?: number;
  startingZoom: number;
  data: any;
  clearHandler: () => void;
  children: JSX.Element;
  locationChildList: LocationModel[];
}

const MapView = ({ latitude, longitude, startingZoom, data, clearHandler, children, locationChildList }: Props) => {
  const mapContainer = useRef<any>(null);
  const map = useRef<Map>();
  const [lng, setLng] = useState(longitude ?? 28.283333);
  const [lat, setLat] = useState(latitude ?? -15.416667);
  const [zoom, setZoom] = useState(startingZoom);
  //const [location, setLocation] = useState<any>();

  useEffect(() => {
    // initialize map only once
    if (map.current === undefined) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: [lng, lat],
        zoom: zoom
      });
      setListeners();
    } else {
      if (data !== undefined && map.current.getSource(data.properties.name) === undefined) {
        createLocation(map.current, data);
        loadChildren(map.current);
        let centerLabel = getPolygonCenter(data);
        map.current.fitBounds(
          centerLabel.bounds,
          {
            padding: 20
          },
          {
            data: data,
            center: centerLabel.center
          }
        );
      }
    }
  });

  const loadChildren = (map: Map) => {
    let isLoaded = false;
    map.on('zoom', e => {
      if (e.target.getZoom() < 7.5 && e.target.getZoom() > 7.3 && !isLoaded && e.data === undefined) {
        if (locationChildList.length) {
          isLoaded = true;
          locationChildList.forEach(element => {
            getLocationById(element.identifier).then(res => {
              console.log(res);
              createLocation(map, res);
              createLocationLabel(map, res, getPolygonCenter(res).center);
            });
          });
        }
      }
    });
  };

  useEffect(() => {
    return () => {
      //Clear map and all WebGLContext from browser memory
      map.current?.remove();
      map.current = undefined;
    };
  }, []);

  const setListeners = () => {
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
        }
      });
      map.current.on('load', e => {
        //resize map after load
        setTimeout(() => {
          e.target.resize();
        }, 200);
      });
    }
  };

  const deleteMapData = () => {
    if (data) {
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
    </div>
  );
};

export default MapView;
