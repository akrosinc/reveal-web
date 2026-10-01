import React, { useState, useEffect } from 'react';
import { Button, Form, FormGroup, FormLabel, Modal, Spinner } from 'react-bootstrap';
import Select, { SingleValue } from 'react-select';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../store/hooks';
import { toast } from 'react-toastify';
import {
  getRasterTileUrl,
  COLOR_OPTIONS,
  ColorOption,
  RasterMapLayer,
  RasterExtent
} from '../../../../utils/rasterHelper';
import { getRasterMapLayers } from '../../api';

interface Props {
  show: boolean;
  closeHandler: () => void;
  instance?: any;
  onRasterAdded?: (rasterData: {
    raster: RasterOption;
    color?: ColorOption | null;
    opacity?: number;
  }) => void;
}

export interface RasterOption {
  value: string;
  rasterId: string;
  label: string;
  description?: string;
  sourceLayer?: string;
  fieldName?: string;
  rawLayer?: RasterMapLayer;
  extent?: RasterExtent;
  type?: string;
}

export const FALLBACK_RASTER_OPTIONS: RasterOption[] = [
  {
    value: 'landcover_mvt',
    rasterId: 'landcover',
    label: 'Landcover Classification (MVT)',
    description: 'Vector-raster classification tiles from /tiles/landcover/{z}/{x}/{y}.mvt',
    sourceLayer: 'landcover',
    fieldName: 'class'
  },
  {
    value: 'population_density',
    rasterId: 'population_density',
    label: 'Population Density (WorldPop MVT)',
    description: 'High-resolution population density from /tiles/population_density/{z}/{x}/{y}.mvt',
    sourceLayer: 'landcover',
    fieldName: 'class'
  },
  {
    value: 'building_footprints',
    rasterId: 'building_footprints',
    label: 'Building Footprints / Density (MVT)',
    description: 'Structures and settlement intensity from /tiles/building_footprints/{z}/{x}/{y}.mvt',
    sourceLayer: 'landcover',
    fieldName: 'class'
  },
  {
    value: 'elevation_dem',
    rasterId: 'elevation_dem',
    label: 'Digital Elevation Model (DEM MVT)',
    description: 'Terrain elevation and topography from /tiles/elevation_dem/{z}/{x}/{y}.mvt',
    sourceLayer: 'landcover',
    fieldName: 'class'
  },
  {
    value: 'ndvi_vegetation',
    rasterId: 'ndvi_vegetation',
    label: 'Vegetation Index (NDVI MVT)',
    description: 'Normalized difference vegetation index from /tiles/ndvi_vegetation/{z}/{x}/{y}.mvt',
    sourceLayer: 'landcover',
    fieldName: 'class'
  },
  {
    value: 'malaria_incidence',
    rasterId: 'malaria_incidence',
    label: 'Malaria Risk Surface (MVT)',
    description: 'Epidemiological risk surface from /tiles/malaria_incidence/{z}/{x}/{y}.mvt',
    sourceLayer: 'landcover',
    fieldName: 'class'
  },
  {
    value: 'precipitation',
    rasterId: 'precipitation',
    label: 'Annual Precipitation (MVT)',
    description: 'Rainfall distribution and climate data from /tiles/precipitation/{z}/{x}/{y}.mvt',
    sourceLayer: 'landcover',
    fieldName: 'class'
  },
  {
    value: 'travel_time_access',
    rasterId: 'travel_time_access',
    label: 'Travel Time to Health Facilities (MVT)',
    description: 'Physical accessibility modeling from /tiles/travel_time_access/{z}/{x}/{y}.mvt',
    sourceLayer: 'landcover',
    fieldName: 'class'
  }
];

export { COLOR_OPTIONS };

