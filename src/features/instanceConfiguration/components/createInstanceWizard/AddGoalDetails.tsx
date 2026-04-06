import React, { useState } from 'react';
import { Accordion, Button, Row, Col, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Goal } from '../../../plan/providers/types';
import Item from './Goals';
import CreateGoal from './Goals/CreateGoal/CreateGoal';
import { useTranslation } from 'react-i18next';
import { WizardStepProps } from '../Wizard/Wizard';
import { useAppSelector } from '../../../../store/hooks';
import { deleteGoalById } from '../../../plan/api';
import { ConfirmDialog, ConfirmDialogService } from '../../../../components/Dialogs';

const AddGoalDetails: React.FC<WizardStepProps> = ({ onNext, onBack, defaultValues }) => {
  // Initialize from defaultValues if present
  const isDarkMode = useAppSelector((state: any) => state.darkMode.value);
  const [goalList, setGoalList] = useState<Goal[]>(defaultValues?.goals || []);
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [currentGoal, setCurrentGoal] = useState<Goal>();
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const planId = defaultValues?.planId || defaultValues?.id;

  // Use plan period from previous step if available
  const planPeriod = {
    start: defaultValues?.effectivePeriod?.start ? new Date(defaultValues.effectivePeriod.start) : new Date(),
    end: defaultValues?.effectivePeriod?.end ? new Date(defaultValues.effectivePeriod.end) : new Date(new Date().setFullYear(new Date().getFullYear() + 1))
  };

  const createGoalHandler = (goal?: Goal) => {
    setCurrentGoal(goal);
    setShowCreateGoal(true);
  };

  const deleteGoal = (goalId: string) => {
    ConfirmDialogService(({ giveAnswer }) => (
      <ConfirmDialog
        closeHandler={giveAnswer}
        backdrop
        message={t('planPage.deleteGoalMessage') + goalId + '?'}
        title={t('planPage.deleteGoal')}
        isDarkMode={isDarkMode}
      />
    )).then(res => {
      if (res) {
        const newArr = goalList.filter(el => el.identifier !== goalId);
        setGoalList(newArr);
      }
    });
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
    setError(null); // Clear error on successful add
  };

  const handleNext = () => {
    if (goalList.length === 0) {
      setError('At least one goal must be added before continuing.');
      return;
    }

    const hasActionWithValue = goalList.some((goal) =>
      goal.actions?.length >= 1
    );

    if (!hasActionWithValue) {
      setError('At least one action should be selected with value.');
      return;
    }

    onNext && onNext({ goals: goalList });
  };

  return (
    <div className={`p-4 ${isDarkMode ? 'text-white' : 'bg-white'}`}
      style={isDarkMode ? { backgroundColor: '#282828' } : {}}>
      <Row className="align-items-center">
        <Col md={8}>
          <div className="d-flex justify-content-between align-items-center">
            <h3>{t('planPage.goals')}</h3>
            {goalList?.length === 0 && <Button
              id="add-goal-button "
              style={{ height: 20, width: 20 }}
              className="mb-3 rounded-circle d-flex align-items-center justify-content-center"
              onClick={() => createGoalHandler()}
            >
              +
              {/* <FontAwesomeIcon icon="plus" className="" /> */}
              {/* {t('buttons.add')} */}
            </Button>}
          </div>
          <hr className="my-3" />
        </Col>
      </Row>

      <Row>
        <Col md={8} className="">
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          <Accordion id="plan-card" defaultActiveKey="0" flush className="w-100 mb-3">
            {goalList.length === 0 && <div className="text-center p-3">No goals added yet.</div>}
            {goalList.map(el => {
              return (
                <Item
                  planId={planId}
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
          <hr className="my-3" />
          <div className="d-flex justify-content-between mt-4 ">
            <Button
              variant="secondary"
              className="px-4 py-2"
              onClick={() => onBack({ goals: goalList })}
            >
              Back
            </Button>
            <Button variant="primary" className="px-4 py-2" onClick={handleNext}>
              Next and Continue
            </Button>
          </div>
        </Col>
      </Row>

      {showCreateGoal && (
        <CreateGoal
          planId={planId}
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
};

export default AddGoalDetails;
