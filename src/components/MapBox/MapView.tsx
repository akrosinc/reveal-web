import React, { useEffect, useState, useRef } from 'react';
import mapboxgl, { Map } from 'mapbox-gl';
import './index.css';
import { centroid } from '@turf/turf';
import { Button } from 'react-bootstrap';

mapboxgl.accessToken = process.env.REACT_APP_GISIDA_MAPBOX_TOKEN ?? '';

interface Props {
  latitude?: number;
  longitude?: number;
  startingZoom: number;
  data: any;
  clearHandler: () => void;
  children: JSX.Element;
}

const MapView = ({ latitude, longitude, startingZoom, data, clearHandler, children }: Props) => {
  const mapContainer = useRef<any>();
  const map = useRef<Map>();
  const [lng, setLng] = useState(longitude ?? 28.283333);
  const [lat, setLat] = useState(latitude ?? -15.416667);
  const [zoom, setZoom] = useState(startingZoom);
  //const [location, setLocation] = useState<any>();

  useEffect(() => {
    // initialize map only once
    if (map.current === undefined) {
      console.log('init map');
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: [lng, lat],
        zoom: zoom
      });
      setListeners();
    } else {
      if (data !== undefined && map.current.getSource(data.properties.name) === undefined) {
        map?.current?.addSource(data.properties.name, {
          type: 'geojson',
          data: data
        });

        map?.current?.addLayer({
          id: data.properties.name + 'Outline',
          type: 'line',
          source: data.properties.name,
          layout: {},
          paint: {
            'line-color': data.properties.geographicLevel === 'country' ? 'black' : 'blue',
            'line-width': 6
          }
        });

        map?.current?.addLayer({
          id: data.properties.name + 'Fill',
          type: 'fill',
          source: data.properties.name,
          layout: {},
          paint: {
            'fill-color':
              data.properties.geographicLevel === 'country'
                ? 'yellow'
                : '#000000'.replace(/0/g, function () {
                    return (~~(Math.random() * 16)).toString(16);
                  }),
            'fill-opacity': 0.5
          }
        });

        let centerLabel = centroid(data);

        map.current.addSource(data.properties.name + 'Label', {
          type: 'geojson',
          data: centerLabel
        });

        map.current.addLayer({
          id: data.properties.name + 'Label',
          minzoom: data.properties.geographicLevel === 'country' ? 5 : 6.5,
          type: 'symbol',
          source: data.properties.name + 'Label',
          layout: {
            'text-field': data.properties.name,
            'text-font': ['Open Sans Bold', 'Open Sans Semibold'],
            'text-offset': [1, 0.6],
            'text-anchor': 'bottom'
          },
          paint: {
            'text-color': 'white'
          }
        });

        map?.current?.flyTo({
          center: [centerLabel.geometry.coordinates[0], centerLabel.geometry.coordinates[1]],
          zoom: data.properties.geographicLevel === 'country' ? 6 : 8
        });
      }
    }
  });

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
          if (Math.round(map.current.getZoom() * 100) / 100 === 8) {
            console.log('load children locations event');
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
