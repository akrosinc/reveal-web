import React from 'react';
import { Button, Form, Modal, Table } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { Action } from '../../../../../providers/types';

interface Props {
  show: boolean;
  closeHandler: (action?: Action) => void;
}

const Condition = ({ show, closeHandler }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const submitHandler = (formData: any) => {
    console.log(formData);
    closeHandler(formData);
  };

  return (
    <Modal show={show} onHide={closeHandler} backdrop="static" keyboard={false} centered>
      <Modal.Header closeButton>
        <Modal.Title>Condition</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table></Table>
        <hr />
        <h2>Add condition</h2>
        <Form>
          <Form.Group className="mb-2">
            <Form.Label>Entity</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter entity title"
              {...register('entity', {
                required: 'Entity title must not be empty.',
                minLength: 1
              })}
            />
            {errors.title && <Form.Label className="text-danger">{errors.title.message}</Form.Label>}
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Entity Properties</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter entity Properties"
              {...register('description', {
                required: 'Description must not be empty.',
                minLength: 1
              })}
            />
            {errors.title && <Form.Label className="text-danger">{errors.description.message}</Form.Label>}
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
        <Button onClick={handleSubmit(submitHandler)}>Submit</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default Condition;
