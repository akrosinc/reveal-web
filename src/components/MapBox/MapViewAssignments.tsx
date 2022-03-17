import React, { useEffect, useState, useRef } from 'react';
import mapboxgl, { Map } from 'mapbox-gl';
import './index.css';
import { Button } from 'react-bootstrap';
import { createLocation, createLocationLabel, loadChildren } from '../../utils';
import { MAPBOX_STYLE } from '../../constants';
import { useParams } from 'react-router-dom';
import { getPlanById } from '../../features/plan/api';
import { PlanModel } from '../../features/plan/providers/types';

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

const MapViewAssignments = ({
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
  const { planId } = useParams();
  const [currentPlan, setCurrentPlan] = useState<PlanModel>();

  useEffect(() => {
    // initialize map only once
    // set listeners
    if (map.current === undefined) {
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: MAPBOX_STYLE,
        center: [lng, lat],
        zoom: zoom
      });
      mapInstance.on('move', e => {
        setLng(Math.round(mapInstance.getCenter().lng * 100) / 100);
        setLat(Math.round(mapInstance.getCenter().lat * 100) / 100);
        setZoom(Math.round(mapInstance.getZoom() * 100) / 100);
      });
      mapInstance.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true,
          showUserHeading: true
        }),
        'bottom-right'
      );
      mapInstance.addControl(
        new mapboxgl.NavigationControl({
          showCompass: false
        }),
        'bottom-right'
      );
      map.current = mapInstance;
      //load locations plan
      if (planId)
        getPlanById(planId).then(plan => {
          setCurrentPlan(plan);
          mapInstance.on('moveend', e => {
            if (e.data) {
              createLocationLabel(mapInstance, e.data, e.center);
              mapInstance.on('dblclick', e.data.identifier + 'Fill', e => {
                const a = e.features;
                if (a) {
                  loadChildren(mapInstance, a[0].source, mapInstance.getZoom(), plan.locationHierarchy.identifier);
                }
              });
              if (moveend) {
                moveend();
              }
            }
          });
        });
    }
  }, [lat, lng, zoom, moveend, planId, currentPlan]);

  useEffect(() => {
    console.log(data);
    const currentMap = map.current;
    if (currentMap && data && currentPlan) {
      createLocation(currentMap, data, currentMap.getZoom(), currentPlan.locationHierarchy.identifier);
    }
  }, [data, currentPlan]);

  useEffect(() => {
    return () => {
      //Clear map and all WebGLContext from browser memory
      map.current?.remove();
      map.current = undefined;
    };
  }, []);

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
          id="clear-map-button"
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

export default MapViewAssignments;
