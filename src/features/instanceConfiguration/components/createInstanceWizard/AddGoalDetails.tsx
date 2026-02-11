import React, { useState } from 'react';
import { Accordion, Button, Container, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Goal } from '../../../plan/providers/types';
import Item from './Goals';
import CreateGoal from './Goals/CreateGoal/CreateGoal';
import { useTranslation } from 'react-i18next';

export default function AddGoalDetails() {
  const [goalList, setGoalList] = useState<Goal[]>([]);
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [currentGoal, setCurrentGoal] = useState<Goal>();
  const { t } = useTranslation();

  // Mock plan period for static data
  const planPeriod = {
    start: new Date(),
    end: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
  };

  const createGoalHandler = (goal?: Goal) => {
    setCurrentGoal(goal);
    setShowCreateGoal(true);
  };

  const deleteGoal = (goalId: string) => {
    if (window.confirm(t('planPage.deleteGoalMessage') + goalId + '?')) {
      const newArr = goalList.filter(el => el.identifier !== goalId);
      setGoalList(newArr);
    }
  };

  const saveGoalHandler = (savedGoal: Goal) => {
    // Check if goal already exists (update) or is new (add)
    const existingIndex = goalList.findIndex(g => g.identifier === savedGoal.identifier);
    if (existingIndex >= 0) {
      const newGoals = [...goalList];
      newGoals[existingIndex] = savedGoal;
      setGoalList(newGoals);
    } else {
      setGoalList([...goalList, savedGoal]);
    }
  };

  return (
    <>
      <Row className="mt-3 align-items-center">
        <Col>
          <h3>{t('planPage.goals')}</h3>
        </Col>
      </Row>
      <hr className="my-3" />
      <Row>
        <Col md={8} className="">
          <Button id="add-goal-button" className="float-end mb-3" onClick={() => createGoalHandler()}>
            <FontAwesomeIcon icon="plus" className="me-2" />
            {t('buttons.add')}
          </Button>

          <Accordion id="plan-card" defaultActiveKey="0" flush className="w-100">
            {goalList.length === 0 && <div className="text-center p-3">No goals added yet.</div>}
            {goalList.map(el => {
              return (
                <Item
                  planId={undefined}
                  loadData={() => {
                    // refreshing state is handled by passing state setter or relying on mutation + refetch,
                    // but here we rely on local state updates in Item/Actions which might need a force update if they mutate deep
                    setGoalList([...goalList]);
                  }}
                  editGoalHandler={createGoalHandler}
                  key={el.identifier}
                  goal={el}
                  planPeriod={planPeriod}
                  deleteHandler={deleteGoal}
                />
              );
            })}
          </Accordion>
        </Col>
      </Row>
      <Col md={8} className="">
        <div className="d-flex  justify-content-between">
          <Button variant="secondary" className="float-end mt-3" onClick={() => console.log('Cancel clicked')}>
            Cancel
          </Button>
          <Button type="submit" className="float-end mt-3">
            Next and Continue
          </Button>
        </div>
      </Col>
      {showCreateGoal && (
        <CreateGoal
          planId={undefined}
          goalList={goalList} // Passed for reference if needed by component logic, though we prefer onSave
          currentGoal={currentGoal}
          closeHandler={() => {
            setShowCreateGoal(false);
          }}
          show={showCreateGoal}
          onSave={saveGoalHandler}
        />
      )}
    </>
  );
}
