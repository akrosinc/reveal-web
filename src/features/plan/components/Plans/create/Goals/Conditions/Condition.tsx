import React, { useEffect, useState } from 'react';
import { Button, Form, Modal, Table, Accordion } from 'react-bootstrap';
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
  const [selectedEntity, setSelectedEntity] = useState('');

  const submitHandler = (formData: any) => {
    closeHandler(formData);
  };

  useEffect(() => {
    reset();
  }, [show, reset]);

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
              onChange={e => setSelectedEntity(e.target.value)}
            >
              <option></option>
              <option>Person</option>
              <option>Location</option>
            </Form.Select>
            {errors.entity && <Form.Label className="text-danger">{errors.entity.message}</Form.Label>}
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Entity Properties</Form.Label>
            <Form.Select
              placeholder="Enter entity Properties"
              {...register('entityProperties', {
                required: 'Entity properties must not be empty.',
                minLength: 1
              })}
            >
              <option></option>
              {selectedEntity === 'Person' ? (
                <option>Age</option>
              ) : selectedEntity === 'Location' ? (
                <option>Population</option>
              ) : null}
            </Form.Select>
            {errors.entityProperties && (
              <Form.Label className="text-danger">{errors.entityProperties.message}</Form.Label>
            )}
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Operator</Form.Label>
            <Form.Select
              placeholder="Enter operator ( <, <=, >, >=, = )"
              {...register('operator', {
                required: 'Operator field must be selected.',
                minLength: { value: 1, message: 'Operator field must be selected.' },
                maxLength: { value: 2, message: 'Enter only operator ( <, <=, >, >=, = )' }
              })}
            >
              <option></option>
              <option>{'<'}</option>
              <option>{'<='}</option>
              <option>{'>'}</option>
              <option>{'>='}</option>
              <option>{'='}</option>
            </Form.Select>
            {errors.operator && <Form.Label className="text-danger">{errors.operator.message}</Form.Label>}
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Filter value</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter filter value"
              {...register('filterValue', {
                required: 'Filter value must not be empty.',
                minLength: 1
              })}
            />
            {errors.filterValue && <Form.Label className="text-danger">{errors.filterValue.message}</Form.Label>}
          </Form.Group>
          <Accordion className="mt-4">
            <Accordion.Item eventKey="0">
              <Accordion.Header>Target</Accordion.Header>
              <Accordion.Body>
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
                  <br />
                  <div className="form-check-inline">
                    <input
                      {...register('messureType', {
                        required: 'Messure type must be selected.'
                      })}
                      className="form-check-input"
                      type="radio"
                      name="flexRadioDefault"
                      id="flexRadioDefault1"
                    />
                    <label className="form-check-label ms-2">Percentage</label>
                  </div>
                  <div className="form-check-inline">
                    <input
                      {...register('messureType', {
                        required: 'Messure type must be selected.'
                      })}
                      className="form-check-input"
                      type="radio"
                      name="flexRadioDefault"
                      id="flexRadioDefault2"
                    />
                    <label className="form-check-label ms-2">Count</label>
                  </div>
                  <br />
                  {errors.messureType && <Form.Label className="text-danger">{errors.messureType.message}</Form.Label>}
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Metric value</Form.Label>
                  <Form.Control
                    placeholder="Enter metric value"
                    type="number"
                    {...register('metricValue', {
                      required: 'Metric value must not be empty.',
                      minLength: 1,
                      valueAsNumber: true
                    })}
                  />
                  {errors.metricValue && <Form.Label className="text-danger">{errors.metricValue.message}</Form.Label>}
                </Form.Group>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
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
