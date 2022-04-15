import React, { useEffect, useState, useRef, useCallback } from 'react';
import mapboxgl, { Layer, Map } from 'mapbox-gl';
import './index.css';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';
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
import { getLocationByIdAndPlanId } from '../../features/location/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { MAP_COLOR_NO_TEAMS, MAP_COLOR_TEAM_ASSIGNED } from '../../constants';

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
  const legend = ['Teams assigned', 'Location is assigned but no teams', 'Unassigned location', 'Selected'];
  const legendColors = ['green', 'red', 'gray', '#6e599f'];

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
          // if location assign button is clicked call assignemnt else open team assignment modal
          //LOKACIJE UCITANE RUCNO/CREATE LOCATION NE DOBIJAJU ID
          //RESITI TO I ONDA CE OVA LOGIKA ISPOD RADITI ODLICNO, DODATI SAMO SETPAINTPROPERTY FEATURE I TO JE TO SUTRA
          if (assign) {
            getLocationByIdAndPlanId(selectedLocation.properties.id, planId).then(res => {
              if (map.current?.getSource(selectedLocation.properties.id)) {
                map.current.removeLayer(selectedLocation.properties.id + '-fill-disable');
                map.current
                  .queryRenderedFeatures(undefined, { filter: ['==', ['get', 'id'], res.identifier] })
                  .forEach(el => {
                    if (el.id) {
                      map!.current!.setFeatureState(el, {
                        assigned: true
                      });
                    }
                  });
              }
              if (map.current?.getSource(selectedLocation.properties.parentIdentifier + 'children')) {
                //if there is a change to a location loaded by child endpoint we should load again all children by parent location to show changes made
                map.current.removeLayer(selectedLocation.properties.parentIdentifier + 'children-fill');
                map.current.removeLayer(selectedLocation.properties.parentIdentifier + 'children-border');
                map.current.removeLayer(selectedLocation.properties.parentIdentifier + 'children-fill-disable');
                map.current.removeSource(selectedLocation.properties.parentIdentifier + 'children');
                if (map.current.getLayer(selectedLocation.properties.parentIdentifier + 'children-label')) {
                  map.current.removeLayer(selectedLocation.properties.parentIdentifier + 'children-label');
                }
                if (map.current.getSource(selectedLocation.properties.parentIdentifier + 'children-label')) {
                  map.current.removeSource(selectedLocation.properties.parentIdentifier + 'children-label');
                }
                loadChildren(map!.current!, selectedLocation.properties.parentIdentifier, planId);
              }
              reloadData();
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
  }, [lat, lng, zoom, planId, currentPlan, selectedLocations, reloadData]);

  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  useEffect(() => {
    const currentMap = map.current;
    if (currentMap && currentMap.isStyleLoaded() && data && currentPlan) {
      if (isLocationAlreadyLoaded(currentMap, data.properties.name)) {
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

  //tooltip popover component
  const popover = (
    <Popover id="popover-basic">
      <Popover.Header as="h3" className="text-center">
        Map Legend
      </Popover.Header>
      <Popover.Body>
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
      </Popover.Body>
    </Popover>
  );

  // Function used to rerender map on incoming changes directly without adding or removing existing layers
  const closeModalHandler = (action: boolean, teamCount: number) => {
    if (action && map.current && moveend && planId) {
      //check for multi select feature
      if (selectedLocations.length) {
        let uniqueSourceSet = new Set<string>();
        selectedLocations.forEach(el => {
          if (map.current?.getLayer(el + '-highlighted')) {
            let sourceName = (map.current?.getLayer(el + '-highlighted') as Layer).source;
            uniqueSourceSet.add(sourceName!.toString());
            map.current?.removeLayer(el + '-highlighted');
          }
        });
        map.current
          .queryRenderedFeatures(undefined, { filter: ['in', ['get', 'id'], ['literal', selectedLocations]] })
          .forEach(el => {
            if (el.id) {
              map!.current!.setFeatureState(el, {
                numberOfTeams: teamCount
              });
            }
          });
        uniqueSourceSet.forEach(el => {
          map.current?.setPaintProperty(el + '-fill', 'fill-color', [
            'match',
            ['get', 'id'],
            selectedLocations,
            teamCount > 0 ? MAP_COLOR_TEAM_ASSIGNED : MAP_COLOR_NO_TEAMS,
            [
              'case',
              ['!=', ['feature-state', 'numberOfTeams'], null],
              ['match', ['feature-state', 'numberOfTeams'], 0, MAP_COLOR_NO_TEAMS, MAP_COLOR_TEAM_ASSIGNED],
              ['match', ['get', 'numberOfTeams'], 0, MAP_COLOR_NO_TEAMS, MAP_COLOR_TEAM_ASSIGNED]
            ]
          ]);
        });
        selectedLocations.length = 0;
        setSelectedLocations(selectedLocations);
      } else {
        //checks if location is loaded manually from the grid or from the double click event
        if (currentLocation) {
          getLocationByIdAndPlanId(currentLocation[0], planId).then(res => {
            if (map.current?.getSource(currentLocation[0])) {
              if (res.properties.assigned && map.current.getLayer(res.identifier + '-fill')) {
                map.current
                  .queryRenderedFeatures(undefined, { filter: ['==', ['get', 'id'], currentLocation[0]] })
                  .forEach(el => {
                    if (el.id) {
                      map!.current!.setFeatureState(el, {
                        numberOfTeams: res.properties.numberOfTeams
                      });
                    }
                  });
                // literal expression to check if the the location has already been updated by set feature-state method
                map.current.setPaintProperty(res.identifier + '-fill', 'fill-color', [
                  'match',
                  ['get', 'id'],
                  res.identifier,
                  res.properties.numberOfTeams > 0 ? 'green' : 'red',
                  [
                    'case',
                    ['!=', ['feature-state', 'numberOfTeams'], null],
                    ['match', ['feature-state', 'numberOfTeams'], 0, MAP_COLOR_NO_TEAMS, MAP_COLOR_TEAM_ASSIGNED],
                    ['match', ['get', 'numberOfTeams'], 0, MAP_COLOR_NO_TEAMS, MAP_COLOR_TEAM_ASSIGNED]
                  ]
                ]);
              }
            }
            if (map.current?.getSource(currentLocation[1].parentIdentifier + 'children')) {
              if (res.properties.assigned && map.current.getLayer(res.properties.parentIdentifier + 'children-fill')) {
                map.current
                  .queryRenderedFeatures(undefined, { filter: ['==', ['get', 'id'], currentLocation[0]] })
                  .forEach(el => {
                    map!.current!.setFeatureState(el, {
                      numberOfTeams: res.properties.numberOfTeams
                    });
                  });
                map.current.setPaintProperty(res.properties.parentIdentifier + 'children-fill', 'fill-color', [
                  'match',
                  ['get', 'id'],
                  res.identifier,
                  res.properties.numberOfTeams > 0 ? MAP_COLOR_TEAM_ASSIGNED : MAP_COLOR_NO_TEAMS,
                  [
                    'case',
                    ['!=', ['feature-state', 'numberOfTeams'], null],
                    ['match', ['feature-state', 'numberOfTeams'], 0, MAP_COLOR_NO_TEAMS, MAP_COLOR_TEAM_ASSIGNED],
                    ['match', ['get', 'numberOfTeams'], 0, MAP_COLOR_NO_TEAMS, MAP_COLOR_TEAM_ASSIGNED]
                  ]
                ]);
              }
            }
          });
        }
      }
      //reload grid view data
      reloadData();
    }
    setShowModal(false);
  };

  return (
    <div className="flex-grow-1" style={{ position: 'relative' }}>
      <div className="sidebar">
        <Button className="me-2" style={{ boxShadow: '4px 4px 3px rgba(24, 24, 24, 0.8)' }} onClick={collapse}>
          {rerender ? 'Show Menu' : 'Hide Menu'}
        </Button>
        <OverlayTrigger trigger="click" placement="bottom" overlay={popover} rootClose={true}>
          <Button style={{ boxShadow: '4px 4px 3px rgba(24, 24, 24, 0.8)' }}>
            <FontAwesomeIcon icon="info-circle" className="text-white mt-1" />
          </Button>
        </OverlayTrigger>
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
          closeHandler={closeModalHandler}
          selectedLocations={selectedLocations}
          locationData={currentLocation}
        />
      )}
    </div>
  );
};

export default MapViewAssignments;
