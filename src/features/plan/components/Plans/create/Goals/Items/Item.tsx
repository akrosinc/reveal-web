import React, { useEffect, useState } from 'react';
import { Accordion, Form, Row, Col, Button, Table } from 'react-bootstrap';
import Actions from '../Actions';
import Condition from '../Conditions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Action, ConditionModel, Goal } from '../../../../../providers/types';
import { createAction, deleteAction, updateAction } from '../../../../../api';
import { toast } from 'react-toastify';
import { showLoader } from '../../../../../../reducers/loader';
import { useAppDispatch } from '../../../../../../../store/hooks';

interface Props {
  goal: Goal;
  editGoalHandler: (goal?: Goal) => void;
  deleteHandler: (num: string) => void;
  planPeriod: {
    start: Date;
    end: Date;
  };
  planId?: string;
  loadData: () => void;
}

const Item = ({ goal, deleteHandler, planPeriod, editGoalHandler, planId, loadData }: Props) => {
  const [show, setShow] = useState(false);
  const [showCondition, setShowCondition] = useState(false);
  const [actionsList, setActionsList] = useState<Action[]>(goal.actions);
  const [selectedAction, setSelectedAction] = useState<Action>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dispatch = useAppDispatch();

  //rerender actions if goal data changes
  useEffect(() => {
    setActionsList(goal.actions);
  }, [goal]);

  return (
    <Accordion.Item eventKey={goal.identifier} className="p-2">
      <Accordion.Header>Goal - {goal.description}</Accordion.Header>
      <Accordion.Body>
        <Row>
          <Col>
            <Form.Label className="mt-3">Description</Form.Label>
          </Col>
          <Col>
            <Button
              variant="primary"
              className="float-end ms-2"
              onClick={() => {
                editGoalHandler(goal);
              }}
            >
              <FontAwesomeIcon className='ms-1' icon="edit" />
            </Button>
            <Button
              variant="primary"
              className="float-end"
              onClick={() => {
                deleteHandler(goal.identifier);
              }}
            >
              <FontAwesomeIcon className='mx-1' icon="trash" />
            </Button>
          </Col>
        </Row>
        <Form.Control type="text" readOnly={true} value={goal.description} />
        <Form.Label className="mt-3">Priority</Form.Label>
        <Form.Control type="text" readOnly={true} value={goal.priority} />
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
              <tr
                key={index}
                onClick={() => {
                  setShow(true);
                  setSelectedAction(el);
                }}
              >
                <td>{el.title}</td>
                <td>
                  {el.timingPeriod.start} - {el.timingPeriod.end}
                </td>
                <td>{el.formIdentifier}</td>
                <td className="text-center">
                  <Button
                    onClick={() => {
                      setSelectedAction(el);
                      setSelectedIndex(index);
                      setShowCondition(true);
                    }}
                  >
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        {show && (
          <Actions
            planPeriod={planPeriod}
            selectedAction={selectedAction}
            closeHandler={(action?: Action, isDelete?: boolean) => {
              if (action !== undefined) {
                action.type = action.identifier ? 'UPDATE' : 'CREATE'; 
                //check if its new plan or update of an existing plan
                if (planId) {
                  dispatch(showLoader(true));
                  if (isDelete) {
                    toast
                      .promise(deleteAction(action.identifier, planId, goal.identifier), {
                        pending: 'Loading...',
                        success: 'Action deleted successfully.',
                        error: 'There was an error deleting action.'
                      })
                      .finally(() => {
                        dispatch(showLoader(false));
                        loadData();
                      });
                  } else {
                    // if selected action is not undefined updated selected action otherwise create new
                    if (selectedAction) {
                      toast
                        .promise(updateAction(action, planId, goal.identifier), {
                          pending: 'Loading...',
                          success: 'Action updated successfully.',
                          error: 'There was an error updating action.'
                        })
                        .finally(() => {
                          dispatch(showLoader(false));
                          loadData();
                        });
                    } else {
                      toast
                        .promise(createAction(action, planId, goal.identifier), {
                          pending: 'Loading...',
                          success: 'Action created successfully.',
                          error: 'There was an error creating action.'
                        })
                        .finally(() => {
                          dispatch(showLoader(false));
                          loadData();
                        });
                    }
                  }
                } else {
                  setActionsList([...actionsList, action]);
                  goal.actions = [...actionsList, action];
                }
              }
              setShow(false);
              setSelectedAction(undefined);
            }}
          />
        )}
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
