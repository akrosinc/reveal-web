import React, { useState, useEffect, useMemo } from 'react';
import { Button, Form, FormGroup, FormLabel, Modal, Spinner } from 'react-bootstrap';
import Select from 'react-select';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../store/hooks';
import { COLOR_OPTIONS, ColorOption } from '../../../../utils/rasterHelper';
import { RasterDatasetItem } from '../SimulationMapView/api/datasetsAPI';

interface Props {
  show: boolean;
  closeHandler: () => void;
  rasterItem: RasterDatasetItem | null;
  onUpdateColor: (rasterItem: RasterDatasetItem, newColor: string) => Promise<void> | void;
}

export const EditRasterColorModal = ({
  show,
  closeHandler,
  rasterItem,
  onUpdateColor
}: Props) => {
  const { t } = useTranslation();
  const isDarkMode = useAppSelector(state => state.darkMode.value);

  const [selectedColorOption, setSelectedColorOption] = useState<ColorOption | null>(null);
  const [customHexColor, setCustomHexColor] = useState<string>('#fd8d3c');
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
        const customOpt: ColorOption = {
          value: `custom-${customHexColor}`,
          label: `Custom (${customHexColor})`,
          color: customHexColor,
          colors: [customHexColor],
          gradient: customHexColor
        };
        return [customOpt, ...COLOR_OPTIONS];
      }
    }
    return COLOR_OPTIONS;
  }, [customHexColor]);

  useEffect(() => {
    if (show && rasterItem) {
      const initialColor = rasterItem.colorRamp || '#fd8d3c';
      setCustomHexColor(initialColor);

      // Find matching preset if applicable
      const matched = COLOR_OPTIONS.find(
        opt =>
          opt.color.toLowerCase() === initialColor.toLowerCase() ||
          opt.value.toLowerCase() === initialColor.toLowerCase() ||
          opt.colors.some(c => c.toLowerCase() === initialColor.toLowerCase())
      );
      setSelectedColorOption(
        matched || {
          value: `custom-${initialColor}`,
          label: `Custom (${initialColor})`,
          color: initialColor,
          colors: [initialColor],
          gradient: initialColor
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
    const finalHex = selectedColorOption?.color || customHexColor || '#fd8d3c';
    setIsSubmitting(true);
    try {
      await onUpdateColor(rasterItem, finalHex);
      closeHandler();
    } catch (err) {
      console.error('[EditRasterColorModal] Failed to update raster color:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!rasterItem) return null;

  const rasterDisplayName = rasterItem.name || rasterItem.datasetIdentifier || rasterItem.identifier;

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
          {t('simulationPage.editRasterColor', 'Edit Raster Color')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={e => { e.preventDefault(); handleApply(); }}>
          <div className="mb-3 p-2 rounded border bg-light text-dark" style={{ fontSize: '12.5px' }}>
            <div className="d-flex align-items-center gap-2">
              <span
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '3px',
                  backgroundColor: selectedColorOption?.color || customHexColor,
                  display: 'inline-block',
                  border: '1px solid rgba(0,0,0,0.25)',
                  flexShrink: 0
                }}
              />
              <div>
                <strong>{rasterDisplayName}</strong>
                {rasterItem.datasetIdentifier && (
                  <div className="text-muted" style={{ fontSize: '11px' }}>
                    ID: {rasterItem.datasetIdentifier}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Color Selection Dropdown (from raster presets) */}
          <FormGroup className="mb-3">
            <FormLabel className={isDarkMode ? 'text-white' : 'text-dark'} style={{ fontWeight: 600 }}>
              {t('simulationPage.selectColor', 'Choose Color Ramp / Palette (from raster presets)')}
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
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <small className={isDarkMode ? 'text-light' : 'text-muted'}>
                  <strong>Color Ramp Preview:</strong> {selectedColorOption.label}
                </small>
              </div>
              <div
                style={{
                  height: '24px',
                  borderRadius: '6px',
                  background: selectedColorOption.gradient || selectedColorOption.color || customHexColor,
                  border: `1px solid ${isDarkMode ? '#555' : '#ccc'}`,
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
                }}
              />
              {selectedColorOption.colors && (
                <div className="d-flex justify-content-between mt-1" style={{ fontSize: '10px', opacity: 0.7 }}>
                  <span>Min (Low Value)</span>
                  <span>Max (High Value)</span>
                </div>
              )}
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
                value={customHexColor.startsWith('#') && customHexColor.length === 7 ? customHexColor : '#fd8d3c'}
                onChange={e => {
                  const val = e.target.value;
                  setCustomHexColor(val);
                  const matched = COLOR_OPTIONS.find(
                    opt =>
                      opt.color.toLowerCase() === val.toLowerCase() ||
                      opt.value.toLowerCase() === val.toLowerCase() ||
                      opt.colors.some(c => c.toLowerCase() === val.toLowerCase())
                  );
                  setSelectedColorOption(
                    matched || {
                      value: `custom-${val}`,
                      label: `Custom (${val})`,
                      color: val,
                      colors: [val],
                      gradient: val
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
                  if (val.startsWith('#') && val.length === 7) {
                    const matched = COLOR_OPTIONS.find(
                      opt =>
                        opt.color.toLowerCase() === val.toLowerCase() ||
                        opt.value.toLowerCase() === val.toLowerCase() ||
                        opt.colors.some(c => c.toLowerCase() === val.toLowerCase())
                    );
                    setSelectedColorOption(
                      matched || {
                        value: `custom-${val}`,
                        label: `Custom (${val})`,
                        color: val,
                        colors: [val],
                        gradient: val
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
