import React from 'react';
import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { ActionDialog } from '../../../../components/Dialogs';
import { updatePlanStatus } from '../../api';

interface Props {
  closeHandler: () => void;
  planId: string;
}

const ActivatePlan = ({ closeHandler, planId }: Props) => {
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
    <ActionDialog
      title={t('planPage.planActivationTitle')}
      closeHandler={closeHandler}
      element={
        <>
          {t('planPage.planActivationBody')}:
          <br />
          {planId} ?
        </>
      }
      footer={
        <>
          <Button id="cancel-activate-button" variant="secondary" onClick={closeHandler}>
            {t('buttons.cancel')}
          </Button>
          <Button id="activate-button" onClick={() => activatePlanHandler()}>
            {t('buttons.submit')}
          </Button>
        </>
      }
    />
  );
};

export default ActivatePlan;
