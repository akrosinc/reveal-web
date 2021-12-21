import React, { useEffect, useState, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "./index.css";

mapboxgl.accessToken = process.env.REACT_APP_GISIDA_MAPBOX_TOKEN ?? "";

const Plans = () => {
  const mapContainer = useRef<any>();
  const map = useRef<any>();
  const [lng, setLng] = useState(19.85);
  const [lat, setLat] = useState(45.25);
  const [zoom, setZoom] = useState(11);

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
    if (map.current !== undefined) {
      map.current.on("move", () => {
        setLng(map.current.getCenter().lng.toFixed(4));
        setLat(map.current.getCenter().lat.toFixed(4));
        setZoom(map.current.getZoom().toFixed(2));
      });
      map.current.on("load", () => {
        //set add layers and paint te poligons on map load
      })
    }
  });
  return (
    <div>
      <div className="sidebar">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
};

export default Plans;
