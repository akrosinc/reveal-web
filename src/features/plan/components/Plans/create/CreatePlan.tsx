import React, { useEffect, useState } from 'react';
import { Button, Modal, Tab, Tabs } from 'react-bootstrap';

interface Props {
  show: boolean;
  handleClose: () => void;
}

const CreatePlan = ({ show, handleClose }: Props) => {
  const [activeTab, setActiveTab] = useState('plan-details');

  useEffect(() => {
    console.log('trigger' + show);
  }, [show])

  return (
    <Modal show={show} size="xl" scrollable centered animation onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Create Plan</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs className="mb-3" mountOnEnter={true} unmountOnExit={true} activeKey={activeTab} onSelect={tabName => setActiveTab(tabName ?? activeTab)}>
          <Tab eventKey="plan-details" title="Details">
            Details
            <br/>
            <Button onClick={() => setActiveTab('create-goals')}>Next</Button>
          </Tab>
          <Tab eventKey="create-goals" title="Goals">
            Goals
            <br/>
            <Button onClick={() => setActiveTab('create-actions')}>Next</Button>
          </Tab>
          <Tab eventKey="create-actions" title="Actions">
            Actions
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleClose} disabled={activeTab !== 'create-actions'}>Submit</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreatePlan;
