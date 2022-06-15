import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { PageableModel } from '../../../api/providers';
import { ActionDialog } from '../../../components/Dialogs';
import { getLocationHierarchyList } from '../../location/api';
import { LocationHierarchyModel } from '../../location/providers/types';
import SimulationMapView from './SimulationMapView';
import SimulationModal from './SimulationModal';

const Simulation = () => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [hierarchyList, setHierarchyList] = useState<PageableModel<LocationHierarchyModel>>();
  const [selectedEntity, setSelectedEntity] = useState<string>();

  useEffect(() => {
    getLocationHierarchyList(10, 0, true).then(res => setHierarchyList(res));
  }, []);

  const openModalHandler = () => {
    if (selectedEntity) {
      //get constraints by selected entity function
      setShowModal(true);
    }
  };

  return (
    <>
      <Row>
        <Col md={6}>
          <Form>
            <Form.Group className="d-flex align-items-center my-3">
              <Form.Label>{t('simulationPage.hierarchy')}:</Form.Label>
              <Form.Select className="ms-4 w-50">
                {hierarchyList?.content.map(el => (
                  <option key={el.identifier} value={el.identifier}>{el.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="d-flex align-items-center my-3">
              <Form.Label>{t('simulationPage.location')}:</Form.Label>
              <Form.Select className="ms-4 w-50"></Form.Select>
            </Form.Group>
            <Row className="mt-4">
              <Col md={10}>
                <Form.Group className="mb-5">
                  <Form.Label className="pe-3">{t('simulationPage.entity')}:</Form.Label>
                  <Form.Check
                    inline
                    onChange={e => setSelectedEntity(e.target.value)}
                    type="radio"
                    value="Person"
                    name="flexRadioDefault"
                    id="radio-group1"
                    label="Person"
                  />
                  <Form.Check
                    inline
                    onChange={e => setSelectedEntity(e.target.value)}
                    type="radio"
                    value="Location"
                    name="flexRadioDefault"
                    id="radio-group2"
                    label="Location"
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Col
                  className="text-end"
                  title={selectedEntity !== undefined ? undefined : 'Please select entity type first.'}
                >
                  <Button
                    disabled={selectedEntity !== undefined ? false : true}
                    className="rounded"
                    onClick={openModalHandler}
                  >
                    <FontAwesomeIcon icon="plus" />
                  </Button>
                </Col>
              </Col>
            </Row>
          </Form>
          <p>Entity properties</p>
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
      {showModal && selectedEntity && (
        <ActionDialog
          closeHandler={openModalHandler}
          title="Conditions modal"
          element={<SimulationModal selectedEntity={selectedEntity} />}
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
