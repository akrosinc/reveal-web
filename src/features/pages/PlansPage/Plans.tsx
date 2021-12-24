import React, { useEffect, useState, useRef } from "react";
import mapboxgl, { Map } from "mapbox-gl";
import "./index.css";
import { Button, Col, Container, Modal, Row } from "react-bootstrap";
import { buildingData } from "./jsonMocks";

mapboxgl.accessToken = process.env.REACT_APP_GISIDA_MAPBOX_TOKEN ?? "";
const legend = [
  "Complete",
  "SPAQ Complete",
  "SMC Complete",
  "Not Dispensed",
  "Family Registered",
  "Ineligible",
  "Not Eligible",
  "Not Visited",
  "No Tasks",
];
const legendColors = [
  "green",
  "orange",
  "darkorange",
  "orange",
  "teal",
  "gray",
  "black",
  "yellow",
  "gray",
];

const Plans = () => {
  const mapContainer = useRef<any>();
  const map = useRef<Map>();
  const [lng, setLng] = useState(24.651775360107422);
  const [lat, setLat] = useState(-34.16764168475747);
  const [zoom, setZoom] = useState(16);
  const [show, setShow] = useState(false);
  const [buildingId, setBuildingId] = useState("");

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
          setLng(Math.round(map.current.getCenter().lng * 100) / 100);
          setLat(Math.round(map.current.getCenter().lat * 100) / 100);
          setZoom(Math.round(map.current.getZoom() * 100) / 100);
        }
      });
    }
  });

  const loadBuildings = () => {
    buildingData.forEach((jsonData, index) => {
      createBuilding(jsonData, "building." + index, "#fff000");
    });
  };

  const createBuilding = (
    coordinates: number[][],
    buildingName: string,
    status: string
  ) => {
    if (map?.current?.getSource(buildingName) !== undefined) {
      map.current.removeSource(buildingName);
      map.current.removeLayer(buildingName + "fill");
    } else {
      if (map.current !== undefined) {
        map.current.addSource(buildingName, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "Polygon",
              // These coordinates outline Maine.
              coordinates: [coordinates],
            },
          },
        });
        map.current.addLayer({
          id: buildingName + "fill",
          type: "fill",
          source: buildingName, // reference the data source
          layout: {},
          paint: {
            "fill-color": status, // blue color fill
            "fill-opacity": 0.5,
          },
        });

        // When a click event occurs on a feature in the states layer,
        // open a popup at the location of the click, with description
        // HTML from the click event's properties.
        map.current.on("click", buildingName + "fill", (e) => {
          console.log(e.features);
          const feature = e.features !== undefined ? e.features[0].source : "";
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(
              e.features !== undefined
                ? `<h4>Structure details</h4><p>Identifier: ${feature}<br/>Status: Not visited</p><button class="btn btn-primary mx-auto my-2 d-block" id="view-full">Action</button>`
                : "Building id not found"
            )
            .setMaxWidth("400px")
            .addTo(map!.current!);
            const handler = () => {
              setShow(true);
              setBuildingId(feature);
            };
            document.getElementById('view-full')?.addEventListener('click', handler);

            map?.current?.flyTo({
              center: e.lngLat,
              zoom: 17
            });
        });
      }
    }
  };

 const createRegion = (
    coordinates: number[][],
    regionName: string,
    borderColor: string
  ) => {
    if (map?.current?.getSource(regionName) !== undefined) {
      
    } else {
      map?.current?.addSource(regionName, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Polygon",
            // These coordinates outline Maine.
            coordinates: [coordinates],
          },
        },
      });
      // Add a black outline around the polygon.
      map?.current?.addLayer({
        id: regionName + "outline",
        type: "line",
        source: regionName,
        layout: {},
        paint: {
          "line-color": borderColor,
          "line-width": 3,
        },
      });

      map?.current?.flyTo({
        center: [24.65, -34.17],
        zoom: 16
      });
    }
  };

  return (
    <Container fluid>
      <Row className="mb-4 mt-3">
        <Col md={9} className="px-0">
          <div className="sidebar">
            Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
          </div>
          <div ref={mapContainer} className="map-container" />
        </Col>
        <Col md={3} className="bg-dark text-light">
          <h4 className="text-light text-center pt-3">Intervention Demo</h4>
          <hr className="bg-light" />
          <div className="p-3">
            <Button className="m-2 w-100" onClick={() => loadBuildings()}>
              Create building
            </Button>
            <Button
              className="m-2 w-100"
              onClick={() =>
                createRegion(
                  [
                    [24.64930772781372, -34.17155635814535],
                    [24.653502702713013, -34.17155635814535],
                    [24.653502702713013, -34.16943482299446],
                    [24.64930772781372, -34.16943482299446],
                    [24.64930772781372, -34.17155635814535],
                  ],
                  "fds1-saxv-12sa",
                  "#fff000"
                )
              }
            >
              Create region
            </Button>
            <hr />
            <p className="lead">Legend</p>
            <ul style={{ listStyle: "none" }}>
              {legend.map((el, index) => {
                return (
                  <li key={index}>
                    <span
                      className="sidebar-legend"
                      style={{ backgroundColor: legendColors[index] }}
                    />
                    {el}
                  </li>
                );
              })}
            </ul>
          </div>
        </Col>
      </Row>
      <Modal show={show}>
              <Modal.Header>
                Custom action modal
              </Modal.Header>
              <Modal.Body>
                You have selected building with id: {buildingId}
                <br />
                Here we can do all actions with this building.
              </Modal.Body>
              <Modal.Footer>
                <Button onClick={() => setShow(false)}>Close</Button>
              </Modal.Footer>
            </Modal>
    </Container>
  );
};

export default Plans;
