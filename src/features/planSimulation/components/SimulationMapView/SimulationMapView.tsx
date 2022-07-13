import { LngLatBounds, Map, Popup } from 'mapbox-gl';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Container, Form } from 'react-bootstrap';
import { MAPBOX_STYLE_SATELLITE, MAPBOX_STYLE_SATELLITE_STREETS, MAPBOX_STYLE_STREETS } from '../../../../constants';
import { fitCollectionToBounds, initMap } from '../../../../utils';
import { PlanningLocationResponse } from '../../providers/types';

interface Props {
  fullScreenHandler: () => void;
  fullScreen: boolean;
  mapData: PlanningLocationResponse | undefined;
  toLocation: LngLatBounds | undefined;
  openModalHandler: (id: string) => void;
}

const SimulationMapView = ({ fullScreenHandler, fullScreen, mapData, toLocation, openModalHandler }: Props) => {
  const mapContainer = useRef<any>();
  const map = useRef<Map>();
  const [lng, setLng] = useState(28.33);
  const [lat, setLat] = useState(-15.44);
  const [zoom, setZoom] = useState(10);
  const hoverPopup = useRef<Popup>(new Popup({ closeOnClick: false, closeButton: false, offset: 20 }));

  useEffect(() => {
    if (map.current) return; // initialize map only once
    const mapInstance = initMap(mapContainer, [lng, lat], zoom, 'bottom-left', MAPBOX_STYLE_STREETS);
    clickHandler(mapInstance);
    map.current = mapInstance;
  });

  const clickHandler = (mapInstance: Map) => {
    mapInstance.on('click', e => {
      const features = mapInstance.queryRenderedFeatures(e.point);
      if (features.length) {
        //convert to location properties feature
        const feature = features[0];
        if (feature && feature.properties && (feature.source === 'main' || feature.source === 'main-label')) {
          openModalHandler(feature.properties['identifier']);
        }
      }
    });
  };

  useEffect(() => {
    if (toLocation && map && map.current) map.current?.fitBounds(toLocation);
  }, [toLocation]);

  const loadLocation = useCallback((mapInstance: Map, mapData?: PlanningLocationResponse) => {
    if (mapData && mapData.features.length) {
      mapInstance.addSource('parent', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: mapData.parents ?? [] },
        tolerance: 1.5
      });
      mapInstance.addLayer(
        {
          id: 'parent-border',
          type: 'line',
          source: 'parent',
          paint: {
            'line-color': 'black',
            'line-width': 4
          }
        },
        'label-layer'
      );
      mapInstance.addSource('main', {
        type: 'geojson',
        data: mapData,
        tolerance: 0.75
      });
      mapInstance.addLayer(
        {
          id: 'main-fill',
          type: 'fill',
          source: 'main',
          paint: {
            "fill-color": 'yellow',
            "fill-opacity": 0.4
          }
        },
        'label-layer'
      );
      mapInstance.addLayer(
        {
          id: 'main-border',
          type: 'line',
          source: 'main',
          paint: {
            'line-color': 'black',
            'line-width': 4
          }
        },
        'label-layer'
      );
      mapInstance.on('mouseover', 'main-label', e => {
        const feature = mapInstance.queryRenderedFeatures(e.point)[0];
        const properties = feature.properties;
        let htmlText = '<p class="text-danger">Data not parsed correctly.</p>';
        if (properties && properties['persons']) {
          const personList: any[] = JSON.parse(properties['persons']);
          htmlText = `<p class="text-success">Persons found: ${personList.length}</p>`;
        }
        mapInstance.getCanvas().style.cursor = 'pointer';
        hoverPopup.current.setLngLat(e.lngLat).setHTML(htmlText).addTo(mapInstance);
      });
      mapInstance.on('mouseleave', 'main-label', () => {
        mapInstance.getCanvas().style.cursor = '';
        hoverPopup.current.remove();
      });
      fitCollectionToBounds(mapInstance, mapData, 'main');
    } else {
      mapInstance.flyTo({
        zoom: 6
      });
    }
  }, []);

  useEffect(() => {
    const mapInstance = map.current;
    if (mapInstance) {
      //delete old location
      if (mapInstance.getSource('main')) {
        mapInstance.removeLayer('main-border');
        if (mapInstance.getSource('main-label')) {
          mapInstance.removeLayer('main-label');
          mapInstance.removeSource('main-label');
        }
        mapInstance.removeSource('main');
      }
      if (mapInstance.getSource('parent')) {
        mapInstance.removeLayer('parent-border');
        mapInstance.removeSource('parent');
      }
      loadLocation(mapInstance, mapData);
    }
  }, [mapData, loadLocation]);

  useEffect(() => {
    if (map.current !== undefined && map !== undefined) {
      map.current.on('move', () => {
        if (map !== undefined && map.current !== undefined) {
          setLng(Number(map.current.getCenter().lng.toPrecision(4)));
          setLat(Number(map.current.getCenter().lat.toPrecision(4)));
          setZoom(Number(map.current.getZoom().toPrecision(3)));
        }
      });
    }
  });

  useEffect(() => {
    return () => {
      //Clear map and all WebGLContext from browser memory
      map.current?.remove();
      map.current = undefined;
      //cache delete for possible performance improvements on larger datasets
      caches.keys().then(keys => {
        keys.forEach(key => caches.delete(key));
      });
    };
  }, []);

  const setMapStyle = (style: string) => {
    //store current position of the map before reloading to new style
    const currentPosition: [number, number] | undefined = map.current
      ? [map.current.getCenter().lng, map.current.getCenter().lat]
      : undefined;
    map.current?.remove();
    map.current = undefined;
    const mapboxInstance = initMap(mapContainer, currentPosition ?? [lng, lat], zoom, 'bottom-left', style);
    //set zoom to another value to trigger a rerender
    setZoom(Number((zoom + Math.random()).toPrecision(2)));
    clickHandler(mapboxInstance);
    mapboxInstance.once('load', () => loadLocation(mapboxInstance, mapData));
    map.current = mapboxInstance;
  };

  return (
    <Container fluid style={{ position: 'relative' }} className="mx-0 px-0">
      <div className="sidebar text-dark bg-light p-2 rounded">
        <p className="lead mb-1">Layer style</p>
        <Form.Select onChange={e => setMapStyle(e.target.value)}>
          <option value={MAPBOX_STYLE_STREETS}>Streets</option>
          <option value={MAPBOX_STYLE_SATELLITE_STREETS}>Streets Satellite</option>
          <option value={MAPBOX_STYLE_SATELLITE}>Satellite</option>
        </Form.Select>
      </div>
      <div className="clearButton">
        <p className="small text-dark bg-white p-2 rounded">
          Lat: {lat} Lng: {lng} Zoom: {zoom}
        </p>
        <Button
          onClick={() => {
            fullScreenHandler();
            setTimeout(() => {
              map.current?.resize();
              document.getElementById('mapRow')?.scrollIntoView({ behavior: 'smooth' });
            }, 0);
          }}
          className="mb-2 float-end"
        >
          Full Screen
        </Button>
      </div>
      <div id="mapContainer" ref={mapContainer} style={{ height: fullScreen ? '95vh' : '650px', width: '100%' }} />
    </Container>
  );
};

export default SimulationMapView;
