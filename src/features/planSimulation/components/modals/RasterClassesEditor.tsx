import { Button, Form, FormGroup, FormLabel } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';
import {
  MAX_RASTER_CLASSES,
  MIN_RASTER_CLASSES,
  RasterColorClass,
  addRasterClass,
  getRasterClassesError,
  removeRasterClass,
  splitRasterClasses
} from '../../../../utils/rasterClasses';
import { RasterValueRange } from '../../../../utils/rasterValues';

interface Props {
  enabled: boolean;
  classes: RasterColorClass[];
  paletteColors: string[];
  isDarkMode: boolean;
  valueRange?: RasterValueRange;
  isLoadingRange?: boolean;
  onEnabledChange: (enabled: boolean) => void;
  onChange: (classes: RasterColorClass[]) => void;
}

const ERROR_MESSAGES = {
  invalidValue: 'Every class needs a From and a To value.',
  fromAboveTo: 'From must be lower than To in every class.',
  overlap: 'Classes must not overlap.'
};

const toNumber = (value: string) => (value === '' ? NaN : Number(value));

const RasterClassesEditor = ({
  enabled,
  classes,
  paletteColors,
  isDarkMode,
  valueRange,
  isLoadingRange,
  onEnabledChange,
  onChange
}: Props) => {
  const { t } = useTranslation();
  const error = enabled ? getRasterClassesError(classes) : undefined;

  const inputStyle = {
    backgroundColor: isDarkMode ? '#212529' : '#ffffff',
    color: isDarkMode ? '#ffffff' : '#000000',
    borderColor: isDarkMode ? '#495057' : '#ced4da'
  };

  const updateClass = (index: number, changes: Partial<RasterColorClass>) =>
    onChange(classes.map((item, i) => (i === index ? { ...item, ...changes } : item)));

  const changeCount = (value: string) => {
    const count = Math.round(Number(value));
    if (!Number.isFinite(count) || count < MIN_RASTER_CLASSES || count > MAX_RASTER_CLASSES) return;
    const froms = classes.map(item => item.from).filter(Number.isFinite);
    const tos = classes.map(item => item.to).filter(Number.isFinite);
    const from = froms.length ? Math.min(...froms) : 0;
    const to = tos.length ? Math.max(...tos) : 100;
    onChange(splitRasterClasses(from, to > from ? to : from + 100, count, paletteColors));
  };

  const addClass = () => onChange(addRasterClass(classes, paletteColors));

  return (
    <FormGroup
      className="mb-3 p-3 rounded"
      style={{
        backgroundColor: isDarkMode ? '#1a1d20' : '#f8f9fa',
        border: `1px solid ${enabled ? '#0d6efd' : isDarkMode ? '#495057' : '#ced4da'}`
      }}
    >
      <div className="d-flex align-items-center justify-content-between gap-3">
        <div>
          <FormLabel
            htmlFor="raster-custom-classes-switch"
            className={`mb-0 ${isDarkMode ? 'text-white' : 'text-dark'}`}
            style={{ fontWeight: 600, cursor: 'pointer' }}
          >
            {t('simulationPage.defineClasses', 'Define classes')}
          </FormLabel>
          <div className={`small ${isDarkMode ? 'text-light' : 'text-muted'}`}>
            {t('simulationPage.defineClassesHint', 'Set your own value ranges and a colour for each one.')}
          </div>
          {(isLoadingRange || valueRange) && (
            <div id="raster-value-range" className={`small mt-1 ${isDarkMode ? 'text-white' : 'text-dark'}`}>
              {isLoadingRange
                ? t('simulationPage.readingRasterValues', 'Reading raster values...')
                : t('simulationPage.rasterValueRange', {
                    defaultValue: 'Values in this raster: {{min}} – {{max}}',
                    min: valueRange?.min,
                    max: valueRange?.max
                  })}
            </div>
          )}
        </div>
        <Form.Check
          type="switch"
          id="raster-custom-classes-switch"
          className="mb-0"
          style={{ fontSize: '1.4rem', minHeight: 0 }}
        >
          <Form.Check.Input
            type="checkbox"
            aria-label={t('simulationPage.defineClasses', 'Define classes')}
            checked={enabled}
            disabled={isLoadingRange}
            onChange={e => onEnabledChange(e.target.checked)}
            style={{ cursor: isLoadingRange ? 'wait' : 'pointer' }}
          />
        </Form.Check>
      </div>
      {enabled && (
        <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${isDarkMode ? '#343a40' : '#dee2e6'}` }}>
          <div className="d-flex align-items-center gap-2 mb-3">
            <FormLabel className={`mb-0 ${isDarkMode ? 'text-white' : 'text-dark'}`}>
              {t('simulationPage.numberOfClasses', 'Number of classes')}
            </FormLabel>
            <Form.Control
              id="raster-classes-count-input"
              type="number"
              size="sm"
              min={MIN_RASTER_CLASSES}
              max={MAX_RASTER_CLASSES}
              value={classes.length}
              onChange={e => changeCount(e.target.value)}
              style={{ ...inputStyle, maxWidth: '80px' }}
            />
          </div>
          <div className="d-flex gap-2 mb-1" style={{ fontSize: '12px', opacity: 0.75 }}>
            <span style={{ width: '45px' }}>{t('simulationPage.classColor', 'Color')}</span>
            <span className="flex-grow-1">{t('simulationPage.classFrom', 'From')}</span>
            <span className="flex-grow-1">{t('simulationPage.classTo', 'To')}</span>
            <span style={{ width: '38px' }} />
          </div>
          {classes.map((item, index) => (
            <div key={index} className="d-flex align-items-center gap-2 mb-2">
              <input
                type="color"
                value={item.color}
                onChange={e => updateClass(index, { color: e.target.value })}
                title={t('simulationPage.classColor', 'Color')}
                style={{
                  width: '45px',
                  height: '31px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  border: '1px solid #ced4da',
                  padding: '2px',
                  flexShrink: 0
                }}
              />
              <Form.Control
                type="number"
                size="sm"
                step="any"
                value={Number.isFinite(item.from) ? item.from : ''}
                onChange={e => updateClass(index, { from: toNumber(e.target.value) })}
                aria-label={t('simulationPage.classFrom', 'From')}
                style={inputStyle}
              />
              <Form.Control
                type="number"
                size="sm"
                step="any"
                value={Number.isFinite(item.to) ? item.to : ''}
                onChange={e => updateClass(index, { to: toNumber(e.target.value) })}
                aria-label={t('simulationPage.classTo', 'To')}
                style={inputStyle}
              />
              <Button
                variant={isDarkMode ? 'outline-light' : 'outline-danger'}
                size="sm"
                title={t('simulationPage.removeClass', 'Remove class')}
                aria-label={t('simulationPage.removeClass', 'Remove class')}
                disabled={classes.length <= MIN_RASTER_CLASSES}
                onClick={() => onChange(removeRasterClass(classes, index, paletteColors))}
                style={{ width: '38px', flexShrink: 0 }}
              >
                <FontAwesomeIcon icon="trash" />
              </Button>
            </div>
          ))}
          <Button
            id="raster-add-class-button"
            variant={isDarkMode ? 'outline-light' : 'outline-primary'}
            size="sm"
            disabled={classes.length >= MAX_RASTER_CLASSES || Boolean(error)}
            onClick={addClass}
          >
            <FontAwesomeIcon icon="plus" className="me-1" />
            {t('simulationPage.addClass', 'Add class')}
          </Button>
          {error && (
            <div className="text-danger small mt-2">
              {t(`simulationPage.classesError_${error}`, ERROR_MESSAGES[error])}
            </div>
          )}
          <div className={`small mt-2 ${isDarkMode ? 'text-light' : 'text-muted'}`} style={{ opacity: 0.8 }}>
            {t('simulationPage.classesHint', 'Values outside the classes are not shown on the map.')}
          </div>
        </div>
      )}
    </FormGroup>
  );
};

export default RasterClassesEditor;
