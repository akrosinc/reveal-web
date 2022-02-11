import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { Goal, Priority } from '../../../../../../providers/types';

interface Props {
  show: boolean;
  planId?: string;
  closeHandler: () => void;
  goalList: Goal[];
}

const CreateGoal = ({ show, planId, closeHandler, goalList }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const submitHandler = (form: any) => {
      let newGoal: Goal = {
        actions: [],
        description: form.description,
        identifier: String(goalList.length + 1),
        priority: form.priorty
      }
      goalList.push(newGoal);
      closeHandler();
  }

  return (
    <Modal show={show} centered backdrop="static" onHide={closeHandler}>
      <Modal.Header closeButton>
        <Modal.Title>Create Goal</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-2">
            <Form.Label>Description</Form.Label>
            <Form.Control
              placeholder="Enter plan description"
              type="text"
              {...register('description', {
                required: 'Description must not be empty.',
                minLength: {
                    value: 1,
                    message: 'Description must contain at least 1 charater.'
                }
              })}
            />
            {errors.description && <Form.Label className="text-danger">{errors.description.message}</Form.Label>}
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Priority</Form.Label>
            <Form.Select
              {...register('priority', {
                required: 'Please select plan priority.',
              })}
            >
              <option></option>
              <option value={Priority.HIGH_PRIORITY}>High priority</option>
              <option value={Priority.MEDIUM_PRIORITY}>Medium priority</option>
              <option value={Priority.LOW_PRIORITY}>Low priority</option>
            </Form.Select>
            {errors.priority && <Form.Label className="text-danger">{errors.priority.message}</Form.Label>}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={closeHandler}>Cancel</Button>
        <Button onClick={handleSubmit(submitHandler)}>Submit</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateGoal;
