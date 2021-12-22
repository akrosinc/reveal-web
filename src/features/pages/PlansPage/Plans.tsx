import React, { useEffect, useState, useRef } from "react";
import mapboxgl, { Map } from "mapbox-gl";
import "./index.css";
import { toast } from "react-toastify";
import { Button, Col, Container, Row } from "react-bootstrap";

mapboxgl.accessToken = process.env.REACT_APP_GISIDA_MAPBOX_TOKEN ?? "";

const Plans = () => {
  const mapContainer = useRef<any>();
  const map = useRef<Map>();
  const [lng, setLng] = useState(-70.1669);
  const [lat, setLat] = useState(45.4896);
  const [zoom, setZoom] = useState(5);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-v9",
      center: [lng, lat],
      zoom: zoom,
    });
  });

  useEffect(() => {
    if (map.current !== undefined && map !== undefined) {
      map.current.on("move", () => {
        if (map !== undefined && map.current !== undefined) {
          setLng(map.current.getCenter().lng);
          setLat(map.current.getCenter().lat);
          setZoom(map.current.getZoom());
        }
      });
      map.current.on("load", () => {
        map?.current?.on("click", "maine",(e) => {
          console.log(e)
          new mapboxgl.Marker()
            .setLngLat([e.lngLat.lng, e.lngLat.lat])
            .addTo(map!.current!);
          new mapboxgl.Popup()
            .setLngLat([e.lngLat.lng, e.lngLat.lat])
            .setHTML(e.lngLat.toArray().toString())
            .addTo(map!.current!);
          toast("clicked on lat: " + e.lngLat.lat + " lng: " + e.lngLat.lng, {
            position: "top-right"
          });
        });
      });
    }
  });

  const clickHandler = () => {
    if (map.current !== undefined) {
      if (map.current.getSource("maine") !== undefined) {
        map.current.removeLayer("maine");
        map.current.removeLayer("outline");
        map.current.removeSource("maine");
      } else {
        map.current.addSource("maine", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "Polygon",
              // These coordinates outline Maine.
              coordinates: [
                [
                  [-67.13734, 45.13745],
                  [-66.96466, 44.8097],
                  [-68.03252, 44.3252],
                  [-69.06, 43.98],
                  [-70.11617, 43.68405],
                  [-70.64573, 43.09008],
                  [-70.75102, 43.08003],
                  [-70.79761, 43.21973],
                  [-70.98176, 43.36789],
                  [-70.94416, 43.46633],
                  [-71.08482, 45.30524],
                  [-70.66002, 45.46022],
                  [-70.30495, 45.91479],
                  [-70.00014, 46.69317],
                  [-69.23708, 47.44777],
                  [-68.90478, 47.18479],
                  [-68.2343, 47.35462],
                  [-67.79035, 47.06624],
                  [-67.79141, 45.70258],
                  [-67.13734, 45.13745],
                ],
              ],
            },
          },
        });
        // Add a new layer to visualize the polygon.
        map.current.addLayer({
          id: "maine",
          type: "fill",
          source: "maine", // reference the data source
          layout: {},
          paint: {
            "fill-color": "#0080ff", // blue color fill
            "fill-opacity": 0.5,
          },
        });
        // Add a black outline around the polygon.
        map.current.addLayer({
          id: "outline",
          type: "line",
          source: "maine",
          layout: {},
          paint: {
            "line-color": "#000",
            "line-width": 3,
          },
        });
      }
    }
  };

  const yellowHandler = () => {
    if (map.current !== undefined) {
      if (map.current.getSource("yellowPolygon") !== undefined) {
        map.current.removeLayer("outlineYellow");
        map.current.removeSource("yellowPolygon");
      } else {
        map.current.addSource("yellowPolygon", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "Polygon",
              // These coordinates outline yellowPolygon.
              coordinates: [
                [
                  [-67.13734, 45.13745],
                  [-66.96466, 44.8097],
                  [-68.03252, 44.3252],
                  [-69.06, 43.98],
                  [-70.11617, 43.68405],
                  [-70.64573, 43.09008],
                  [-70.75102, 43.08003],
                  [-70.79761, 43.21973],
                  [-70.98176, 43.36789],
                  [-70.94416, 43.46633],
                  [-71.08482, 45.30524],
                  [-70.66002, 45.46022],
                  [-70.30495, 45.91479],
                  [-70.00014, 46.69317],
                  [-69.23708, 47.44777],
                  [-68.90478, 47.18479],
                  [-68.2343, 47.35462],
                  [-67.79035, 47.06624],
                  [-67.79141, 45.70258],
                  [-67.13734, 45.13745],
                ],
              ],
            },
          },
        });
        // Add a black outline around the polygon.
        map.current.addLayer({
          id: "outlineYellow",
          type: "line",
          source: "yellowPolygon",
          layout: {},
          paint: {
            "line-color": "#FFFF00",
            "line-width": 3,
          },
        });
      }
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col md={9} className="px-0">
        <div className="sidebar">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <div ref={mapContainer} className="map-container" />
        </Col>
        <Col md={3} className="bg-dark">
          <h4 className="text-light text-center pt-3">Intervention Demo</h4>
          <hr className="bg-light"/>
          <div className="p-4">
          <Button className="m-2 w-100" onClick={yellowHandler}>
          Yellow border polygon
        </Button>
        <Button className="m-2 w-100" onClick={clickHandler}>
        Polygon with blue fill
        </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Plans;
