import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Map, Popup } from 'mapbox-gl';
import { Button, Container } from 'react-bootstrap';
import {
  createChildLocationLabel,
  disableMapInteractions,
  getPolygonCenter,
  initMap
} from '../../../../../utils';
import PopoverComponent from '../../../../../components/Popover';
import {
  bbox,
  Feature,
  FeatureCollection,
  MultiPolygon,
  Point,
  Polygon,
  Properties
} from '@turf/turf';
import {
  MAPBOX_STYLE_SATELLITE,
  MAP_DEFAULT_FILL_OPACITY,
  MAP_IRS_STRUCTURE_LEGEND_COLORS,
  MAP_MDA_STRUCTURE_LEGEND_COLORS,
} from '../../../../../constants';
import {
  IrsStructureStatus,
  MdaStructureStatus,
  ReportLocationProperties,
  ReportType
} from '../../../providers/types';
import { useParams } from 'react-router-dom';
import { t } from "i18next";

interface Props {
  featureSet:
  | [
    location: FeatureCollection<Polygon | MultiPolygon | Point, ReportLocationProperties>,
    parentId: string,
    path: string[]
  ]
  | undefined;
  clearMap: () => void;
  doubleClickEvent: (feature: Feature<Polygon | MultiPolygon, ReportLocationProperties>) => void;
  showModal: (show: boolean, feature?: Feature<Polygon | MultiPolygon, ReportLocationProperties>) => void;
  defaultColumn: string;
}
const AGE_COVERAGE_LEGEND = [
  { label: 'Male 1-4 years', key: 'Male 1-4 years' },
  { label: 'Male 5-14 years', key: 'Male 5-14 years' },
  { label: 'Male 15 years and above', key: 'Male 15+ years' },
  { label: 'Female 1-4 years', key: 'Female 1-4 years' },
  { label: 'Female 5-14 years', key: 'Female 5-14 years' },
  { label: 'Female 15 years and above', key: 'Female 15+ years' }
]

const ONCHO_COVERAGE_LEGEND = [
  { label: 'Field Verified Pop Treatment Coverage', key: 'Field Verified Pop Treatment Coverage' },
  { label: 'Coverage Of Structures Completed', key: 'Coverage Of Structures Completed' },
  { label: 'Coverage Of Structures Visited', key: 'Coverage Of Structures Visited' }
]

