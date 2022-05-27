import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { updatePlanStatus } from '../../api';

interface Props {
  show: boolean;
  closeHandler: () => void;
  planId: string;
}

const ActivatePlan = ({ show, closeHandler, planId }: Props) => {
  const activatePlanHandler = () => {
    updatePlanStatus(planId)
      .then(_ => {
        toast.success('Plan activated successfully');
      })
      .catch(err => toast.error(err.message ? err.message : 'There was an error activating this plan.'))
      .finally(() => {
        closeHandler();
      });
  };

  return (
    <Modal show={show} centered backdrop="static" onHide={closeHandler}>
      <Modal.Header closeButton>
        <Modal.Title>Activate plan</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to active plan with identifier:
        <br />
        {planId} ?
      </Modal.Body>
      <Modal.Footer>
        <Button id="cancel-activate-button" variant="secondary" onClick={closeHandler}>
          Cancel
        </Button>
        <Button id="activate-button" onClick={() => activatePlanHandler()}>
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ActivatePlan;
