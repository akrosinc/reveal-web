import React from 'react';
import { Container, Tab, Tabs } from 'react-bootstrap';
import { LOCATION } from '../../../constants';
import { useNavigate, useParams } from 'react-router-dom';
import GeographicLevels from '../../location/components/geographicLevels';
import LocationHierarchy from '../../location/components/locationHierarchy';
import Locations from '../../location/components/locations';

const Location = () => {
  let { tab } = useParams();
  let navigate = useNavigate();

  const checkTab = () => {
    if (tab === 'geographic-levels' || tab === 'location-hierarchy' || tab === 'locations') return tab;
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
          navigate(LOCATION + '/' + tabName);
        }}
      >
        <Tab eventKey="geographic-levels" title="Geographic Levels">
          <GeographicLevels />
        </Tab>
        <Tab eventKey="location-hierarchy" title="Location heirarchy">
          <LocationHierarchy />
        </Tab>
        <Tab eventKey="locations" title="Locations">
          <Locations />
        </Tab>
      </Tabs>
    </Container>
  );
};

export default Location;
