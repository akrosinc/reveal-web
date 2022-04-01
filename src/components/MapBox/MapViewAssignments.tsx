import React, { useEffect, useState, useRef } from 'react';
import mapboxgl, { Map } from 'mapbox-gl';
import './index.css';
import { Button } from 'react-bootstrap';
import {
  contextMenuHandler,
  createLocation,
  createLocationLabel,
  doubleClickHandler,
  initMap,
  selectHandler
} from '../../utils';
import { useParams } from 'react-router-dom';
import { getPlanById } from '../../features/plan/api';
import { PlanModel } from '../../features/plan/providers/types';
import AssignModal from '../../features/assignment/components/assign/assignModal';
import { Properties } from '../../features/location/providers/types';

mapboxgl.accessToken = process.env.REACT_APP_GISIDA_MAPBOX_TOKEN ?? '';

interface Props {
  latitude?: number;
  longitude?: number;
  startingZoom: number;
  data: any;
  rerender: boolean;
  collapse: () => void;
  clearHandler: () => void;
  moveend?: () => void;
  reloadData: () => void;
}

const MapViewAssignments = ({
  latitude,
  longitude,
  startingZoom,
  data,
  rerender,
  collapse,
  clearHandler,
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
  const [showModal, setShowModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<[string, Properties]>();
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  useEffect(() => {
    if (map && map.current) {
      map.current?.resize();
    }
  }, [rerender]);

  useEffect(() => {
    // initialize map only once
    // set listeners
    if (map.current === undefined) {
      const mapInstance = initMap(mapContainer, [lng, lat], zoom, 'bottom-left');
      mapInstance.on('move', _ => {
        setLng(Math.round(mapInstance.getCenter().lng * 100) / 100);
        setLat(Math.round(mapInstance.getCenter().lat * 100) / 100);
        setZoom(Math.round(mapInstance.getZoom() * 100) / 100);
      });
      //load locations plan
      if (planId) {
        if (currentPlan !== undefined) {
          mapInstance.on('moveend', e => {
            //when first location is loaded it sends data trough event,
            //set location label and set map click event listeners
            if (e.data) {
              createLocationLabel(mapInstance, e.data, e.center);
              const openHandler = (selectedLocation: any) => {
                setCurrentLocation([selectedLocation.properties.id, selectedLocation.properties]);
                setShowModal(true);
              };
              //set double click listener
              doubleClickHandler(mapInstance, e.data.identifier, currentPlan.identifier);
              //set right clik listener
              contextMenuHandler(mapInstance, e.data.identifier, openHandler, currentPlan.identifier);
              //set ctrl + left click listener
              selectHandler(mapInstance, selectedLocations, (locations: string[]) => setSelectedLocations(locations));
              if (moveend) {
                moveend();
              }
            }
          });
        } else {
          getPlanById(planId).then(plan => {
            setCurrentPlan(plan);
            mapInstance.on('moveend', e => {
              //when first location is loaded it sends data trough event,
              //set location label and set map click event listeners
              if (e.data) {
                createLocationLabel(mapInstance, e.data, e.center);
                const openHandler = (selectedLocation: any) => {
                  setCurrentLocation([selectedLocation.properties.id, selectedLocation.properties]);
                  setShowModal(true);
                };
                //set double click listener
                doubleClickHandler(mapInstance, e.data.identifier, plan.identifier);
                //set right clik listener
                contextMenuHandler(mapInstance, e.data.identifier, openHandler, plan.identifier);
                //set ctrl + left click listener
                selectHandler(mapInstance, selectedLocations, (locations: string[]) => setSelectedLocations(locations));
                if (moveend) {
                  moveend();
                }
              }
            });
          });
        }
      }
      map.current = mapInstance;
    }
  }, [lat, lng, zoom, moveend, planId, currentPlan, selectedLocations]);

  useEffect(() => {
    const currentMap = map.current;
    if (currentMap && currentMap.isStyleLoaded() && data && currentPlan) {
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
      selectedLocations.length = 0;
      clearHandler();
      map.current?.remove();
      map.current = undefined;
    }
  };

  return (
    <div className="flex-grow-1" style={{ position: 'relative' }}>
      <div className="sidebar">
        <Button onClick={collapse}>{rerender ? 'Show Menu' : 'Hide Menu'}</Button>
      </div>
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
      {showModal && currentLocation && (
        <AssignModal
          closeHandler={(action: boolean) => {
            if (action) {
              reloadData();
            }
            setShowModal(false);
          }}
          selectedLocations={selectedLocations}
          locationData={currentLocation}
        />
      )}
    </div>
  );
};

export default MapViewAssignments;
