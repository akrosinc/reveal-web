import React, { useEffect, useState, useRef, useCallback } from 'react';
import mapboxgl, { Map } from 'mapbox-gl';
import './index.css';
import { Button } from 'react-bootstrap';
import {
  contextMenuHandler,
  createLocation,
  doubleClickHandler,
  hoverHandler,
  initMap,
  isLocationAlreadyLoaded,
  loadChildren,
  selectHandler
} from '../../utils';
import { useParams } from 'react-router-dom';
import { getPlanById } from '../../features/plan/api';
import { PlanModel } from '../../features/plan/providers/types';
import AssignModal from '../../features/assignment/components/assign/assignModal';
import { Properties } from '../../features/location/providers/types';
import { toast } from 'react-toastify';
import { getLocationByIdAndPlanId } from '../../features/location/api';

mapboxgl.accessToken = process.env.REACT_APP_GISIDA_MAPBOX_TOKEN ?? '';

interface Props {
  latitude?: number;
  longitude?: number;
  startingZoom: number;
  data: any;
  rerender: boolean;
  collapse: () => void;
  clearHandler: () => void;
  moveend: () => void;
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

  //resize map on hide/show menu action
  useEffect(() => {
    if (map && map.current) {
      map.current?.resize();
    }
  }, [rerender]);

  // initialize map only once
  // set listeners
  const initializeMap = useCallback(() => {
    if (map.current === undefined) {
      const mapInstance = initMap(mapContainer, [lng, lat], zoom, 'bottom-left');
      mapInstance.on('move', _ => {
        setLng(Math.round(mapInstance.getCenter().lng * 100) / 100);
        setLat(Math.round(mapInstance.getCenter().lat * 100) / 100);
        setZoom(Math.round(mapInstance.getZoom() * 100) / 100);
      });
      //load locations plan
      if (planId) {
        const openHandler = (selectedLocation: any, assign: boolean) => {
          if (assign) {
            getLocationByIdAndPlanId(selectedLocation.properties.id, planId).then(res => {
              if (map.current?.getSource(selectedLocation.properties.id)) {
                map.current.removeLayer(selectedLocation.properties.id + '-fill');
                map.current.removeLayer(selectedLocation.properties.id + '-outline');
                map.current.removeLayer(selectedLocation.properties.id + '-fill-disable');
                map.current.removeSource(selectedLocation.properties.id);
                createLocation(map!.current!, res, () => undefined);
              }
              if (map.current?.getSource(selectedLocation.properties.parentIdentifier + 'children')) {
                //if there is a change to a location loaded by child endpoint we should load again all children by parent location to show changes made
                map.current.removeLayer(selectedLocation.properties.parentIdentifier + 'children-fill');
                map.current.removeLayer(selectedLocation.properties.parentIdentifier + 'children-border');
                map.current.removeLayer(selectedLocation.properties.parentIdentifier + 'children-fill-disable');
                map.current.removeSource(selectedLocation.properties.parentIdentifier + 'children');
                map.current.removeLayer(selectedLocation.properties.parentIdentifier + 'children-label');
                if (map.current.getSource(selectedLocation.properties.parentIdentifier + 'children-label')) {
                  map.current.removeSource(selectedLocation.properties.parentIdentifier + 'children-label');
                }
                loadChildren(map!.current!, selectedLocation.properties.parentIdentifier, planId);
              }
            });
          } else {
            setCurrentLocation([selectedLocation.properties.id, selectedLocation.properties]);
            setShowModal(true);
          }
        };
        const setHandlers = (plan: PlanModel, locationIdentifer: string) => {
          //set double click listener
          doubleClickHandler(mapInstance, plan.identifier);
          //set right clik listener
          contextMenuHandler(mapInstance, openHandler, plan.identifier);
          //set ctrl + left click listener
          selectHandler(mapInstance, selectedLocations, (locations: string[]) => setSelectedLocations(locations));
          //set hover handler
          hoverHandler(mapInstance, locationIdentifer);
        };
        if (currentPlan !== undefined) {
          mapInstance.on('moveend', e => {
            //clear button was click initialize handlers again
            if (e.data) {
              setHandlers(currentPlan, e.data.identifier);
            }
          });
        } else {
          getPlanById(planId).then(plan => {
            setCurrentPlan(plan);
            mapInstance.on('moveend', e => {
              //when first location is loaded it sends data trough event,
              //set location label and set map click event listeners
              if (e.data) {
                setHandlers(plan, e.data.identifier);
              }
            });
          });
        }
      }
      map.current = mapInstance;
    }
  }, [lat, lng, zoom, planId, currentPlan, selectedLocations]);

  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  useEffect(() => {
    const currentMap = map.current;
    if (currentMap && currentMap.isStyleLoaded() && data && currentPlan) {
      if (isLocationAlreadyLoaded(currentMap, data.properties.name)) {
        toast.warning('This location is already loaded.');
        moveend();
      } else {
        createLocation(currentMap, data, moveend);
      }
    }
  }, [data, currentPlan, moveend]);

  useEffect(() => {
    return () => {
      //Clear map and all WebGLContext from browser memory
      map.current?.remove();
      map.current = undefined;
    };
  }, []);

  //delete all map data and initialize new instance
  const deleteMapData = () => {
    if (data) {
      selectedLocations.length = 0;
      clearHandler();
      map.current?.remove();
      map.current = undefined;
      initializeMap();
    }
  };

  return (
    <div className="flex-grow-1" style={{ position: 'relative' }}>
      <div className="sidebar">
        <Button style={{ boxShadow: '4px 4px 3px rgba(24, 24, 24, 0.8)' }} onClick={collapse}>
          {rerender ? 'Show Menu' : 'Hide Menu'}
        </Button>
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
            if (action && map.current && moveend && planId) {
              getLocationByIdAndPlanId(currentLocation[0], planId).then(res => {
                if (map.current?.getSource(currentLocation[0])) {
                  map.current.removeLayer(currentLocation[0] + '-fill');
                  map.current.removeLayer(currentLocation[0] + '-outline');
                  map.current.removeLayer(currentLocation[0] + '-fill-disable');
                  map.current.removeSource(currentLocation[0]);
                  createLocation(map!.current!, res, moveend);
                }
                if (map.current?.getSource(currentLocation[1].parentIdentifier + 'children')) {
                  //if there is a change to a location loaded by child endpoint we should load again all children by parent location to show changes made
                  map.current.removeLayer(currentLocation[1].parentIdentifier + 'children-fill');
                  map.current.removeLayer(currentLocation[1].parentIdentifier + 'children-border');
                  map.current.removeLayer(currentLocation[1].parentIdentifier + 'children-fill-disable');
                  map.current.removeSource(currentLocation[1].parentIdentifier + 'children');
                  map.current.removeLayer(currentLocation[1].parentIdentifier + 'children-label');
                  if (map.current.getSource(currentLocation[1].parentIdentifier + 'children-label')) {
                    map.current.removeSource(currentLocation[1].parentIdentifier + 'children-label');
                  }
                  loadChildren(map!.current!, currentLocation[1].parentIdentifier, planId);
                }
              });
            }
            setShowModal(false);
            selectedLocations.forEach(el => {
              map.current?.removeLayer(el + '-highlighted');
            });
          }}
          selectedLocations={selectedLocations}
          locationData={currentLocation}
        />
      )}
    </div>
  );
};

export default MapViewAssignments;
