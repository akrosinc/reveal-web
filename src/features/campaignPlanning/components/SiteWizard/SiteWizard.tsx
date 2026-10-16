import { GeoJSONSource, Map, MapMouseEvent } from 'mapbox-gl';
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsArrowCounterclockwise, BsCheckLg, BsX } from 'react-icons/bs';
import { SITE_COLOR, SITE_SNAP_TOLERANCE_PX, SITE_TYPES } from '../../constants';
import { Site, SiteGeometry } from '../../providers/types';
import {
  getSnapSegments,
  isPointInside,
  isPolygonInside,
  isSelfIntersecting,
  Position,
  snapPosition,
  toPolygon
} from '../../utils/sites';
import styles from './SiteWizard.module.css';

type Step = 'details' | 'boundary' | 'location';

const STEPS: Record<SiteGeometry, Step[]> = {
  point: ['details', 'location'],
  polygon: ['details', 'boundary', 'location']
};

const DRAFT_SOURCE = 'campaign-site-draft';

const EMPTY_DRAFT: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };

const feature = (geometry: GeoJSON.Geometry, kind: string): GeoJSON.Feature => ({
  type: 'Feature',
  geometry,
  properties: { kind }
});

const drawDraft = (map: Map, data: GeoJSON.FeatureCollection) => {
  try {
    const source = map.getSource(DRAFT_SOURCE) as GeoJSONSource | undefined;
    if (source) {
      source.setData(data);
      return;
    }
    map.addSource(DRAFT_SOURCE, { type: 'geojson', data });
    map.addLayer({
      id: `${DRAFT_SOURCE}-fill`,
      type: 'fill',
      source: DRAFT_SOURCE,
      filter: ['==', ['get', 'kind'], 'boundary'],
      paint: { 'fill-color': SITE_COLOR, 'fill-opacity': 0.18 }
    });
    map.addLayer({
      id: `${DRAFT_SOURCE}-line`,
      type: 'line',
      source: DRAFT_SOURCE,
      filter: ['in', ['get', 'kind'], ['literal', ['boundary', 'path']]],
      paint: { 'line-color': SITE_COLOR, 'line-width': 2 }
    });
    map.addLayer({
      id: `${DRAFT_SOURCE}-preview`,
      type: 'line',
      source: DRAFT_SOURCE,
      filter: ['==', ['get', 'kind'], 'preview'],
      paint: { 'line-color': SITE_COLOR, 'line-width': 2, 'line-dasharray': [2, 2] }
    });
    map.addLayer({
      id: `${DRAFT_SOURCE}-vertex`,
      type: 'circle',
      source: DRAFT_SOURCE,
      filter: ['==', ['get', 'kind'], 'vertex'],
      paint: { 'circle-radius': 4, 'circle-color': '#fff', 'circle-stroke-color': SITE_COLOR, 'circle-stroke-width': 2 }
    });
    map.addLayer({
      id: `${DRAFT_SOURCE}-snap`,
      type: 'circle',
      source: DRAFT_SOURCE,
      filter: ['==', ['get', 'kind'], 'snap'],
      paint: {
        'circle-radius': 7,
        'circle-color': 'rgba(0, 0, 0, 0)',
        'circle-stroke-color': '#e5484d',
        'circle-stroke-width': 2
      }
    });
    map.addLayer({
      id: `${DRAFT_SOURCE}-location`,
      type: 'circle',
      source: DRAFT_SOURCE,
      filter: ['==', ['get', 'kind'], 'location'],
      paint: { 'circle-radius': 7, 'circle-color': SITE_COLOR, 'circle-stroke-color': '#fff', 'circle-stroke-width': 2 }
    });
  } catch {
    return;
  }
};

const removeDraft = (map: Map) => {
  try {
    map
      .getStyle()
      .layers?.filter(layer => layer.id.startsWith(DRAFT_SOURCE))
      .forEach(layer => map.removeLayer(layer.id));
    if (map.getSource(DRAFT_SOURCE)) map.removeSource(DRAFT_SOURCE);
  } catch {
    return;
  }
};

interface Props {
  map: Map;
  geometry: SiteGeometry;
  areaName: string;
  catchment?: GeoJSON.Geometry;
  snapGeometries: GeoJSON.Geometry[];
  onSave: (site: Site) => void;
  onClose: () => void;
}

