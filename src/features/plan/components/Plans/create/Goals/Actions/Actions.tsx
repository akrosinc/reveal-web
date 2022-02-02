import React, { useEffect } from 'react';
import { Button, Form, Modal, Row, Col } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { Action } from '../../../../../providers/types';
import DatePicker from 'react-datepicker';

interface Props {
  show: boolean;
  closeHandler: (action?: Action) => void;
  planPeriod: {
    start: Date;
    end: Date;
  };
}

const Actions = ({ show, closeHandler, planPeriod }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
    resetField,
    reset,
    setValue
  } = useForm();

  useEffect(() => {
    reset();
    setValue('timingPeriod.start', planPeriod.start);
    setValue('timingPeriod.end', planPeriod.end);
  }, [planPeriod, setValue, reset, show]);

  const submitHandler = (formData: any) => {
    closeHandler(formData);
  };

  return (
    <Modal show={show} onHide={closeHandler} backdrop="static" keyboard={false} centered>
      <Modal.Header closeButton>
        <Modal.Title>Create Action</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-2">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter action title"
              {...register('title', {
                required: 'Action title must not be empty.',
                minLength: 1
              })}
            />
            {errors.title && <Form.Label className="text-danger">{errors.title.message}</Form.Label>}
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Description</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter action title"
              {...register('description', {
                required: 'Description must not be empty.',
                minLength: 1
              })}
            />
            {errors.title && <Form.Label className="text-danger">{errors.description.message}</Form.Label>}
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
          <Form.Group className="mb-2">
            <Form.Label>Form</Form.Label>
            <Form.Select
              placeholder="Choose form"
              {...register('formIdentifier', {
                required: 'Action form must be selected.',
                minLength: 1
              })}
            >
              <option></option>
              <option value="IRS intervention form">IRS intervention form</option>
              <option value="SMC intervention form">SMC intervention form</option>
              <option value="Drug distribution form">Drug distribution form</option>
              <option value="Person registration form">Person registration form</option>
            </Form.Select>
            {errors.formIdentifier && <Form.Label className="text-danger">{errors.formIdentifier.message}</Form.Label>}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => {
            reset();
            closeHandler();
          }}
        >
          Discard
        </Button>
        <Button onClick={handleSubmit(submitHandler)}>Add action</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default Actions;