import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsGeoAlt, BsLayers, BsVectorPen } from 'react-icons/bs';
import { BASEMAPS } from '../../constants';
import styles from './MapTools.module.css';

interface Props {
  mapStyle: string;
  onMapStyleChange: (style: string) => void;
}

// Add site / Edit boundary stay disabled until their flows exist (spec 4.2: health facility selection, geo edit permission)
const MapTools = ({ mapStyle, onMapStyleChange }: Props) => {
  const { t } = useTranslation();
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const selectBasemap = (style: string) => {
    onMapStyleChange(style);
    setIsPickerOpen(false);
  };

  return (
    <>
      {isPickerOpen && (
        <div className={styles.picker} role="menu">
          {BASEMAPS.map(basemap => (
            <button
              key={basemap.id}
              type="button"
              role="menuitemradio"
              aria-checked={basemap.style === mapStyle}
              className={basemap.style === mapStyle ? `${styles.option} ${styles.optionActive}` : styles.option}
              onClick={() => selectBasemap(basemap.style)}
            >
              {t(`campaignPlanning.basemap.${basemap.id}`)}
            </button>
          ))}
        </div>
      )}
      <div className={styles.tools}>
        <button
          type="button"
          id="campaign-planning-basemap-button"
          className={isPickerOpen ? `${styles.fab} ${styles.fabActive}` : styles.fab}
          title={t('campaignPlanning.basemapLayers')}
          aria-label={t('campaignPlanning.basemapLayers')}
          aria-expanded={isPickerOpen}
          onClick={() => setIsPickerOpen(open => !open)}
        >
          <BsLayers />
        </button>
        <button
          type="button"
          id="campaign-planning-add-site-button"
          className={styles.fab}
          title={t('campaignPlanning.addVaccinationSite')}
          aria-label={t('campaignPlanning.addVaccinationSite')}
          disabled
        >
          <BsGeoAlt />
        </button>
        <button
          type="button"
          id="campaign-planning-edit-boundary-button"
          className={styles.fab}
          title={t('campaignPlanning.editBoundary')}
          aria-label={t('campaignPlanning.editBoundary')}
          disabled
        >
          <BsVectorPen />
        </button>
      </div>
    </>
  );
};

export default MapTools;