const SiteWizard = ({ map, geometry, areaName, catchment, snapGeometries, onSave, onClose }: Props) => {
  const { t } = useTranslation();
  const steps = STEPS[geometry];
  const types = useMemo(() => SITE_TYPES.filter(type => type.geometry === geometry), [geometry]);
  const [step, setStep] = useState<Step>('details');
  const [name, setName] = useState('');
  const [typeId, setTypeId] = useState('');
  const [vertices, setVertices] = useState<Position[]>([]);
  const [isClosed, setIsClosed] = useState(false);
  const [location, setLocation] = useState<Position>();
  const [error, setError] = useState('');
  const segments = useMemo(() => getSnapSegments(snapGeometries), [snapGeometries]);
  const draft = useRef<GeoJSON.FeatureCollection>(EMPTY_DRAFT);
  const stepIndex = steps.indexOf(step);
  const isLastStep = stepIndex === steps.length - 1;
  const canContinue =
    (step === 'details' && !!name.trim() && !!typeId) ||
    (step === 'boundary' && isClosed) ||
    (step === 'location' && !!location);

  const render = useCallback(
    (cursor?: Position, snapped?: Position) => {
      const features: GeoJSON.Feature[] = [];
      if (isClosed) features.push(feature(toPolygon(vertices), 'boundary'));
      else if (vertices.length > 1) features.push(feature({ type: 'LineString', coordinates: vertices }, 'path'));
      if (!isClosed && step === 'boundary' && cursor && vertices.length) {
        features.push(feature({ type: 'LineString', coordinates: [vertices[vertices.length - 1], cursor] }, 'preview'));
      }
      if (step === 'boundary')
        vertices.forEach(vertex => features.push(feature({ type: 'Point', coordinates: vertex }, 'vertex')));
      if (snapped) features.push(feature({ type: 'Point', coordinates: snapped }, 'snap'));
      if (location) features.push(feature({ type: 'Point', coordinates: location }, 'location'));
      draft.current = { type: 'FeatureCollection', features };
      drawDraft(map, draft.current);
    },
    [map, step, vertices, isClosed, location]
  );

  useEffect(() => {
    const redraw = () => drawDraft(map, draft.current);
    map.on('style.load', redraw);
    return () => {
      map.off('style.load', redraw);
      removeDraft(map);
    };
  }, [map]);

  useEffect(() => {
    render();
    if (step === 'details' || !catchment) return;
    const canvas = map.getCanvas();
    canvas.style.cursor = 'crosshair';
    map.doubleClickZoom.disable();

    const getTarget = (event: MapMouseEvent) => {
      const position: Position = [event.lngLat.lng, event.lngLat.lat];
      if (step !== 'boundary' || isClosed) return { position };
      if (vertices.length > 2 && map.project(vertices[0]).dist(event.point) <= SITE_SNAP_TOLERANCE_PX) {
        return { position: vertices[0], snapped: vertices[0], closes: true };
      }
      const snapped = snapPosition(map, position, segments);
      return { position: snapped ?? position, snapped };
    };

    const move = (event: MapMouseEvent) => {
      const { position, snapped } = getTarget(event);
      render(position, snapped);
    };

    const click = (event: MapMouseEvent) => {
      const { position, snapped, closes } = getTarget(event);
      if (step === 'location') {
        const container = geometry === 'polygon' ? toPolygon(vertices) : catchment;
        if (!isPointInside(position, container)) {
          setError(
            geometry === 'polygon'
              ? t('campaignPlanning.siteOutsideBoundary')
              : t('campaignPlanning.siteOutsideCatchment', { name: areaName })
          );
          return;
        }
        setLocation(position);
        setError('');
        return;
      }
      if (isClosed) return;
      if (closes) {
        if (isSelfIntersecting(vertices)) setError(t('campaignPlanning.siteBoundaryCrosses'));
        else if (!isPolygonInside(vertices, catchment))
          setError(t('campaignPlanning.siteBoundaryOutside', { name: areaName }));
        else {
          setIsClosed(true);
          setError('');
        }
        return;
      }
      if (!snapped && !isPointInside(position, catchment)) {
        setError(t('campaignPlanning.siteCornerOutside', { name: areaName }));
        return;
      }
      setVertices(current => [...current, position]);
      setError('');
    };

    map.on('mousemove', move);
    map.on('click', click);
    return () => {
      map.off('mousemove', move);
      map.off('click', click);
      canvas.style.cursor = '';
      map.doubleClickZoom.enable();
    };
  }, [map, render, step, vertices, isClosed, catchment, segments, geometry, areaName, t]);

  const undo = () => {
    if (isClosed) setIsClosed(false);
    else setVertices(current => current.slice(0, -1));
    setLocation(undefined);
    setError('');
  };

  const clear = () => {
    if (step === 'boundary') {
      setVertices([]);
      setIsClosed(false);
    }
    setLocation(undefined);
    setError('');
  };

  const goTo = (index: number) => {
    setStep(steps[index]);
    setError('');
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!canContinue) return;
    if (!isLastStep) {
      goTo(stepIndex + 1);
      return;
    }
    if (!location) return;
    onSave({
      identifier: `site-${Date.now()}`,
      name: name.trim(),
      typeId,
      geometry,
      location: { type: 'Point', coordinates: location },
      boundary: geometry === 'polygon' ? toPolygon(vertices) : undefined
    });
  };

  const hint =
    step === 'boundary'
      ? isClosed
        ? t('campaignPlanning.siteBoundaryDone')
        : t('campaignPlanning.siteBoundaryHint', { name: areaName, tolerance: SITE_SNAP_TOLERANCE_PX })
      : geometry === 'polygon'
      ? t('campaignPlanning.siteLocationInBoundaryHint')
      : t('campaignPlanning.siteLocationHint', { name: areaName });

  return (
    <form className={styles.card} onSubmit={submit} aria-label={t('campaignPlanning.addSite')}>
      <div className={styles.header}>
        <div>
          <div className={styles.title}>{t('campaignPlanning.addSite')}</div>
          <div className={styles.subtitle}>{t('campaignPlanning.catchment', { name: areaName })}</div>
        </div>
        <button
          type="button"
          id="campaign-planning-site-wizard-close"
          className={styles.close}
          aria-label={t('buttons.cancel')}
          onClick={onClose}
        >
          <BsX />
        </button>
      </div>

      <ol className={styles.stepper}>
        {steps.map((item, index) => (
          <li
            key={item}
            className={[styles.stepItem, index === stepIndex && styles.stepActive, index < stepIndex && styles.stepDone]
              .filter(Boolean)
              .join(' ')}
          >
            <span className={styles.stepNumber}>{index < stepIndex ? <BsCheckLg /> : index + 1}</span>
            {t(`campaignPlanning.siteStep.${item}`)}
          </li>
        ))}
      </ol>

      {step === 'details' ? (
        <>
          <label className={styles.label} htmlFor="campaign-planning-site-name">
            {t('campaignPlanning.siteName')}
          </label>
          <input
            id="campaign-planning-site-name"
            className={styles.control}
            value={name}
            autoFocus
            onChange={e => setName(e.target.value)}
          />
          <label className={styles.label} htmlFor="campaign-planning-site-type">
            {t('campaignPlanning.siteType')}
          </label>
          <select
            id="campaign-planning-site-type"
            className={styles.control}
            value={typeId}
            onChange={e => setTypeId(e.target.value)}
          >
            <option value="" disabled>
              {t('campaignPlanning.selectSiteType')}
            </option>
            {types.map(type => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>
        </>
      ) : (
        <>
          <div className={styles.hint}>{catchment ? hint : t('campaignPlanning.siteNoCatchment')}</div>
          {step === 'boundary' && (
            <div className={styles.tools}>
              <span>{t('campaignPlanning.siteCorners', { count: vertices.length })}</span>
              <button
                type="button"
                id="campaign-planning-site-undo"
                className={styles.tool}
                disabled={!vertices.length}
                onClick={undo}
              >
                <BsArrowCounterclockwise /> {t('campaignPlanning.undo')}
              </button>
              <button
                type="button"
                id="campaign-planning-site-clear"
                className={styles.tool}
                disabled={!vertices.length}
                onClick={clear}
              >
                {t('campaignPlanning.clear')}
              </button>
            </div>
          )}
          {step === 'location' && location && (
            <div className={styles.tools}>
              <span>{t('campaignPlanning.sitePlaced')}</span>
              <button type="button" id="campaign-planning-site-clear-location" className={styles.tool} onClick={clear}>
                {t('campaignPlanning.clear')}
              </button>
            </div>
          )}
        </>
      )}
      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      <div className={styles.actions}>
        <button
          type="button"
          id="campaign-planning-site-back"
          className={styles.secondary}
          onClick={() => (stepIndex ? goTo(stepIndex - 1) : onClose())}
        >
          {stepIndex ? t('campaignPlanning.back') : t('buttons.cancel')}
        </button>
        <button type="submit" id="campaign-planning-site-next" className={styles.primary} disabled={!canContinue}>
          {isLastStep ? t('buttons.save') : t('campaignPlanning.next')}
        </button>
      </div>
    </form>
  );
};

export default SiteWizard;
