import React, { useState } from 'react';
import { Accordion, Form, Row, Col, Button, Table } from 'react-bootstrap';
import Actions from '../Actions';
import Condition from '../Conditions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Action, ConditionModel, Goal } from '../../../../../providers/types';

interface Props {
  goal: Goal;
  deleteHandler: (num: string) => void;
  planPeriod: {
    start: Date;
    end: Date;
  };
}

const Item = ({ goal, deleteHandler, planPeriod }: Props) => {
  const [show, setShow] = useState(false);
  const [showCondition, setShowCondition] = useState(false);
  const [actionsList, setActionsList] = useState<Action[]>(goal.actions);
  const [selectedAction, setSelectedAction] = useState<Action>();
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <Accordion.Item eventKey={goal.identifier} className="p-2">
      <Accordion.Header>Goal {goal.identifier}{goal.description !== "" ? (' - ' + goal.description) : ''}</Accordion.Header>
      <Accordion.Body>
        <Form.Group>
          <Row>
            <Col>
              <Form.Label className="mt-3">Description</Form.Label>
            </Col>
            <Col>
              <Button variant="secondary float-end" onClick={() => deleteHandler(goal.identifier)}>
                <FontAwesomeIcon icon="trash" />
              </Button>
            </Col>
          </Row>
          <Form.Control
            type="text"
            defaultValue={goal.description}
            placeholder="Enter goal description"
            onChange={e => {
              goal.description = e.target.value;
            }}
          />
        </Form.Group>
        <hr />
        <Row className="my-2">
          <Col>
            <h2>Actions</h2>
          </Col>
          <Col>
            <Button className="float-end" onClick={() => setShow(true)}>
              Create
            </Button>
          </Col>
        </Row>
        <Table bordered responsive hover>
          <thead className="border border-2">
            <tr>
              <th>Description</th>
              <th>Dates</th>
              <th>Form</th>
              <th>Conditions</th>
            </tr>
          </thead>
          <tbody>
            {actionsList.map((el, index) => (
              <tr key={index}>
                <td>{el.title}</td>
                <td>
                  {el.timingPeriod.start.toLocaleDateString()} - {el.timingPeriod.end.toLocaleDateString()}
                </td>
                <td>{el.formIdentifier}</td>
                <td className="text-center">
                  <Button onClick={() => {
                    setSelectedAction(el);
                    setSelectedIndex(index);
                    setShowCondition(true);
                    }}>Edit</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Actions
          show={show}
          planPeriod={planPeriod}
          closeHandler={(action?: Action) => {
            if (action !== undefined) {
              action.conditions = [];
              setActionsList([...actionsList, action]);
              goal.actions = [...actionsList, action];
            }
            setShow(false);
          }}
        />
        <Condition
          show={showCondition}
          conditionList={selectedAction?.conditions ?? []}
          closeHandler={(condition?: ConditionModel) => {
            if (condition !== undefined && selectedAction !== undefined) {
              actionsList[selectedIndex].conditions.push(condition);
            }
            setShowCondition(false);
          }}
        />
      </Accordion.Body>
    </Accordion.Item>
  );
};

export default Item;
