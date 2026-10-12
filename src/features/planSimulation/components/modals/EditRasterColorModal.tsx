import React, { useState, useEffect, useMemo } from 'react';
import { Button, Form, FormGroup, FormLabel, Modal, Spinner } from 'react-bootstrap';
import Select from 'react-select';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../store/hooks';
import { COLOR_OPTIONS, ColorOption, parseColorOrGradient, generateDatasetGradient } from '../../../../utils/rasterHelper';
import { RasterDatasetItem } from '../SimulationMapView/api/datasetsAPI';

interface Props {
  show: boolean;
  closeHandler: () => void;
  rasterItem: RasterDatasetItem | null;
  onUpdateColor: (
    rasterItem: RasterDatasetItem,
    newColor: string,
    newOpacity?: number,
    newName?: string
  ) => Promise<void> | void;
}

export const EditRasterColorModal = ({
  show,
  closeHandler,
  rasterItem,
  onUpdateColor
}: Props) => {
  const { t } = useTranslation();
  const isDarkMode = useAppSelector(state => state.darkMode.value);

  const [name, setName] = useState<string>('');
  const [selectedColorOption, setSelectedColorOption] = useState<ColorOption | null>(null);
  const [customHexColor, setCustomHexColor] = useState<string>('#fd8d3c');
  const [opacity, setOpacity] = useState<number>(100);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableColorOptions = useMemo(() => {
    if (customHexColor) {
      const isPreset = COLOR_OPTIONS.some(
        opt =>
          opt.color.toLowerCase() === customHexColor.toLowerCase() ||
          opt.value.toLowerCase() === customHexColor.toLowerCase() ||
          opt.colors.some(c => c.toLowerCase() === customHexColor.toLowerCase())
      );
      if (!isPreset) {
        const datasetStops = generateDatasetGradient(customHexColor);
        const customOpt: ColorOption = {
          value: customHexColor,
          label: `Custom Ramp (${customHexColor})`,
          color: customHexColor,
          colors: datasetStops,
          gradient: `linear-gradient(to right, ${datasetStops.join(', ')})`
        };
        return [customOpt, ...COLOR_OPTIONS];
      }
    }
    return COLOR_OPTIONS;
  }, [customHexColor]);

  useEffect(() => {
    if (show && rasterItem) {
      setName(rasterItem.name || rasterItem.datasetIdentifier || rasterItem.identifier || '');
      const initialColor = rasterItem.colorRamp || '#fd8d3c';
      const parsed = parseColorOrGradient(initialColor);
      setCustomHexColor(parsed.primaryColor || initialColor);

      const initialOpacity =
        rasterItem.opacity !== undefined
          ? rasterItem.opacity <= 1
            ? Math.round(rasterItem.opacity * 100)
            : Math.round(rasterItem.opacity)
          : 100;
      setOpacity(initialOpacity);

      // Find matching preset if applicable
      const matched = COLOR_OPTIONS.find(
        opt =>
          opt.value.toLowerCase() === initialColor.toLowerCase() ||
          opt.label.toLowerCase() === initialColor.toLowerCase() ||
          opt.color.toLowerCase() === initialColor.toLowerCase() ||
          (parsed.isGradient && opt.colors.join(',').toLowerCase() === parsed.colors.join(',').toLowerCase()) ||
          opt.colors.some(c => c.toLowerCase() === initialColor.toLowerCase())
      );
      const datasetStops = generateDatasetGradient(parsed.primaryColor || initialColor);
      setSelectedColorOption(
        matched || {
          value: initialColor,
          label: `Gradient Ramp (${parsed.primaryColor})`,
          color: parsed.primaryColor,
          colors: parsed.colors && parsed.colors.length > 1 ? parsed.colors : datasetStops,
          gradient: `linear-gradient(to right, ${(parsed.colors && parsed.colors.length > 1 ? parsed.colors : datasetStops).join(', ')})`
        }
      );
      setIsSubmitting(false);
    }
  }, [show, rasterItem]);

  const customSelectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      backgroundColor: isDarkMode ? '#212529' : '#ffffff',
      borderColor: isDarkMode ? '#495057' : '#ced4da',
      boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(13, 110, 253, 0.25)' : 'none',
      '&:hover': {
        borderColor: isDarkMode ? '#6c757d' : '#adb5bd'
      },
      color: isDarkMode ? '#f8f9fa' : '#212529'
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: isDarkMode ? '#212529' : '#ffffff',
      zIndex: 99999,
      border: `1px solid ${isDarkMode ? '#495057' : '#ced4da'}`
    }),
    menuPortal: (base: any) => ({
      ...base,
      zIndex: 99999
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
          width: '60px',
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

  const handleApply = async () => {
    if (!rasterItem) return;
    const isPresetMultiColor =
      selectedColorOption &&
      COLOR_OPTIONS.some(
        opt => opt.value === selectedColorOption.value && opt.colors && opt.colors.length > 1
      );
    const finalColorToSave = isPresetMultiColor
      ? selectedColorOption.colors.join(',')
      : selectedColorOption?.color || customHexColor || '#fd8d3c';
    setIsSubmitting(true);
    try {
      await onUpdateColor(rasterItem, finalColorToSave, opacity / 100, name);
      closeHandler();
    } catch (err) {
      console.error('[EditRasterColorModal] Failed to update raster:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!rasterItem) return null;

  return (
    <Modal
      show={show}
      onHide={closeHandler}
      backdrop="static"
      centered
      contentClassName={isDarkMode ? 'bg-dark text-white' : 'bg-white text-dark'}
    >
      <Modal.Header closeButton closeVariant={isDarkMode ? 'white' : undefined}>
        <Modal.Title style={{ fontSize: '16px', fontWeight: 600 }}>
          {t('simulationPage.editRaster', 'Edit Raster')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={e => { e.preventDefault(); handleApply(); }}>
          {/* Raster Name Field */}
          <FormGroup className="mb-3">
            <FormLabel className={isDarkMode ? 'text-white' : 'text-dark'} style={{ fontWeight: 600 }}>
              {t('simulationPage.rasterName', 'Raster Name')}
            </FormLabel>
            <Form.Control
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t('simulationPage.rasterNamePlaceholder', 'Enter raster name')}
              style={{
                backgroundColor: isDarkMode ? '#212529' : '#ffffff',
                color: isDarkMode ? '#ffffff' : '#000000',
                borderColor: isDarkMode ? '#495057' : '#ced4da'
              }}
            />
            {/* {rasterItem.datasetIdentifier && (
              <div className="text-muted mt-1" style={{ fontSize: '11px' }}>
                ID: {rasterItem.datasetIdentifier}
              </div>
            )} */}
          </FormGroup>

          {/* Color Selection Dropdown (from raster presets) */}
          <FormGroup className="mb-3">
            <FormLabel className={isDarkMode ? 'text-white' : 'text-dark'} style={{ fontWeight: 600 }}>
              {t('simulationPage.selectColor', 'Choose Color Ramp / Palette')}
            </FormLabel>
            <Select<ColorOption>
              placeholder={t('simulationPage.chooseColor', 'Select a color palette...')}
              value={selectedColorOption}
              onChange={option => {
                setSelectedColorOption(option);
                if (option?.color) {
                  setCustomHexColor(option.color);
                }
              }}
              options={availableColorOptions}
              formatOptionLabel={formatColorOptionLabel}
              isClearable
              styles={customSelectStyles}
              menuPortalTarget={document.body}
            />
          </FormGroup>

          {/* Live Color Ramp Preview */}
          {selectedColorOption && (
            <div
              className="mb-3 p-3 rounded"
              style={{
                backgroundColor: isDarkMode ? '#1a1d20' : '#f8f9fa',
                border: `1px solid ${isDarkMode ? '#343a40' : '#e9ecef'}`
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-2">
                <small className={isDarkMode ? 'text-light' : 'text-muted'}>
                  <strong>{t('simulationPage.colorRampPreview', 'Color Ramp Preview')}:</strong>{' '}
                  {selectedColorOption.label}
                </small>
              </div>
              <div
                style={{
                  height: '28px',
                  borderRadius: '6px',
                  border: `1px solid ${isDarkMode ? '#555' : '#ccc'}`,
                  background:
                    selectedColorOption.gradient ||
                    `linear-gradient(to right, ${(selectedColorOption.colors || generateDatasetGradient(selectedColorOption.color || customHexColor)).join(', ')})`,
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.15)'
                }}
              />
            </div>
          )}

          {/* Custom Hex / Color Picker Swatch */}
          <FormGroup className="mb-3">
            <FormLabel className={isDarkMode ? 'text-white' : 'text-dark'} style={{ fontWeight: 600 }}>
              {t('simulationPage.customColor', 'Fine-tune Color')}
            </FormLabel>
            <div className="d-flex align-items-center gap-3">
              <input
                type="color"
                value={
                  customHexColor.startsWith('#') && customHexColor.length === 7
                    ? customHexColor
                    : selectedColorOption?.color && selectedColorOption.color.startsWith('#') && selectedColorOption.color.length === 7
                    ? selectedColorOption.color
                    : '#fd8d3c'
                }
                onChange={e => {
                  const val = e.target.value;
                  setCustomHexColor(val);
                  const matched = COLOR_OPTIONS.find(
                    opt =>
                      opt.color.toLowerCase() === val.toLowerCase() ||
                      opt.value.toLowerCase() === val.toLowerCase() ||
                      opt.colors.some(c => c.toLowerCase() === val.toLowerCase())
                  );
                  const datasetStops = generateDatasetGradient(val);
                  setSelectedColorOption(
                    matched || {
                      value: val,
                      label: `Custom Ramp (${val})`,
                      color: val,
                      colors: datasetStops,
                      gradient: `linear-gradient(to right, ${datasetStops.join(', ')})`
                    }
                  );
                }}
                style={{
                  width: '45px',
                  height: '38px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  border: '1px solid #ced4da',
                  padding: '2px'
                }}
                title="Select Custom Color"
              />
              <Form.Control
                type="text"
                value={customHexColor}
                onChange={e => {
                  const val = e.target.value;
                  setCustomHexColor(val);
                  if (val.startsWith('#') && (val.length === 7 || val.length === 4)) {
                    const matched = COLOR_OPTIONS.find(
                      opt =>
                        opt.color.toLowerCase() === val.toLowerCase() ||
                        opt.value.toLowerCase() === val.toLowerCase() ||
                        opt.colors.some(c => c.toLowerCase() === val.toLowerCase())
                    );
                    const datasetStops = generateDatasetGradient(val);
                    setSelectedColorOption(
                      matched || {
                        value: val,
                        label: `Custom Ramp (${val})`,
                        color: val,
                        colors: datasetStops,
                        gradient: `linear-gradient(to right, ${datasetStops.join(', ')})`
                      }
                    );
                  }
                }}
                placeholder="#fd8d3c"
                style={{
                  maxWidth: '140px',
                  backgroundColor: isDarkMode ? '#212529' : '#ffffff',
                  color: isDarkMode ? '#ffffff' : '#000000',
                  borderColor: isDarkMode ? '#495057' : '#ced4da'
                }}
              />
            </div>
          </FormGroup>

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
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant={isDarkMode ? 'outline-light' : 'secondary'} onClick={closeHandler} disabled={isSubmitting}>
          {t('simulationPage.cancel', 'Cancel')}
        </Button>
        <Button
          variant="primary"
          onClick={handleApply}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              {t('simulationPage.updating', 'Updating...')}
            </>
          ) : (
            t('simulationPage.update', 'Update')
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditRasterColorModal;
