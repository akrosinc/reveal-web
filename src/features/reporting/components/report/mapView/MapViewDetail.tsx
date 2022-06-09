import React, { useEffect, useState, useRef, useCallback } from 'react';
import mapboxgl, { Map, Popup } from 'mapbox-gl';
import { Button, Container } from 'react-bootstrap';
import { createChildLocationLabel, getPolygonCenter, initMap } from '../../../../../utils';
import PopoverComponent from '../../../../../components/Popover';
import { bbox, Feature, FeatureCollection, MultiPolygon, Point, Polygon, Properties } from '@turf/turf';
import { useAppDispatch } from '../../../../../store/hooks';
import { showLoader } from '../../../../reducers/loader';
import {
  COLOR_BOOTSTRAP_DANGER,
  COLOR_BOOTSTRAP_SUCCESS,
  COLOR_BOOTSTRAP_WARNING,
  COLOR_YELLOW,
  MAPBOX_STYLE_SATELLITE,
  MAP_DEFAULT_FILL_OPACITY,
  MAP_STRUCTURE_LEGEND_COLORS,
  MDA_STRUCTURE_COLOR_COMPLETE,
  MDA_STRUCTURE_COLOR_NOT_ELIGIBLE,
  MDA_STRUCTURE_COLOR_NOT_VISITED,
  MDA_STRUCTURE_COLOR_SMC_COMPLETE_,
  MDA_STRUCTURE_COLOR_SPAQ_COMPLETE,
  REPORT_TABLE_PERCENTAGE_HIGH,
  REPORT_TABLE_PERCENTAGE_LOW,
  REPORT_TABLE_PERCENTAGE_MEDIUM
} from '../../../../../constants';
import { IrsStructureStatus, MdaStructureStatus, ReportLocationProperties, ReportType } from '../../../providers/types';
import { useParams } from 'react-router-dom';

mapboxgl.accessToken = process.env.REACT_APP_GISIDA_MAPBOX_TOKEN ?? '';

interface Props {
  featureSet:
    | [location: FeatureCollection<Polygon | MultiPolygon, ReportLocationProperties>, parentId: string]
    | undefined;
  clearMap: () => void;
  doubleClickEvent: (feature: Feature<Polygon | MultiPolygon, ReportLocationProperties>) => void;
  showModal: (show: boolean, feature?: Feature<Polygon | MultiPolygon, ReportLocationProperties>) => void;
}

