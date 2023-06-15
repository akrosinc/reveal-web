import { useState } from 'react';
import { Button, Col, Collapse, Row } from 'react-bootstrap';

import { SearchLocationProperties } from '../../providers/types';
import { useTranslation } from 'react-i18next';

interface Props {
  locationProps: SearchLocationProperties;
}

const PeopleDetailsModal = ({ locationProps }: Props) => {
  const [locationMeta, setLocationMeta] = useState(false);
  const { t } = useTranslation();
  return (
    <>
      <div className="d-flex justify-content-between align-items-center">
        <h5>
          {t('simulationPage.locationName')}: {locationProps.name}
        </h5>
        <Button onClick={() => setLocationMeta(!locationMeta)}>{t('simulationPage.showMetadata')}</Button>
      </div>
      <Collapse in={locationMeta} timeout={300}>
        <div className="my-2">
          {locationProps.metadata &&
            locationProps.metadata.length &&
            locationProps.metadata.map((el, index) => (
              <div className="border border-1" key={index}>
                <Row className="p-2 m-0">
                  <Col md={2}>
                    <b>{el.type}:</b>
                  </Col>
                  <Col>{el.value}</Col>
                </Row>
              </div>
            ))}
        </div>
      </Collapse>
      <hr />
    </>
  );
};

export default PeopleDetailsModal;
