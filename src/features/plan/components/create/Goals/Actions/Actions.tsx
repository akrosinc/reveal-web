import React, { useEffect, useState } from 'react';
import { Button, Form, Modal, Row, Col } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { Action } from '../../../../providers/types';
import DatePicker from 'react-datepicker';
import { getActionTitles, getformList } from '../../../../api';
import Moment from 'moment';
import { toUtcString } from '../../../../../../utils';
import { useAppSelector } from '../../../../../../store/hooks';

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
    <Modal show={true} onHide={closeHandler} backdrop="static" keyboard={false} centered contentClassName={isDarkMode ? 'bg-dark' : 'bg-white'}>
      <Modal.Header closeButton>
        <Modal.Title>{selectedAction ? 'Edit Action' : 'Create Action'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-2">
            <Form.Label>Title</Form.Label>
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
              {actionTitles.map((el, index) => <option key={index} value={el}>{el}</option>)}
            </Form.Select>
            {errors.title && <Form.Label className="text-danger">{errors.title.message}</Form.Label>}
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Description</Form.Label>
            <Form.Control
              id="action-description-input"
              type="text"
              placeholder="Enter description title"
              {...register('description', {
                required: 'Description must not be empty.',
                minLength: 1
              })}
            />
            {errors.description && <Form.Label className="text-danger">{errors.description.message}</Form.Label>}
          </Form.Group>
          <Row>
            <Col>
              <Form.Group className="mb-2">
                <Form.Label>Start date</Form.Label>
                <Controller
                  control={control}
                  name="timingPeriod.start"
                  rules={{ required: 'Start date must be selected!' }}
                  render={({ field: { onChange, value } }) => (
                    <DatePicker
                      id="action-start-date-picker"
                      placeholderText="Select date"
                      onChange={e => {
                        resetField('timingPeriod.end');
                        onChange(e);
                      }}
                      selected={value}
                      className="form-control"
                      dropdownMode="select"
                      preventOpenOnFocus
                      showPopperArrow={false}
                      popperPlacement="bottom-end"
                      dateFormat="yyyy-MM-dd"
                      minDate={new Date()}
                    />
                  )}
                />
                {errors.timingPeriod?.start && (
                  <Form.Label className="text-danger">{errors.timingPeriod?.start.message}</Form.Label>
                )}
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-2">
                <Form.Label>End date</Form.Label>
                <Controller
                  control={control}
                  name="timingPeriod.end"
                  rules={{
                    required: 'End date must be selected!'
                  }}
                  render={({ field: { onChange, value } }) => (
                    <DatePicker
                      id="action-end-date-picker"
                      placeholderText="Select date"
                      onChange={onChange}
                      selected={value}
                      className="form-control"
                      dropdownMode="select"
                      preventOpenOnFocus
                      showPopperArrow={false}
                      popperPlacement="bottom-end"
                      dateFormat="yyyy-MM-dd"
                      minDate={watch('timingPeriod.start')}
                      disabled={watch('timingPeriod.start') === null || watch('timingPeriod.start') === undefined}
                    />
                  )}
                />
                {errors.timingPeriod?.end && (
                  <Form.Label className="text-danger">{errors.timingPeriod?.end.message}</Form.Label>
                )}
              </Form.Group>
            </Col>
          </Row>
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
