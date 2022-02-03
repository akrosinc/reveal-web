import React from 'react';
import { Container, Tab, Tabs } from 'react-bootstrap';
import { LOCATION_PAGE } from '../../../constants';
import { useNavigate, useParams } from 'react-router-dom';
import GeographicLevels from '../../location/components/geographicLevels';
import LocationHierarchy from '../../location/components/locationHierarchy';
import Locations from '../../location/components/locations';
import LocationBulk from '../../location/components/locationBulk';
import { useTranslation } from 'react-i18next';

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
        id="uncontrolled-tab-example"
        className="mb-3"
        mountOnEnter={true}
        unmountOnExit={true}
        onSelect={tabName => {
          navigate(LOCATION_PAGE + '/' + tabName);
        }}
      >
        <Tab eventKey="geographic-levels" title={t('locationsPage.geographicLevels')}>
          <GeographicLevels />
        </Tab>
        <Tab eventKey="locations-bulk" title={t('locationsPage.locationsBulk')}>
          <LocationBulk />
        </Tab>
        <Tab eventKey="location-hierarchy" title={t('locationsPage.locationHierarchy')}>
          <LocationHierarchy />
        </Tab>
        <Tab eventKey="locations" title={t('locationsPage.locations')}>
          <Locations />
        </Tab>
      </Tabs>
    </Container>
  );
};

export default Location;
