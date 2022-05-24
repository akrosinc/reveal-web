import React from 'react';
import { Container, Tab, Tabs } from 'react-bootstrap';
import { GEOGRAPHIC_LEVEL_VIEW, LOCATION_PAGE, LOCATION_VIEW } from '../../../constants';
import { useNavigate, useParams } from 'react-router-dom';
import GeographicLevels from '../../location/components/geographicLevels';
import LocationHierarchy from '../../location/components/locationHierarchy';
import Locations from '../../location/components/locations';
import LocationBulk from '../../location/components/locationBulk';
import { useTranslation } from 'react-i18next';
import AuthGuard from '../../../components/AuthGuard';

const Location = () => {
  let { tab } = useParams();
  let navigate = useNavigate();
  const { t } = useTranslation();

  const checkTab = () => {
    if (tab === 'geographic-levels' || tab === 'location-hierarchy' || tab === 'locations' || tab === 'locations-bulk')
      return tab;
  };
  return (
    <Container fluid className="my-4 px-2">
      <Tabs
        defaultActiveKey={checkTab()}
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
    </Container>
  );
};

export default Location;
