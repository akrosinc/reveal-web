export const DrawPolygonsFeature = (mapRef: any, selectedLoaction: any, featureName: any) => {
  const SourceName = `${featureName}-source`;
  if (!mapRef.getSource(SourceName)) {
    mapRef.addSource(SourceName, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: selectedLoaction.geometry,
        properties: selectedLoaction
      }
    });
  } else {
    mapRef.getSource(SourceName).setData({
      type: 'Feature',
      geometry: selectedLoaction.geometry,
      properties: selectedLoaction
    });
  }
};

export const DrawPolygonsFeatureCollection = (mapRef: any, polygonArray: any, featureName: any) => {
  const SourceName = `${featureName}-source`;
  if (!mapRef.getSource(SourceName)) {
    mapRef.addSource(SourceName, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: polygonArray
      }
    });
  } else {
    mapRef.getSource(SourceName).setData({
      type: 'FeatureCollection',
      features: polygonArray
    });
  }
};
