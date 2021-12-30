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
      createBuilding(
        jsonData,
        "building." + index,
        "#000000".replace(/0/g, function () {
          return (~~(Math.random() * 16)).toString(16);
        })
      );
    });
  };

  const createBuilding = (
    coordinates: number[][],
    buildingName: string,
    status: string
  ) => {
    if (map?.current?.getSource(buildingName) !== undefined) {
      map.current.removeLayer(buildingName + "fill");
      map.current.removeSource(buildingName);
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
                ? `<h4>Structure details</h4><p>Identifier: ${feature}
                <br/>Status: Not visited</p>
                <button class="btn btn-primary mx-auto my-2 d-block" id="view-full">Action</button>`
                : "Building id not found"
            )
            .setMaxWidth("400px")
            .addTo(map!.current!);
          const handler = () => {
            setShow(true);
            setBuildingId(feature);
          };
          document
            .getElementById("view-full")
            ?.addEventListener("click", handler);

          map?.current?.flyTo({
            center: e.lngLat,
            zoom: 17,
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
      map?.current?.removeLayer(regionName + "outline");
      map?.current?.removeSource(regionName);
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
        zoom: 16,
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
                    [24.649742245674133, -34.170770774986714],
                    [24.64981734752655, -34.17131668948224],
                    [24.652150869369503, -34.171432085590176],
                    [24.65321838855743, -34.1715252900237],
                    [24.653304219245907, -34.171010445200054],
                    [24.6530681848526, -34.17087729516556],
                    [24.652960896492004, -34.17060211776195],
                    [24.6530681848526, -34.17048672051923],
                    [24.652896523475643, -34.17040683002801],
                    [24.652644395828244, -34.17014496622104],
                    [24.652633666992188, -34.16993192388043],
                    [24.652622938156128, -34.16969225060447],
                    [24.652563929557797, -34.16955909849042],
                    [24.65223670005798, -34.16951027599597],
                    [24.651764631271362, -34.169554660083],
                    [24.651233553886414, -34.16968781220406],
                    [24.65081512928009, -34.1698431560798],
                    [24.650246500968933, -34.16997186936026],
                    [24.649876356124878, -34.170060637025514],
                    [24.649538397789, -34.170207103469096],
                    [24.649624228477478, -34.1706243095213],
                    [24.649742245674133, -34.170770774986714],
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
        <Modal.Header>Custom action modal</Modal.Header>
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
