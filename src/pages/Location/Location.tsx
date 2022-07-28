import React, { useEffect } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { GEOGRAPHIC_LEVEL_VIEW, LOCATION_PAGE, LOCATION_VIEW } from '../../constants';
import { useNavigate, useParams } from 'react-router-dom';
import GeographicLevels from '../../features/location/components/geographicLevels';
import LocationHierarchy from '../../features/location/components/locationHierarchy';
import Locations from '../../features/location/components/locations';
import LocationBulk from '../../features/location/components/locationBulk';
import { useTranslation } from 'react-i18next';
import AuthGuard from '../../components/AuthGuard';
import PageWrapper from '../../components/PageWrapper';

const Location = () => {
  let { tab } = useParams();
  let navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (tab === undefined) {
      navigate(LOCATION_PAGE + '/geographic-levels');
    } else if (tab !== 'geographic-levels' && tab !== 'location-hierarchy' && tab !== 'locations' && tab !== 'locations-bulk') {
      navigate('/error');
    }
  }, [tab, navigate]);

  return (
    <PageWrapper>
      <Tabs
        defaultActiveKey={tab}
        id="location-tabs"
        className="mb-3"
        mountOnEnter={true}
        unmountOnExit={true}
        onSelect={tabName => {
          navigate(LOCATION_PAGE + '/' + tabName);
        }}
      >
        <Tab eventKey="geographic-levels" title={t('locationsPage.geographicLevels')}>
          <AuthGuard roles={[GEOGRAPHIC_LEVEL_VIEW]}>
            <GeographicLevels />
          </AuthGuard>
        </Tab>
        <Tab eventKey="locations-bulk" title={t('locationsPage.locationsBulk')}>
          <AuthGuard roles={[LOCATION_VIEW]}>
            <LocationBulk />
          </AuthGuard>
        </Tab>
        <Tab eventKey="location-hierarchy" title={t('locationsPage.locationHierarchy')}>
          <AuthGuard roles={[LOCATION_VIEW]}>
            <LocationHierarchy />
          </AuthGuard>
        </Tab>
        <Tab eventKey="locations" title={t('locationsPage.locations')}>
          <AuthGuard roles={[LOCATION_VIEW]}>
            <Locations />
          </AuthGuard>
        </Tab>
      </Tabs>
    </PageWrapper>
  );
};

export default Location;
