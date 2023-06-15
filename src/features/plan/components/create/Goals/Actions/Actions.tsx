import React, { useEffect, useState } from 'react';
import { Button, Form, Modal, Row, Col } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { Action } from '../../../../providers/types';
import DatePicker from 'react-datepicker';
import { getActionTitles, getformList } from '../../../../api';
import Moment from 'moment';
import { toUtcString } from '../../../../../../utils';
import { useAppSelector } from '../../../../../../store/hooks';
import { useTranslation } from 'react-i18next';

interface Props {
  selectedAction?: Action;
  closeHandler: (action?: Action, isDeleted?: boolean) => void;
  planPeriod: {
    start: Date;
    end: Date;
  };
}

const Actions = ({ closeHandler, planPeriod, selectedAction }: Props) => {
  const [actionTitles, setActionTitles] = useState<string[]>([]);
  const isDarkMode = useAppSelector(state => state.darkMode.value);

  useEffect(() => {
    getActionTitles().then(res => setActionTitles(res));
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    control,
    resetField,
    setValue
  } = useForm<Action>({
    defaultValues: {
      conditions: selectedAction?.conditions,
      description: selectedAction?.description,
      identifier: selectedAction?.identifier,
      title: selectedAction?.title,
      timingPeriod:
        selectedAction !== undefined
          ? {
              start: Moment(selectedAction.timingPeriod.start).toDate(),
              end: Moment(selectedAction.timingPeriod.end).toDate()
            }
          : planPeriod
    }
  });
  const { t } = useTranslation();

  useEffect(() => {
    getformList().then(res => {
      setValue('formIdentifier', selectedAction?.formIdentifier ?? '');
    });
  }, [setValue, selectedAction]);

  const submitHandler = (formData: any) => {
    formData.timingPeriod.start = toUtcString(formData.timingPeriod.start);
    formData.timingPeriod.end = toUtcString(formData.timingPeriod.end);
    closeHandler(formData);
  };

  return (
    <Modal
      show={true}
      onHide={closeHandler}
      backdrop="static"
      keyboard={false}
      centered
      contentClassName={isDarkMode ? 'bg-dark' : 'bg-white'}
    >
      <Modal.Header closeButton>
        <Modal.Title>{selectedAction ? t('planPage.editAction') : t('planPage.createAction')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-2">
            <Form.Label>{t('planPage.Title')}</Form.Label>
            <Form.Select
              id="action-title-input"
              placeholder="Enter action title"
              {...register('title', {
                required: 'Action title must be selected.',
                minLength: 1
              })}
              value={selectedAction?.title}
            >
              <option></option>
              {actionTitles.map((el, index) => (
                <option key={index} value={el}>
                  {el}
                </option>
              ))}
            </Form.Select>
            {errors.title && <Form.Label className="text-danger">{errors.title.message}</Form.Label>}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          id="action-discard-button"
          variant="secondary"
          className="me-auto"
          onClick={() => {
            closeHandler();
          }}
        >
          Discard
        </Button>
        {selectedAction && <Button onClick={() => closeHandler(selectedAction, true)}>Delete</Button>}
        <Button id="action-save-button" disabled={!isDirty} onClick={handleSubmit(submitHandler)}>
          {selectedAction ? 'Save Changes' : 'Create Action'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default Actions;