const MapViewDetail = React.forwardRef<any, Props>(
  ({ featureSet, clearMap, doubleClickEvent, showModal, defaultColumn }, ref) => {
    const mapContainer = useRef<any>();
    const map = useRef<Map>();
    const [lng, setLng] = useState(20);
    const [lat, setLat] = useState(10);
    const [zoom, setZoom] = useState(4);
    let contextMenuPopup = useRef<Popup>(new Popup({
      focusAfterOpen: true,
      closeOnMove: true,
      closeButton: false
    }));
    let hoverPopup = useRef<Popup>(new Popup({
      closeOnClick: false,
      closeButton: false,
      offset: 20
    }));
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
        currentMap: Map,
        data: FeatureCollection<Polygon | MultiPolygon | Point, ReportLocationProperties>,
        parentLocationIdentifier: string,
        path: string[]
      ) => {
        //check if its clear map event or new location otherwise just fit to bounds
        if (currentMap.getSource(parentLocationIdentifier) === undefined && data.features.length) {
          disableMapInteractions(currentMap, true);
          currentMap.addSource(parentLocationIdentifier, {
            type: 'geojson',
            promoteId: 'id',
            data: data,
            tolerance: 1
          });

          currentMap.addLayer(
            {
              id:
                parentLocationIdentifier +
                (data.features.length && data.features[0].properties.geographicLevel === 'structure'
                  ? '-structure'
                  : '-fill'),
              type: 'fill',
              source: parentLocationIdentifier,
              layout: {},
              paint: {
                'fill-color':
                  ['match',
                    ['get', 'geographicLevel'], 'structure',
                    ['get', 'statusColor'],
                    ['get', 'evaluatedColor']
                  ]
                ,
                'fill-opacity': opacity.current
              }
            },
            'label-layer'
          );

          currentMap.addLayer(
            {
              id: parentLocationIdentifier + '-border',
              type: 'line',
              source: parentLocationIdentifier,
              layout: {},
              paint: {
                'line-color': 'black',
                'line-width': 4
              },
              filter: ['!=', 'geographicLevel', 'structure']
            },
            'label-layer'
          );

          currentMap.on('mouseover', parentLocationIdentifier + '-label', e => {
            const feature = currentMap.queryRenderedFeatures(e.point)[0];
            const properties = feature.properties;
            if (properties && !hoverPopup.current.isOpen() && !contextMenuPopup.current.isOpen()) {
              //mapbox strigifies objects inside properties, parsing columnDataMap back to object
              properties['columnDataMap'] = JSON.parse(properties['columnDataMap']);
              let htmlText = 'Data not parsed correctly.';
              const defaultColumnName = defaultColumn;//(data as any).defaultDisplayColumn;
              if (reportType === ReportType.MDA_LITE_COVERAGE && (defaultColumnName === 'SCH Treatment Coverage' || defaultColumnName === 'STH Treatment Coverage')) {

                let filteredAgeCoverage;
                if (defaultColumnName === 'SCH Treatment Coverage') {
                  filteredAgeCoverage = AGE_COVERAGE_LEGEND.filter(e => e.key !== 'Male 1-4 years' && e.key !== 'Female 1-4 years');
                } else {
                  filteredAgeCoverage = AGE_COVERAGE_LEGEND
                }

                let ageCoverageLegend = filteredAgeCoverage?.map(e => {
                  return (`<div className='p-2'><span className="my-3">${e.label}: ${properties['columnDataMap'][e.key].value}</span></div>`)
                }).join(" ");

                htmlText = `<h4 class='bg-success text-light text-center'>${properties['name']}</h4> ${ageCoverageLegend}`
              } else if (reportType === ReportType.ONCHOCERCIASIS_SURVEY && properties["reportLevel"]!=='Structure') {

                let onchoCoverageLegend = ONCHO_COVERAGE_LEGEND.map(e=>{
                  return (`<div className='p-2'><span className="my-3">${e.label}: ${properties['columnDataMap'][e.key]?.value}</span></div>`)
                }).join(" ");

                htmlText = `<h4 class='bg-success text-light text-center'>${properties['name']}</h4> ${onchoCoverageLegend}`
              } 
              else if (defaultColumnName) {
                htmlText = `<h4 class='bg-success text-light text-center'>${properties['name']}</h4>
            <div class='p-2'>
              ${`<small class='my-3'>${defaultColumnName ?? "Data not parsed correctly"}: ${properties['columnDataMap'][defaultColumnName] !== undefined
                    ? properties['columnDataMap'][defaultColumnName].isPercentage
                      ? properties['columnDataMap'][defaultColumnName].value.toFixed(3) + '%'
                      : properties['columnDataMap'][defaultColumnName].value
                    : ''
                  }</small>`}
            </div>`;

              } else if (properties['businessStatus']) {
                htmlText = `<h4 class='bg-success text-light text-center'>${properties['name']}</h4>
            <div class='p-2'>
              ${`<small class='my-3'>Business Status: ${(reportType === ReportType.IRS_FULL_COVERAGE ||
                    reportType === ReportType.IRS_LITE_COVERAGE ||
                    reportType === ReportType.IRS_LITE_COVERAGE_OPERATIONAL_AREA_LEVEL) &&
                    properties['businessStatus'] === 'Complete'
                    ? 'Sprayed'
                    : properties['businessStatus']
                  }
              </small>`}
            </div>`;
              }
              currentMap.getCanvas().style.cursor = 'pointer';
              hoverPopup.current.setLngLat(e.lngLat).setHTML(htmlText).addTo(currentMap);
            }
          });

          currentMap.on('mouseleave', parentLocationIdentifier + '-label', () => {
            currentMap.getCanvas().style.cursor = '';
            hoverPopup.current.remove();
          });

          const featureSet: Feature<Point, Properties>[] = [];
          const bounds = bbox(data) as any;
          //create label for each of the locations
          //create a group of locations so we can fit them all in viewport
          data.features.forEach((element: Feature<Polygon | MultiPolygon | Point, ReportLocationProperties>) => {
            // if its a point structure type createa a circle layer to present it on the map
            const addLayer = (id: string, statusColor: string) => {
              currentMap.addLayer({
                id: id + 'point',
                source: id,
                type: 'circle',
                minzoom: 15.5,
                paint: {
                  'circle-color': statusColor ?? 'black',
                  'circle-radius': 8
                }
              });
            };
            if (element.geometry.type === 'Point') {
              if (currentMap.getSource(element.properties.id) === undefined) {
                currentMap.addSource(element.properties.id, {
                  type: 'geojson',
                  data: element,
                  tolerance: 2
                });
                addLayer(element.properties.id, element.properties.statusColor ?? 'black');
              } else {
                currentMap.removeLayer(element.properties.id + 'point');
                addLayer(element.properties.id, element.properties.statusColor ?? 'black');
              }
            }
            const centerLabel = getPolygonCenter(element);
            centerLabel.center.properties = { ...element.properties };
            featureSet.push(centerLabel.center);
          });
          currentMap.fitBounds(bounds, {
            easing: e => {
              //this is an event which is fired at the end of the fit bounds
              if (e === 1) {
                createChildLocationLabel(currentMap, featureSet, parentLocationIdentifier, true);
                disableMapInteractions(currentMap, false);
              }
              return e;
            },
            padding: 20,
            duration: 600
          });
          // Grab the prefers reduced media query.
          const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
          // Check if the media query matches or is not available.
          if (!mediaQuery || mediaQuery.matches) {
            createChildLocationLabel(currentMap, featureSet, parentLocationIdentifier, true);
            disableMapInteractions(currentMap, false);
          }
        } else if (data.features.length) {
          // if path is empty load main location and clear the map
          if (path.length) {
            //reload existing location or if breadcrumb event to delete all child locations and reload
            if (path[path.length - 1] === parentLocationIdentifier) {
              if (currentMap.getLayer(parentLocationIdentifier + '-fill')) {
                currentMap.removeLayer(parentLocationIdentifier + '-fill');
              }
              currentMap.removeLayer(parentLocationIdentifier + '-border');
              if (currentMap.getLayer(parentLocationIdentifier + '-structure'))
                currentMap.removeLayer(parentLocationIdentifier + '-structure');
              if (currentMap.getLayer(parentLocationIdentifier + '-label')) {
                currentMap.removeLayer(parentLocationIdentifier + '-label');
                currentMap.removeSource(parentLocationIdentifier + '-label');
              }
              currentMap.removeSource(parentLocationIdentifier);
              loadLocationSet(currentMap, data, parentLocationIdentifier, path);
            } else {
              path.forEach(el => {
                if (currentMap.getLayer(el + '-fill')) {
                  currentMap.removeLayer(el + '-fill');
                }
                currentMap.removeLayer(el + '-border');
                if (currentMap.getSource(el + '-label')) {
                  currentMap.removeLayer(el + '-label');
                  currentMap.removeSource(el + '-label');
                }
                if (currentMap.getLayer(el + '-structure')) currentMap.removeLayer(el + '-structure');
                if (currentMap.isSourceLoaded(el)){
                  currentMap.removeSource(el);
                }
                 
              });
              currentMap.fitBounds(bbox(data) as any);
            }
          }
        }
      },
      [reportType, defaultColumn]
    );

    useEffect(() => {
      if (map.current && featureSet) {
        const mapInstance = map.current;
        //check if map is loaded completly
        if (mapInstance.getLayer('label-layer')) {
          loadLocationSet(mapInstance, featureSet[0], featureSet[1], featureSet[2]);
        } else {
          mapInstance.once('load', () => {
            loadLocationSet(mapInstance, featureSet[0], featureSet[1], featureSet[2]);
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
            if (
              map!.current!.getLayer(el.layer.id) &&
              el.layer.id.includes('-fill') &&
              !el.layer.id.includes('-structure')
            ) {
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
                {reportType === ReportType.MDA_FULL_COVERAGE || reportType === ReportType.MDA_LITE_COVERAGE
                  ? Object.keys(MdaStructureStatus).map((el, index) => (
                    <li key={index}>
                      <span
                        className="sidebar-legend"
                        style={{ backgroundColor: MAP_MDA_STRUCTURE_LEGEND_COLORS[index] }}
                      ></span>
                      {el}
                    </li>
                  ))
                  : Object.keys(IrsStructureStatus).map((el, index) => (
                    <li key={index}>
                      <span
                        className="sidebar-legend"
                        style={{ backgroundColor: MAP_IRS_STRUCTURE_LEGEND_COLORS[index] }}
                      ></span>
                      {el}
                    </li>
                  ))}
              </ul>
            </PopoverComponent>
          )}
          <div className="mt-2">
            <label id="range-input-label" className="text-white">
              {t('label.layerOpacity')}
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
            ref={ref}
            id="clear-map-button"
            className="float-end"
            style={{ boxShadow: '4px 4px 3px rgba(24, 24, 24, 0.8)' }}
            onClick={() => {
              if (map.current) {
                map.current.remove();
                map.current = undefined;
                clearMap();
              }
            }}
          >
            {t('buttons.clearMap')}
          </Button>
        </div>
        <div ref={mapContainer} className="map-container" />
      </Container>
    );
  }
);


export default React.memo(MapViewDetail);
