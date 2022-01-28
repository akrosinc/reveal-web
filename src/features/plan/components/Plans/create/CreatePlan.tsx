import React, { useEffect, useState } from 'react';
import { Button, Modal, Tab, Tabs } from 'react-bootstrap';
import { useAppDispatch } from '../../../../../store/hooks';
import { getLocationHierarchyList } from '../../../../location/api';
import { showLoader } from '../../../../reducers/loader';
import { getInterventionTypeList } from '../../../api';
import Details from './Details';

interface Props {
  show: boolean;
  handleClose: () => void;
}

interface Options {
  value: string;
  label: string;
}

const CreatePlan = ({ show, handleClose }: Props) => {
  const [activeTab, setActiveTab] = useState('plan-details');
  const [hierarchyList, setHierarchyList] = useState<Options[]>([]);
  const [interventionTypeList, setInterventionTypeList] = useState<Options[]>([]);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(showLoader(true));
    Promise.all([getLocationHierarchyList(0, 0, true), getInterventionTypeList()])
      .then(async ([locationHierarchyList, interventionTypeList]) => {
        setHierarchyList(
          locationHierarchyList.content.map<Options>(el => {
            return {
              label: el.name,
              value: el.identifier ?? ''
            };
          })
        );
        setInterventionTypeList(
          interventionTypeList.map<Options>(el => {
            return {
              label: el.name,
              value: el.identifier
            };
          })
        );
      })
      .finally(() => dispatch(showLoader(false)));
  }, [show, dispatch]);

  const goNext = (formData: any) => {
    console.log(formData);
    setActiveTab('create-goals');
  };

  return (
    <Modal show={show} size="lg" centered animation onHide={handleClose} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Create Plan</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs className="mb-3" activeKey={activeTab} onSelect={tabName => setActiveTab(tabName ?? activeTab)}>
          <Tab eventKey="plan-details" title="Details">
            <Details
              locationHierarchyList={hierarchyList}
              interventionTypeList={interventionTypeList}
              nextHandler={goNext}
            />
          </Tab>
          <Tab eventKey="create-goals" title="Goals">
            Goals
            <br />
            <Button onClick={() => setActiveTab('create-actions')}>Next</Button>
          </Tab>
          <Tab eventKey="create-actions" title="Actions">
            Actions
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleClose} disabled={activeTab !== 'create-actions'}>
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreatePlan;
