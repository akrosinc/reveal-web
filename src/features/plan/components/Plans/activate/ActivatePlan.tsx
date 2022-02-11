import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { updatePlanStatus } from '../../../api';

interface Props {
  show: boolean;
  closeHandler: () => void;
  planId: string;
}

const ActivatePlan = ({ show, closeHandler, planId }: Props) => {

const activatePlanHandler = () => {
    updatePlanStatus(planId).then(res => {
      toast.success('Plan activated successfully');
      closeHandler();
    }).catch(err => toast.error(err.toString()))
} 

  return (
    <Modal show={show} centered backdrop="static" onHide={closeHandler}>
      <Modal.Header closeButton>
        <Modal.Title>Activate plan</Modal.Title>
      </Modal.Header>
      <Modal.Body>Are you sure you want to active plan with identifier:<br/>{planId} ?</Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={closeHandler}>Cancel</Button>
        <Button onClick={() => activatePlanHandler()}>Submit</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ActivatePlan;
