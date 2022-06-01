import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { updatePlanStatus } from '../../api';

interface Props {
  show: boolean;
  closeHandler: () => void;
  planId: string;
}

const ActivatePlan = ({ show, closeHandler, planId }: Props) => {
  const { t } = useTranslation();

  const activatePlanHandler = () => {
    updatePlanStatus(planId)
      .then(_ => {
        toast.success(t('planPage.planActivateMessage'));
      })
      .catch(err => toast.error(err.message ? err.message : t('planPage.planActivationError')))
      .finally(() => {
        closeHandler();
      });
  };

  return (
    <Modal show={show} centered backdrop="static" onHide={closeHandler}>
      <Modal.Header closeButton>
        <Modal.Title>{t("planPage.planActivationTitle")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {t('planPage.planActivationBody')}:
        <br />
        {planId} ?
      </Modal.Body>
      <Modal.Footer>
        <Button id="cancel-activate-button" variant="secondary" onClick={closeHandler}>
        {t('buttons.cancel')}
        </Button>
        <Button id="activate-button" onClick={() => activatePlanHandler()}>
          {t('buttons.submit')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ActivatePlan;
