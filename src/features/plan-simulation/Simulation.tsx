import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { ActionDialog } from '../../components/Dialogs';
import SimulationMapView from './map-view';
import SimulationModal from './popup-modal';

const Simulation = () => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Row>
        <Col md={6}>
          <Form>
            <Form.Group className="d-flex align-items-center my-3">
              <Form.Label>{t('simulationPage.country')}:</Form.Label>
              <Form.Select className="ms-4 w-50">
                <option></option>
                <option>Zambia</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-5">
              <Form.Label className="pe-5">{t('simulationPage.entity')}:</Form.Label>
              <Form.Check inline type="radio" name="flexRadioDefault" id="radio-group1" label="Person" />
              <Form.Check inline type="radio" name="flexRadioDefault" id="radio-group2" label="Location" />
            </Form.Group>
          </Form>
          <Row className="my-2 align-items-center">
            <Col>Entity properties</Col>
            <Col className="text-end">
              <Button className="rounded" onClick={() => setShowModal(true)}>
                <FontAwesomeIcon icon="plus" />
              </Button>
            </Col>
          </Row>
          <div style={{ minHeight: '300px', position: 'relative' }} className="border rounded my-2">
            <p className="lead p-4">Conditions</p>
            <Button className="m-3" style={{ position: 'absolute', bottom: 0, right: 0 }}>
              Display
            </Button>
          </div>
        </Col>
        <Col md={6}>
          <SimulationMapView />
        </Col>
      </Row>
      {showModal && (
          <ActionDialog
            closeHandler={() => setShowModal(false)}
            title="Conditions modal"
            element={<SimulationModal />}
            footer={
              <>
                <Button onClick={() => setShowModal(false)}>Close</Button>
                <Button>Add</Button>
              </>
            }
          />
        )}
    </>
  );
};

export default Simulation;
