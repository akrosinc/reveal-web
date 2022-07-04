import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Layer, Map } from 'mapbox-gl';
import '../../../../../components/MapBox/index.css';
import { Button } from 'react-bootstrap';
import {
  contextMenuHandler,
  createLocation,
  doubleClickHandler,
  hoverHandler,
  initMap,
  isLocationAlreadyLoaded,
  selectHandler
} from '../../../../../utils';
import { useParams } from 'react-router-dom';
import { getPlanById } from '../../../../plan/api';
import { PlanModel } from '../../../../plan/providers/types';
import AssignModal from '../assignModal';
import { Properties } from '../../../../location/providers/types';
import { getLocationByIdAndPlanId } from '../../../../location/api';
import {
  MAPBOX_STYLE_SATELLITE,
  MAP_COLOR_NO_TEAMS,
  MAP_COLOR_TEAM_ASSIGNED,
  MAP_COLOR_UNASSIGNED,
  MAP_DEFAULT_FILL_OPACITY,
  MAP_LEGEND_COLORS,
  MAP_LEGEND_TEXT
} from '../../../../../constants';
import PopoverComponent from '../../../../../components/Popover';

interface Props {
  data: any;
  rerender: boolean;
  collapse: () => void;
  clearHandler: () => void;
  moveend: () => void;
  reloadData: () => void;
}

const MapViewAssignments = ({ data, rerender, collapse, clearHandler, moveend, reloadData }: Props) => {
  const mapContainer = useRef<any>(null);
  const map = useRef<Map>();
  const [lng, setLng] = useState(28.283333);
  const [lat, setLat] = useState(-15.416667);
  const [zoom, setZoom] = useState(4);
  const { planId } = useParams();
  const [currentPlan, setCurrentPlan] = useState<PlanModel>();
  const [showModal, setShowModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<[string, Properties]>();
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [opacity, setOpacity] = useState(MAP_DEFAULT_FILL_OPACITY);

  //resize map on hide/show menu action
  useEffect(() => {
    if (map && map.current) {
      map.current?.resize();
    }
  }, [rerender]);

  const opacityRangeHandler = (inputValue: string) => {
    if (map.current) {
      map.current.queryRenderedFeatures().forEach(el => {
        if (el.layer.id)
          if (map!.current!.getLayer(el.layer.id) && el.layer.id.includes('-fill')) {
            map!.current!.setPaintProperty(el.layer.id, 'fill-opacity', Number(inputValue) / 100);
            setOpacity(Number(inputValue) / 100);
          }
      });
    }
  };

  // initialize map only once
  // set listeners
  const initializeMap = useCallback(() => {
    if (map.current === undefined) {
      const mapInstance = initMap(mapContainer, [lng, lat], zoom, 'bottom-left', MAPBOX_STYLE_SATELLITE);
      mapInstance.on('move', _ => {
        setLng(Math.round(mapInstance.getCenter().lng * 100) / 100);
        setLat(Math.round(mapInstance.getCenter().lat * 100) / 100);
        setZoom(Math.round(mapInstance.getZoom() * 100) / 100);
      });
      //load locations plan
      if (planId) {
        const openHandler = (selectedLocation: any, assign: boolean) => {
          // if location assign button is clicked call assignment else open team assignment modal
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
                map.current
                  .queryRenderedFeatures(undefined, { filter: ['==', ['get', 'id'], res.identifier] })
                  .forEach(el => {
                    if (el.id) {
                      map!.current!.setFeatureState(el, {
                        assigned: true
                      });
                    }
                  });
                map.current.setPaintProperty(
                  selectedLocation.properties.parentIdentifier + 'children-fill-disable',
                  'fill-color',
                  [
                    'match',
                    ['get', 'id'],
                    res.identifier,
                    'transparent',
                    ['case', ['!=', ['feature-state', 'assigned'], null], 'transparent', MAP_COLOR_UNASSIGNED]
                  ]
                );
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
          doubleClickHandler(mapInstance, plan.identifier, opacity);
          //set right clik listener
          contextMenuHandler(mapInstance, openHandler, plan.identifier, opacity);
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
  }, [lat, lng, zoom, planId, currentPlan, selectedLocations, reloadData, opacity]);

  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  useEffect(() => {
    const currentMap = map.current;
    if (currentMap && data) {
      if (isLocationAlreadyLoaded(currentMap, data.properties.name)) {
        moveend();
      } else {
        //check if map is loaded completly
        if (currentMap.getLayer('label-layer')) {
          createLocation(currentMap, data, moveend, opacity);
        } else {
          currentMap.once('load', () => {
            createLocation(currentMap, data, moveend, opacity);
          });
        }
      }
    }
  }, [data, moveend, opacity]);

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
      setOpacity(MAP_DEFAULT_FILL_OPACITY);
      selectedLocations.length = 0;
      map.current?.remove();
      map.current = undefined;
      //init new map
      initializeMap();
      //clear handler on map load
      map!.current!.once('load', () => {
        clearHandler();
      });
    }
  };

  // Function used to rerender map on incoming changes directly without adding or removing existing layers
  const closeModalHandler = (action: boolean, teamCount: number) => {
    if (action && map.current && planId) {
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
        <PopoverComponent title="Map Legend">
          <ul style={{ listStyle: 'none' }}>
            {MAP_LEGEND_TEXT.map((el, index) => {
              return (
                <li key={index}>
                  <span className="sidebar-legend" style={{ backgroundColor: MAP_LEGEND_COLORS[index] }} />
                  {el}
                </li>
              );
            })}
          </ul>
        </PopoverComponent>
        <div className="mt-2">
          <label id="range-input-label" className="text-white">
            Layer opacity
          </label>
          <br />
          <input
            id="range-input"
            value={opacity * 100}
            type="range"
            onChange={e => opacityRangeHandler(e.target.value)}
          />
        </div>
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