const MapViewDetail = ({ featureSet, clearMap, doubleClickEvent, showModal }: Props) => {
  const mapContainer = useRef<any>();
  const map = useRef<Map>();
  const [lng, setLng] = useState(20);
  const [lat, setLat] = useState(10);
  const [zoom, setZoom] = useState(4);
  const dispatch = useAppDispatch();
  let contextMenuPopup = useRef<Popup>(new Popup({ focusAfterOpen: true, closeOnMove: true, closeButton: false }));
  let hoverPopup = useRef<Popup>(new Popup({ closeOnClick: false, closeButton: false, offset: 20 }));
  const opacity = useRef(MAP_DEFAULT_FILL_OPACITY);
  const { reportType } = useParams();

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = initMap(mapContainer, [lng, lat], zoom, 'bottom-left', MAPBOX_STYLE_SATELLITE);
    const mapInstance = map.current;
    //add event handlers
    mapInstance.on('dblclick', e => {
      if (!e.originalEvent.ctrlKey) {
        const features = mapInstance.queryRenderedFeatures(e.point);
        if (features.length) {
          const feature = features[0];
          if (feature && feature.layer.type !== 'symbol') {
            doubleClickEvent(feature as any);
          }
        }
      }
    });
    mapInstance.on('contextmenu', e => {
      const features = mapInstance.queryRenderedFeatures(e.point);
      if (features.length) {
        //convert to location properties feature
        const feature = features[0] as any as Feature<Polygon | MultiPolygon, ReportLocationProperties>;
        if (feature) {
          contextMenuPopup.current.remove();
          hoverPopup.current.remove();
          contextMenuPopup.current
            .setLngLat(e.lngLat)
            .setHTML(
              `<h4 class='bg-success text-center'>Action menu</h4>
              <div class='m-0 p-0 text-center'>
              <p>Property name: ${feature.properties?.name}</p>
              <button class='btn btn-primary mb-2' id='report-detail-button'>Details</button>
              </div>`
            )
            .addTo(mapInstance);

          document.getElementById('report-detail-button')?.addEventListener('click', () => {
            showModal(true, feature);
          });
        }
      }
    });
  });

  // main function to load and draw locations to the map
  // logic for displaying borders and fill colors
  const loadLocationSet = useCallback(
    (
      map: Map,
      data: FeatureCollection<Polygon | MultiPolygon, ReportLocationProperties>,
      parentLocationIdentifier: string
    ) => {
      //check if its clear map event or new location otherwise just fit to bounds
      if (map.getSource(parentLocationIdentifier) === undefined && data.features.length) {
        dispatch(showLoader(true));
        map.addSource(parentLocationIdentifier, {
          type: 'geojson',
          promoteId: 'id',
          data: data,
          tolerance: 1
        });

        map.addLayer(
          {
            id: parentLocationIdentifier + '-fill',
            type: 'fill',
            source: parentLocationIdentifier,
            layout: {},
            paint: {
              'fill-color': [
                'match',
                ['get', 'geographicLevel'],
                'structure',
                [
                  'case',
                  ['==', ['get', 'locationBusinessStatus'], null],
                  'black',
                  ['==', ['get', 'locationBusinessStatus'], MdaStructureStatus.COMPLETE],
                  MDA_STRUCTURE_COLOR_COMPLETE,
                  ['==', ['get', 'locationBusinessStatus'], MdaStructureStatus.NOT_VISITED],
                  MDA_STRUCTURE_COLOR_NOT_VISITED,
                  ['==', ['get', 'locationBusinessStatus'], MdaStructureStatus.NOT_ELIGIBLE],
                  MDA_STRUCTURE_COLOR_NOT_ELIGIBLE,
                  ['==', ['get', 'locationBusinessStatus'], MdaStructureStatus.SMC_COMPLETE],
                  MDA_STRUCTURE_COLOR_SMC_COMPLETE_,
                  ['==', ['get', 'locationBusinessStatus'], MdaStructureStatus.SPAQ_COMPLETE],
                  MDA_STRUCTURE_COLOR_SPAQ_COMPLETE,
                  'transparent'
                ],
                [
                  'case',
                  ['==', ['get', 'distCoveragePercent'], null],
                  'black',
                  ['<', ['get', 'distCoveragePercent'], REPORT_TABLE_PERCENTAGE_LOW],
                  COLOR_BOOTSTRAP_DANGER,
                  ['<', ['get', 'distCoveragePercent'], REPORT_TABLE_PERCENTAGE_MEDIUM],
                  COLOR_BOOTSTRAP_WARNING,
                  ['<', ['get', 'distCoveragePercent'], REPORT_TABLE_PERCENTAGE_HIGH],
                  COLOR_YELLOW,
                  ['>=', ['get', 'distCoveragePercent'], REPORT_TABLE_PERCENTAGE_HIGH],
                  COLOR_BOOTSTRAP_SUCCESS,
                  'transparent'
                ]
              ],
              'fill-opacity': opacity.current
            }
          },
          'label-layer'
        );

        map.addLayer(
          {
            id: parentLocationIdentifier + '-border',
            type: 'line',
            source: parentLocationIdentifier,
            layout: {},
            paint: {
              'line-color': 'black',
              'line-width': 4
            }
          },
          'label-layer'
        );

        map.on('mouseover', parentLocationIdentifier + '-label', e => {
          const feature = map.queryRenderedFeatures(e.point)[0];
          const properties = feature.properties as ReportLocationProperties;
          if (properties && !hoverPopup.current.isOpen() && !contextMenuPopup.current.isOpen()) {
            map.getCanvas().style.cursor = 'pointer';
            hoverPopup.current
              .setLngLat(e.lngLat)
              .setHTML(
                `<h4 class='bg-success text-light text-center'>${properties['name']}</h4><div class='p-2'>
                ${
                  properties.distCoveragePercent !== undefined
                    ? `<small class='my-3'>Distribution coverage: ${properties.distCoveragePercent.toFixed(2)}%</small>`
                    : ''
                }
                ${
                  properties.numberOfChildrenTreated !== undefined
                    ? `<small class='my-3'>Number Of Children Treated: ${properties.numberOfChildrenTreated}</small>`
                    : ''
                }
              ${
                properties.numberOfChildrenEligible !== undefined
                  ? `<small class='my-3'>Number Of Children Eligible: ${properties.numberOfChildrenEligible}</small>`
                  : ''
              }
              </div>`
              )
              .addTo(map);
          }
        });

        map.on('mouseleave', parentLocationIdentifier + '-label', () => {
          map.getCanvas().style.cursor = '';
          hoverPopup.current.remove();
        });

        const featureSet: Feature<Point, Properties>[] = [];
        const bounds = bbox(data) as any;
        data.features.forEach((element: Feature<Polygon | MultiPolygon, ReportLocationProperties>) => {
          //create label for each of the locations
          //create a group of locations so we can fit them all in viewport
          const centerLabel = getPolygonCenter(element);
          centerLabel.center.properties = { ...element.properties };
          featureSet.push(centerLabel.center);
        });
        map.fitBounds(bounds, {
          easing: e => {
            //this is an event which is fired at the end of the fit bounds
            if (e === 1) {
              createChildLocationLabel(map, featureSet, parentLocationIdentifier);
              dispatch(showLoader(false));
            }
            return e;
          },
          padding: 20,
          duration: 600
        });
      }
      //fit to bounds if that location already exist
      else if (data.features.length) {
        dispatch(showLoader(false));
        map.fitBounds(bbox(data) as any);
      }
    },
    [dispatch]
  );

  useEffect(() => {
    if (map.current && featureSet) {
      const mapInstance = map.current;
      //check if map is loaded completly
      if (mapInstance.getLayer('label-layer')) {
        loadLocationSet(mapInstance, featureSet[0], featureSet[1]);
      } else {
        mapInstance.once('load', () => {
          loadLocationSet(mapInstance, featureSet[0], featureSet[1]);
        });
      }
    }
  }, [featureSet, loadLocationSet]);

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

  const opacityRangeHandler = (inputValue: string) => {
    if (map.current) {
      map.current.queryRenderedFeatures().forEach(el => {
        if (el.layer.id)
          if (map!.current!.getLayer(el.layer.id) && el.layer.id.includes('-fill')) {
            map!.current!.setPaintProperty(el.layer.id, 'fill-opacity', Number(inputValue) / 100);
            opacity.current = Number(inputValue) / 100;
          }
      });
    }
  };

  return (
    <Container fluid style={{ position: 'relative' }} className="mx-0 px-0">
      <div className="sidebar text-light">
        {reportType && (
          <PopoverComponent title="Structure Map Legend">
            <ul style={{ listStyle: 'none' }}>
              {reportType === ReportType.MDA_FULL_COVERAGE ||
              reportType === ReportType.MDA_FULL_COVERAGE_OPERATIONAL_AREA_LEVEL
                ? Object.keys(MdaStructureStatus).map((el, index) => (
                    <li key={index}>
                      <span
                        className="sidebar-legend"
                        style={{ backgroundColor: MAP_STRUCTURE_LEGEND_COLORS[index] }}
                      ></span>
                      {el}
                    </li>
                  ))
                : Object.keys(IrsStructureStatus).map((el, index) => <li key={index}>{el}</li>)}
            </ul>
          </PopoverComponent>
        )}
        <div className="mt-2">
          <label id="range-input-label" className="text-white">
            Layer opacity
          </label>
          <br />
          <input
            id="range-input"
            defaultValue={opacity.current * 100}
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
          onClick={() => {
            if (map.current) {
              map.current.remove();
              map.current = undefined;
              setZoom(4);
              setLat(10);
              setLng(20);
              clearMap();
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