const AddRastersModal = ({ show, closeHandler, instance, onRasterAdded }: Props) => {
  const { t } = useTranslation();
  const isDarkMode = useAppSelector(state => state.darkMode.value);

  const [rasterOptions, setRasterOptions] = useState<RasterOption[]>([]);
  const [isLoadingRasters, setIsLoadingRasters] = useState<boolean>(false);
  const [selectedRaster, setSelectedRaster] = useState<SingleValue<RasterOption>>(null);
  const [selectedColor, setSelectedColor] = useState<SingleValue<ColorOption>>(COLOR_OPTIONS[0]);
  const [opacity, setOpacity] = useState<number>(75);

  useEffect(() => {
    if (show) {
      setIsLoadingRasters(true);
      getRasterMapLayers()
        .then((layers: RasterMapLayer[]) => {
          if (layers && Array.isArray(layers) && layers.length > 0) {
            const mappedOptions: RasterOption[] = layers.map((layer: RasterMapLayer) => {
              const layerId = layer.layerIdentifier || layer.id;
              const extentStr = layer.extent
                ? ` [${layer.extent.minX.toFixed(2)}, ${layer.extent.minY.toFixed(2)}, ${layer.extent.maxX.toFixed(2)}, ${layer.extent.maxY.toFixed(2)}]`
                : '';
              return {
                value: layerId,
                rasterId: layerId,
                label: layer.name || layer.layerIdentifier || layer.id,
                description: `Type: ${layer.type || 'RASTER'}${extentStr ? ` | Extent:${extentStr}` : ''}`,
                sourceLayer: layer.layerIdentifier || 'landcover',
                fieldName: 'class',
                rawLayer: layer,
                extent: layer.extent,
                type: layer.type
              };
            });
            setRasterOptions(mappedOptions);
          } else {
            setRasterOptions(FALLBACK_RASTER_OPTIONS);
          }
        })
        .catch(err => {
          console.error('[AddRastersModal] Failed to fetch raster map layers from endpoint:', err);
          setRasterOptions(FALLBACK_RASTER_OPTIONS);
        })
        .finally(() => {
          setIsLoadingRasters(false);
        });
    } else {
      setSelectedRaster(null);
      setSelectedColor(COLOR_OPTIONS[0]);
      setOpacity(75);
    }
  }, [show]);

  const instanceTitle = instance?.instanceName || instance?.name || instance?.title || '';

  const customSelectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      backgroundColor: isDarkMode ? '#212529' : '#ffffff',
      borderColor: isDarkMode ? '#495057' : '#ced4da',
      color: isDarkMode ? '#f8f9fa' : '#212529',
      boxShadow: state.isFocused
        ? isDarkMode
          ? '0 0 0 0.25rem rgba(66, 70, 73, 0.5)'
          : '0 0 0 0.25rem rgba(13, 110, 253, 0.25)'
        : 'none',
      '&:hover': {
        borderColor: isDarkMode ? '#6c757d' : '#86b7fe'
      }
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: isDarkMode ? '#212529' : '#ffffff',
      border: `1px solid ${isDarkMode ? '#495057' : '#ced4da'}`,
      zIndex: 9999
    }),
    menuPortal: (base: any) => ({
      ...base,
      zIndex: 9999
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected
        ? '#0d6efd'
        : state.isFocused
        ? isDarkMode
          ? '#2c3237'
          : '#f1f3f5'
        : 'transparent',
      color: state.isSelected ? '#ffffff' : isDarkMode ? '#f8f9fa' : '#212529',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: '#0d6efd',
        color: '#ffffff'
      }
    }),
    singleValue: (base: any) => ({
      ...base,
      color: isDarkMode ? '#f8f9fa' : '#212529'
    }),
    input: (base: any) => ({
      ...base,
      color: isDarkMode ? '#f8f9fa' : '#212529'
    }),
    placeholder: (base: any) => ({
      ...base,
      color: isDarkMode ? '#adb5bd' : '#6c757d'
    })
  };

  const formatColorOptionLabel = (option: ColorOption) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
      <span
        style={{
          width: '70px',
          height: '18px',
          borderRadius: '4px',
          background: option.gradient || option.color,
          border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}`,
          flexShrink: 0
        }}
      />
      <span style={{ fontSize: '13px' }}>{option.label}</span>
    </div>
  );

  const handleApply = () => {
    if (!selectedRaster) {
      toast.warn('Please select a raster dataset.');
      return;
    }

    if (onRasterAdded) {
      onRasterAdded({
        raster: selectedRaster,
        color: selectedColor,
        opacity: opacity / 100
      });
    }

    toast.success(`Raster "${selectedRaster.label}" added successfully.`);
    closeHandler();
  };

  return (
    <Modal
      size="lg"
      show={show}
      centered
      backdrop="static"
      keyboard={false}
      onHide={closeHandler}
      contentClassName={isDarkMode ? 'bg-dark text-white' : 'bg-white text-dark'}
    >
      <Modal.Header closeButton closeVariant={isDarkMode ? 'white' : undefined}>
        <Modal.Title>{t('simulationPage.addRasters', 'Add Raster Layer')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {instanceTitle && (
            <div className={`p-2 mb-3 rounded ${isDarkMode ? 'bg-secondary bg-opacity-25' : 'bg-light'}`}>
              <small className={isDarkMode ? 'text-light' : 'text-muted'}>
                <strong>{t('simulationPage.instance', 'Instance')}:</strong> {instanceTitle}
              </small>
            </div>
          )}

          {/* Raster Selection Dropdown */}
          <FormGroup className="mb-3">
            <FormLabel className={isDarkMode ? 'text-white' : 'text-dark'} style={{ fontWeight: 600 }}>
              {t('simulationPage.selectRaster', 'Select Raster Dataset (from raster/map-layers)')}
            </FormLabel>
            {isLoadingRasters ? (
              <div className="d-flex align-items-center gap-2 p-2">
                <Spinner animation="border" size="sm" variant="primary" />
                <span className="text-muted small">Loading raster map layers...</span>
              </div>
            ) : (
              <Select<RasterOption>
                placeholder={t('simulationPage.chooseRaster', 'Choose a raster dataset...')}
                value={selectedRaster}
                onChange={option => {
                  setSelectedRaster(option);
                  if (option && !selectedColor) {
                    setSelectedColor(COLOR_OPTIONS[0]);
                  }
                }}
                options={rasterOptions}
                isClearable
                styles={customSelectStyles}
                menuPortalTarget={document.body}
              />
            )}
            {selectedRaster && (
              <div className="mt-2">
                <small className={isDarkMode ? 'text-light' : 'text-muted'}>
                  {selectedRaster.description}
                </small>
                {selectedRaster.rawLayer?.extent && (
                  <div className="mt-1" style={{ fontSize: '11px', opacity: 0.85 }}>
                    <strong>Extent: </strong>
                    <span>
                      minX: {selectedRaster.rawLayer.extent.minX}, minY: {selectedRaster.rawLayer.extent.minY}, maxX:{' '}
                      {selectedRaster.rawLayer.extent.maxX}, maxY: {selectedRaster.rawLayer.extent.maxY}
                    </span>
                  </div>
                )}
                <div
                  className={`p-2 mt-2 rounded font-monospace ${
                    isDarkMode ? 'bg-black bg-opacity-25 text-info' : 'bg-light text-primary'
                  }`}
                  style={{ fontSize: '11px', wordBreak: 'break-all' }}
                >
                  <strong>MVT Tile Endpoint: </strong>
                  <code>{getRasterTileUrl(selectedRaster.rasterId)}</code>
                </div>
              </div>
            )}
          </FormGroup>

          {/* Color Selection Dropdown */}
          {selectedRaster && (
            <>
              <FormGroup className="mb-3">
                <FormLabel className={isDarkMode ? 'text-white' : 'text-dark'} style={{ fontWeight: 600 }}>
                  {t('simulationPage.selectColor', 'Choose Color Ramp / Palette (from raster presets)')}
                </FormLabel>
                <Select<ColorOption>
                  placeholder={t('simulationPage.chooseColor', 'Select a color palette...')}
                  value={selectedColor}
                  onChange={option => setSelectedColor(option)}
                  options={COLOR_OPTIONS}
                  formatOptionLabel={formatColorOptionLabel}
                  isClearable
                  styles={customSelectStyles}
                  menuPortalTarget={document.body}
                />
              </FormGroup>

              {/* Live Color Ramp Preview */}
              {selectedColor && (
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <small className={isDarkMode ? 'text-light' : 'text-muted'}>
                      <strong>Color Ramp Preview:</strong> {selectedColor.label}
                    </small>
                  </div>
                  <div
                    style={{
                      height: '24px',
                      borderRadius: '6px',
                      background: selectedColor.gradient,
                      border: `1px solid ${isDarkMode ? '#555' : '#ccc'}`,
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
                    }}
                  />
                  {selectedColor.colors && (
                    <div className="d-flex justify-content-between mt-1" style={{ fontSize: '10px', opacity: 0.7 }}>
                      <span>Min (Low Value)</span>
                      <span>Max (High Value)</span>
                    </div>
                  )}
                </div>
              )}

              {/* Opacity Slider */}
              <FormGroup className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <FormLabel className={`mb-0 ${isDarkMode ? 'text-white' : 'text-dark'}`} style={{ fontWeight: 600 }}>
                    {t('simulationPage.opacity', 'Layer Opacity')}
                  </FormLabel>
                  <span className={`badge ${isDarkMode ? 'bg-secondary' : 'bg-light text-dark border'}`}>
                    {opacity}%
                  </span>
                </div>
                <Form.Range
                  min={0}
                  max={100}
                  value={opacity}
                  onChange={e => setOpacity(Number(e.target.value))}
                />
              </FormGroup>
            </>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant={isDarkMode ? 'outline-light' : 'secondary'} onClick={closeHandler}>
          {t('simulationPage.cancel', 'Cancel')}
        </Button>
        <Button
          variant="primary"
          onClick={handleApply}
          disabled={!selectedRaster}
        >
          {t('simulationPage.addRaster', 'Add Raster')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddRastersModal;
