import mapboxgl, { AttributionControl, Map } from 'mapbox-gl';
import { useEffect, useRef } from 'react';
import { config } from '../../../../config/config';
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from '../../constants';
import styles from './CampaignMap.module.css';

mapboxgl.accessToken = config.MAPBOX_TOKEN ?? '';

interface Props {
  mapStyle: string;
}

// Logo and attribution sit in the bottom gap between the table and the map tool buttons (see CSS)
const CampaignMap = ({ mapStyle }: Props) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map>();
  const appliedStyle = useRef(mapStyle);

  useEffect(() => {
    map.current = new Map({
      container: mapContainer.current as HTMLDivElement,
      style: appliedStyle.current,
      center: MAP_DEFAULT_CENTER,
      zoom: MAP_DEFAULT_ZOOM,
      logoPosition: 'bottom-right',
      attributionControl: false
    });
    map.current.addControl(new AttributionControl({ compact: true }), 'bottom-right');
    return () => map.current?.remove();
  }, []);

  useEffect(() => {
    if (!map.current || appliedStyle.current === mapStyle) return;
    map.current.setStyle(mapStyle);
    appliedStyle.current = mapStyle;
  }, [mapStyle]);

  return <div ref={mapContainer} className={styles.map} />;
};

export default CampaignMap;
