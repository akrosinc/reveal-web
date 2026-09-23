import React, { useState, useEffect } from 'react';
import { Button, Form, FormGroup, FormLabel, Modal } from 'react-bootstrap';
import Select, { SingleValue } from 'react-select';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../store/hooks';
import { toast } from 'react-toastify';

interface Props {
  show: boolean;
  closeHandler: () => void;
  instance?: any;
  onRasterAdded?: (rasterData: any) => void;
}

interface RasterOption {
  value: string;
  label: string;
  description?: string;
}

interface ColorOption {
  value: string;
  label: string;
  color: string;
  gradient?: string;
}

const RASTER_OPTIONS: RasterOption[] = [
  { value: 'population_density', label: 'Population Density (WorldPop)', description: 'High-resolution population distribution map' },
  { value: 'building_footprints', label: 'Building Footprints / Density', description: 'Structures and settlement intensity' },
  { value: 'elevation_dem', label: 'Digital Elevation Model (DEM)', description: 'Terrain elevation and topography' },
  { value: 'ndvi_vegetation', label: 'Vegetation Index (NDVI)', description: 'Normalized difference vegetation index' },
  { value: 'malaria_incidence', label: 'Malaria Incidence Risk', description: 'Epidemiological risk surface' },
  { value: 'precipitation', label: 'Annual Precipitation', description: 'Rainfall distribution and climate data' },
  { value: 'travel_time_access', label: 'Travel Time to Health Facilities', description: 'Physical accessibility modeling' }
];

const COLOR_OPTIONS: ColorOption[] = [
  {
    value: 'viridis',
    label: 'Viridis (Blue-Green-Yellow)',
    color: '#440154',
    gradient: 'linear-gradient(90deg, #440154, #31688e, #35b779, #fde725)'
  },
  {
    value: 'magma',
    label: 'Magma (Black-Purple-Orange-Yellow)',
    color: '#000004',
    gradient: 'linear-gradient(90deg, #000004, #51127c, #b73779, #fb8761, #fcfdbf)'
  },
  {
    value: 'plasma',
    label: 'Plasma (Purple-Red-Yellow)',
    color: '#0d0887',
    gradient: 'linear-gradient(90deg, #0d0887, #6a00a8, #b12a90, #e16462, #fca636, #f0f921)'
  },
  {
    value: 'inferno',
    label: 'Inferno (Black-Red-Yellow)',
    color: '#000004',
    gradient: 'linear-gradient(90deg, #000004, #57106e, #bb3754, #f98e09, #fcffa4)'
  },
  {
    value: 'turbo',
    label: 'Turbo (Rainbow)',
    color: '#30123b',
    gradient: 'linear-gradient(90deg, #30123b, #4686fb, #1ae4b6, #a2fc3c, #fbb41a, #e4460a, #7a0403)'
  },
  {
    value: 'blues',
    label: 'Blues (Light to Dark Blue)',
    color: '#08519c',
    gradient: 'linear-gradient(90deg, #f7fbff, #6baed6, #08519c)'
  },
  {
    value: 'greens',
    label: 'Greens (Light to Dark Green)',
    color: '#006d2c',
    gradient: 'linear-gradient(90deg, #f7fcf5, #74c476, #006d2c)'
  },
  {
    value: 'reds',
    label: 'Reds (Light to Dark Red)',
    color: '#a50f15',
    gradient: 'linear-gradient(90deg, #fff5f0, #fb6a4a, #a50f15)'
  },
  {
    value: 'yl_or_rd',
    label: 'Yellow-Orange-Red',
    color: '#bd0026',
    gradient: 'linear-gradient(90deg, #ffffb2, #fecc5c, #fd8d3c, #f03b20, #bd0026)'
  },
  {
    value: 'spectral',
    label: 'Spectral (Multi-hue)',
    color: '#9e0142',
    gradient: 'linear-gradient(90deg, #9e0142, #d53e4f, #fee08b, #e6f598, #66c2a5, #5e4fa2)'
  }
];

const AddRastersModal = ({ show, closeHandler, instance, onRasterAdded }: Props) => {
  const { t } = useTranslation();
  const isDarkMode = useAppSelector(state => state.darkMode.value);

  const [selectedRaster, setSelectedRaster] = useState<SingleValue<RasterOption>>(null);
  const [selectedColor, setSelectedColor] = useState<SingleValue<ColorOption>>(null);

  useEffect(() => {
    if (!show) {
      setSelectedRaster(null);
      setSelectedColor(null);
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
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span
        style={{
          width: '36px',
          height: '18px',
          borderRadius: '4px',
          background: option.gradient || option.color,
          border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
          flexShrink: 0
        }}
      />
      <span>{option.label}</span>
    </div>
  );

  const handleApply = () => {
    if (!selectedRaster) {
      toast.warn('Please select a raster.');
      return;
    }

    if (onRasterAdded) {
      onRasterAdded({
        raster: selectedRaster,
        color: selectedColor
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
        <Modal.Title>{t('simulationPage.addRasters', 'Add Raster')}</Modal.Title>
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
            <FormLabel className={isDarkMode ? 'text-white' : 'text-dark'}>
              {t('simulationPage.selectRaster', 'Select Raster')}
            </FormLabel>
            <Select<RasterOption>
              placeholder={t('simulationPage.chooseRaster', 'Choose a raster dataset...')}
              value={selectedRaster}
              onChange={option => {
                setSelectedRaster(option);
                if (!option) {
                  setSelectedColor(null);
                }
              }}
              options={RASTER_OPTIONS}
              isClearable
              styles={customSelectStyles}
              menuPortalTarget={document.body}
            />
            {selectedRaster?.description && (
              <Form.Text className={isDarkMode ? 'text-light' : 'text-muted'}>
                {selectedRaster.description}
              </Form.Text>
            )}
          </FormGroup>

          {/* Color Selection Dropdown (Displayed once raster is selected) */}
          {selectedRaster && (
            <FormGroup className="mb-3">
              <FormLabel className={isDarkMode ? 'text-white' : 'text-dark'}>
                {t('simulationPage.selectColor', 'Choose Color / Color Palette')}
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
