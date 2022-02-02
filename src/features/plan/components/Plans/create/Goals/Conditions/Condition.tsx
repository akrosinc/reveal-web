import React from 'react';
import { Button, Card, Form, Modal, Table } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { ConditionModel } from '../../../../../providers/types';

interface Props {
  show: boolean;
  closeHandler: (action?: ConditionModel) => void;
  conditionList: ConditionModel[];
}

const Condition = ({ show, closeHandler, conditionList }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const submitHandler = (formData: any) => {
    closeHandler(formData);
  };

  return (
    <Modal show={show} onHide={closeHandler} backdrop="static" scrollable size="lg" keyboard={false} centered>
      <Modal.Header closeButton>
        <Modal.Title>Conditions</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="lead">Active conditions</p>
        <Table bordered responsive hover>
          <thead className="border border-2">
            <tr>
              <th>Entity</th>
              <th>Properties</th>
              <th>Operator</th>
              <th>Filter value</th>
            </tr>
          </thead>
          <tbody>
            {conditionList.map((el, index) => (
              <tr key={index}>
                <td>{el.entity}</td>
                <td>{el.entityProperties}</td>
                <td>{el.operator}</td>
                <td>{el.filterValue}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        <hr />
        <p className="lead">Add condition</p>
        <hr />
        <Form>
          <Form.Group className="mb-2">
            <Form.Label>Entity</Form.Label>
            <Form.Select
              {...register('entity', {
                required: 'Entity title must not be empty.',
                minLength: 1
              })}
            >
              <option></option>
              <option>Entity</option>
              <option>Person</option>
            </Form.Select>
            {errors.entity && <Form.Label className="text-danger">{errors.entity.message}</Form.Label>}
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Entity Properties</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter entity Properties"
              {...register('entityProperties', {
                required: 'Entity properties must not be empty.',
                minLength: 1
              })}
            />
            {errors.entityProperties && (
              <Form.Label className="text-danger">{errors.entityProperties.message}</Form.Label>
            )}
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Operator</Form.Label>
            <Form.Control
              placeholder="Enter operator ( <, <=, >, >=, = )"
              type="text"
              {...register('operator', {
                required: 'Operator field must not be empty.',
                minLength: 1
              })}
            />
            {errors.operator && <Form.Label className="text-danger">{errors.operator.message}</Form.Label>}
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Filter value</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter filter value"
              {...register('filterValue', {
                required: 'Filter value must not be empty.',
                minLength: 1
              })}
            />
            {errors.filterValue && <Form.Label className="text-danger">{errors.filterValue.message}</Form.Label>}
          </Form.Group>
        </Form>
        <Form>
          <Card className="p-4 my-4 w-75">
            <p className="lead">Target</p>
            <Form.Group className="mb-2">
              <Form.Label>Description</Form.Label>
              <Form.Control
                placeholder="Enter target description"
                type="text"
                {...register('description', {
                  required: 'Description must not be empty.',
                  minLength: 1
                })}
              />
              {errors.description && <Form.Label className="text-danger">{errors.description.message}</Form.Label>}
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Priority</Form.Label>
              <Form.Select
                {...register('priority', {
                  required: 'Description must be selected.',
                  minLength: 1
                })}
              >
                <option></option>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </Form.Select>
              {errors.priority && <Form.Label className="text-danger">{errors.priority.message}</Form.Label>}
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Measure Type</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter measure type"
                {...register('messureType', {
                  required: 'Messure type must not be empty.',
                  minLength: 1
                })}
              />
              {errors.messureType && <Form.Label className="text-danger">{errors.messureType.message}</Form.Label>}
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Metric value</Form.Label>
              <Form.Control
                placeholder="Enter metric value"
                type="text"
                {...register('metricValue', {
                  required: 'Metric value must not be empty.',
                  minLength: 1
                })}
              />
              {errors.metricValue && <Form.Label className="text-danger">{errors.metricValue.message}</Form.Label>}
            </Form.Group>
          </Card>
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
