import { Color } from 'react-color-palette';
import { lineParameters } from './SimulationMapViewConstants';
import {
  LineWidth,
  ProcessedLayer,
  SelectedUserDefinedLayer,
  SingleLayer,
  UserDefinedLayer
} from './SimulationMapViewModels';
import { Feature, MultiPolygon, Point, Polygon } from '@turf/turf';
import { hex, hsv } from 'color-convert';
import { RevealFeature } from '../../providers/types';

export const getTransparencyValue = (value: LineWidth[], selectedValue: SelectedUserDefinedLayer | undefined) => {
  let transparency = 10;
  if (value) {
    const filterElement = value.filter(userDefinedLayer => userDefinedLayer.layerName === selectedValue?.key)[0];
    if (filterElement && filterElement.transparency !== undefined && filterElement.transparency !== null) {
      transparency = filterElement.transparency;
    }
  }
  return transparency;
};

export const getLineWidthValue = (value: LineWidth[], selectedValue?: SelectedUserDefinedLayer) => {
  let lineWidth = 1;
  if (value) {
    const filterElement = value.filter(userDefinedLayer => userDefinedLayer.layerName === selectedValue?.key)[0];
    if (filterElement && filterElement.lineWidth !== undefined && filterElement.lineWidth !== null) {
      lineWidth = filterElement.lineWidth;
    }
  }
  return lineWidth;
};

export const getLineParameters = (level: string) => {
  let newlevel = level
    .split('-')
    .filter((item, index) => index > 0)
    .join('-');
  if (lineParameters[newlevel]) {
    return lineParameters[newlevel];
  } else {
    return { col: 'black', num: 1, offset: 0 };
  }
};

export const getProcessedUserDefinedLayers = (
  userDefinedLayers: UserDefinedLayer[],
  defColor: Color
): ProcessedLayer[] => {
  const layerMap = userDefinedLayers.reduce((acc, layer) => {
    // Ensure layerName is defined
    if (!layer.layerName) {
      console.warn('Layer is missing layerName:', layer);
      return acc; // Skip invalid layers
    }

    // Ensure the entry for the `layerName` exists in `acc`
    if (!acc[layer.layerName]) {
      acc[layer.layerName] = {
        key: layer.layerName,
        list: [],
        color: layer.col || defColor
      };
    }

    // Add the current layer to the corresponding group
    acc[layer.layerName]?.list?.push(layer);
    return acc;
  }, {} as Record<string, ProcessedLayer>);

  return Object.values(layerMap);
};

export const updateFeaturesWithTagStatsAndColorAndTransparency = (
  //   feature: RevealFeature | Feature<Point | MultiPolygon | Polygon>,
  feature: RevealFeature | Feature<Point | MultiPolygon | Polygon>,
  tagStats: any,
  tag: string | undefined,
  percentageField: string,
  valueField: string,
  tagField: string,
  colorField: string,
  color: Color
) => {
  if (feature) {
    feature.properties?.metadata?.forEach((element: any) => {
      if (feature?.properties) {
        if (tag) {
          if (element.type === tag && tagStats.max && tagStats.max[tag]) {
            feature.properties[tagField] = element.type;
            delete feature.properties['reachedMax'];
            if (!(element.value >= 0x10000000000000000 || element.value < -0x10000000000000000)) {
              feature.properties[valueField] = element.value;
            } else {
              feature.properties['reachedMax'] = 'true';
            }

            let percentage: any;
            if (element.value < 0) {
              percentage = (-1 * element.value) / (-1 * tagStats.min[tag]);
            } else {
              percentage = element.value / tagStats.max[tag];
            }

            feature.properties[percentageField] = percentage;

            if (!(tagStats.min[tag] >= 0x10000000000000000 || tagStats.min[tag] < -0x10000000000000000)) {
              feature.properties.selectedTagValueMin = tagStats.min[tag];
            }

            if (!(tagStats.max[tag] >= 0x10000000000000000 || tagStats.max[tag] < -0x10000000000000000)) {
              feature.properties.selectedTagValueMax = tagStats.min[tag];
            }

            let [h, s, v] = hex.hsv(color.hex);
            const colorField1 = s * feature.properties[percentageField];

            let hexVal = hsv.hex([h, colorField1, v]);

            feature.properties[colorField] = '#'.concat(hexVal);
          }
        } else {
          delete feature.properties[valueField];
          delete feature.properties[tagField];
          delete feature.properties[percentageField];
          delete feature.properties.selectedTagValueMin;
          delete feature.properties.selectedTagValueMax;
          delete feature.properties[colorField];
        }
      }
    });
    if (
      !feature.properties?.metadata?.some((element: any) => {
        if (feature?.properties) {
          return element.type === tag;
        }
        return false;
      })
    ) {
      if (feature?.properties) {
        delete feature.properties[valueField];
        delete feature.properties[tagField];
        delete feature.properties[percentageField];
        delete feature.properties.selectedTagValueMin;
        delete feature.properties.selectedTagValueMax;
        feature['properties'][tagField] = tag;
      }
    }
  }
  return feature;
};

export const handleOpenSettingsMenu = (
  layerObj: ProcessedLayer,
  setShowUserDefinedSettingsPanel: Function,
  showUserDefinedSettingsPanel: Boolean,
  selectedUserDefinedLayer: UserDefinedLayer | undefined,
  setSelectedUserDefinedLayer: Function,
  setColor: Function,
  initialLineColor: Color
) => {
  setShowUserDefinedSettingsPanel(!showUserDefinedSettingsPanel || selectedUserDefinedLayer?.key !== layerObj.key);
  if (selectedUserDefinedLayer?.key !== layerObj.key) {
    setSelectedUserDefinedLayer({
      key: layerObj.key,
      col: layerObj.color,
      lineColor: selectedUserDefinedLayer ? selectedUserDefinedLayer.lineColor : initialLineColor
    });
    setColor(layerObj.color);
  }
};

export const updateLayerActiveState = (
  layers: SingleLayer[],
  targetLayer: string,
  isActive: boolean
): SingleLayer[] => {
  return layers.map(layer => (layer.layer === targetLayer ? { ...layer, active: isActive } : layer));
};

export const updateSelectedTag = <T extends { layerName: string; selectedTag?: string }>(
  items: T[],
  layerName: string,
  selectedTag: string
): T[] => {
  return items.map(item => (item.layerName === layerName ? { ...item, selectedTag } : item));
};

export const updateLayerProperty = (
  layers: UserDefinedLayer[],
  selectedLayerKey: string,
  property: string,
  value: any
): UserDefinedLayer[] => {
  return layers.map(layer => (layer.layerName === selectedLayerKey ? { ...layer, [property]: value } : layer));
};

export const updateSelectedLayerProperty = (
  // Utility function to update the selected layer's property dynamically
  selectedLayer: UserDefinedLayer | undefined,
  property: string,
  value: any
): UserDefinedLayer | undefined => {
  if (selectedLayer) {
    return { ...selectedLayer, [property]: value };
  }
  return undefined;
};
