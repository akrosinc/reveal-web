import React, { useState } from 'react';
import { Accordion, Button, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Goal } from '../../../plan/providers/types';
import Item from './Goals';
import CreateGoal from './Goals/CreateGoal/CreateGoal';
import { useTranslation } from 'react-i18next';
import { WizardStepProps } from '../Wizard/Wizard';

const AddGoalDetails: React.FC<WizardStepProps> = ({ onNext, onBack, defaultValues }) => {
  // Initialize from defaultValues if present
  const [goalList, setGoalList] = useState<Goal[]>(defaultValues?.goals || []);
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
    <div className="p-4 bg-white">
      <Row className="align-items-center">
        <Col>
          <h3>{t('planPage.goals')}</h3>
        </Col>
      </Row>
      <hr className="my-3" />
      <Row>
        <Col md={12} className="">
          <Button id="add-goal-button" className="float-end mb-3" onClick={() => createGoalHandler()}>
            <FontAwesomeIcon icon="plus" className="me-2" />
            {t('buttons.add')}
          </Button>

          <Accordion id="plan-card" defaultActiveKey="0" flush className="w-100 mb-3">
            {goalList.length === 0 && <div className="text-center p-3">No goals added yet.</div>}
            {goalList.map(el => {
              return (
                <Item
                  planId={undefined}
                  loadData={() => {
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
      <div className="d-flex justify-content-between mt-4 pt-3 border-top">
        <Button variant="secondary" className="px-4 py-2" onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" className="px-4 py-2" onClick={() => onNext && onNext({ goals: goalList })}>
          Next and Continue
        </Button>
      </div>

      {showCreateGoal && (
        <CreateGoal
          planId={undefined}
          goalList={goalList} // Passed for reference if needed
          currentGoal={currentGoal}
          closeHandler={() => {
            setShowCreateGoal(false);
          }}
          show={showCreateGoal}
          onSave={saveGoalHandler}
        />
      )}
    </div>
  );
}

export default AddGoalDetails;
