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
  // attach ancestry to properties, as Mapbox strips down the features object to geometry and properties
  const updatedArray = polygonArray.map((obj: any) => ({
    ...obj, 
    properties: {
      ...obj.properties,
      ancestry: obj.ancestry
    }
  }));
  if (!mapRef.getSource(SourceName)) {
    mapRef.addSource(SourceName, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: updatedArray
      }
    });
  } else {
    mapRef.getSource(SourceName).setData({
      type: 'FeatureCollection',
      features: updatedArray
    });
  }
};

export const AddLayer = (mapRef: any, layerName: string, sourceName: string, paintConfig: object) => {
  if (!mapRef.getLayer(`${layerName}-layer`)) {
    mapRef.addLayer({
      id: `${layerName}-layer`,
      type: 'fill',
      source: `${sourceName}-source`,
      paint: paintConfig
    });
  }
};

export const findAllIdentifiersToSend = (
  searchedId: string,
  locationObj: any,
  selectedLocationForCampaign: Set<string> = new Set([])
) => {
  selectedLocationForCampaign.add(searchedId);

  const findClickedObjectByIdentifier = (searchedId: string, locObj: any): any => {
    if (locObj.identifier === searchedId) {
      selectedLocationForCampaign.add(locObj.identifier);
      return locObj;
    }

    for (let i = 0; i < locObj.children.length; i++) {
      const result = findClickedObjectByIdentifier(searchedId, locObj.children[i]);
      if (result) {
        return result;
      }
    }
  };

  function aStarSearch(root: any, target: any) {
    const openSet = []; // Priority queue for A* (nodes to explore)
    const cameFrom = new Map(); // Tracks paths
    const gScore = new Map(); // Cost from start to this node

    // Initialize
    openSet.push({ node: root, path: [root.identifier] });
    gScore.set(root.identifier, 0);

    while (openSet.length > 0) {
      // Sort openSet by gScore (or use a priority queue implementation)
      openSet.sort((a, b) => gScore.get(a.node.identifier) - gScore.get(b.node.identifier));
      const current: any = openSet.shift(); // Node with the lowest score
      const { node, path } = current;

      if (node.identifier === target) {
        return path; // Found the target, return the path
      }

      // Explore children
      for (const child of node.children || []) {
        const tentativeGScore = gScore.get(node.identifier) + 1;

        if (!gScore.has(child.identifier) || tentativeGScore < gScore.get(child.identifier)) {
          // Update path and scores
          cameFrom.set(child.identifier, node.identifier);
          gScore.set(child.identifier, tentativeGScore);

          // Add to openSet if not already present
          if (!openSet.some(entry => entry.node.identifier === child.identifier)) {
            openSet.push({ node: child, path: [...path, child.identifier] });
          }
        }
      }
    }

    return null; // No path found
  }

  const getChildrenIdentifiers = (locObj: any) => {
    selectedLocationForCampaign.add(locObj?.identifier);
    locObj?.children.forEach((child: any) => {
      if (child) {
        selectedLocationForCampaign.add(child.identifier);
        getChildrenIdentifiers(child);
      }
    });
  };

  const getParentIdentifiers = (searchedId: string) => {
    const result = aStarSearch(locationObj, searchedId);
    if (result) {
      result.forEach((id: string) => {
        selectedLocationForCampaign.add(id);
      });
    }
  };

  const clickedLevel = findClickedObjectByIdentifier(searchedId, locationObj);
  getChildrenIdentifiers(clickedLevel);
  getParentIdentifiers(searchedId);
};
