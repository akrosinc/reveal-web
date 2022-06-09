import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useEffect, useState } from 'react';
import { Col, Row, Container, Tab, Tabs, Form, Button, Accordion } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { PLANS, REGEX_TITLE_VALIDATION, UNEXPECTED_ERROR_STRING } from '../../../../constants';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { getLocationHierarchyList } from '../../../location/api';
import { showLoader } from '../../../reducers/loader';
import { createPlan, deleteGoalById, getInterventionTypeList, getPlanById, updatePlanDetails } from '../../api';
import Moment from 'moment';
import { useForm, Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select, { SingleValue } from 'react-select';
import { Goal } from '../../providers/types';
import Item from './Goals';
import { ConfirmDialog, ConfirmDialogService } from '../../../../components/Dialogs';
import { toast } from 'react-toastify';
import CreateGoal from './Goals/CreateGoal/CreateGoal';
import { useTranslation } from 'react-i18next';

interface Options {
  value: string;
  label: string;
}

interface RegisterValues {
  name: string;
  title: string;
  effectivePeriod: {
    start: Date;
    end: Date;
  };
  locationHierarchy: string;
  interventionType: string;
}

const CreatePlan = () => {
  const [activeTab, setActiveTab] = useState('plan-details');
  const [hierarchyList, setHierarchyList] = useState<Options[]>([]);
  const [interventionTypeList, setInterventionTypeList] = useState<Options[]>([]);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [selectedHierarchy, setSelectedHierarchy] = useState<SingleValue<Options>>();
  const [selectedInterventionType, setSelectedInterventionType] = useState<SingleValue<Options>>();
  const [goalList, setGoalList] = useState<Goal[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [currentGoal, setCurrentGoal] = useState<Goal>();
  const [currentFrom, setCurrentForm] = useState<any>();
  const { id } = useParams();
  const { t } = useTranslation();
  const isDarkMode = useAppSelector(state => state.darkMode.value);

  const {
    register,
    handleSubmit,
    control,
    watch,
    resetField,
    formState: { errors, isDirty },
    trigger,
    setValue,
    getValues
  } = useForm<RegisterValues>();

  const loadPlan = useCallback(
    (planId: string) => {
      getPlanById(planId)
        .then(res => {
          setValue('effectivePeriod.start', Moment(res.effectivePeriod.start).toDate());
          setValue('effectivePeriod.end', Moment(res.effectivePeriod.end).toDate());
          setValue('name', res.name);
          setValue('title', res.title);
          setValue('locationHierarchy', res.locationHierarchy.identifier);
          setValue('interventionType', res.interventionType.identifier);
          setGoalList(res.goals);
          setSelectedHierarchy({ value: res.locationHierarchy.identifier, label: res.locationHierarchy.name });
          setSelectedInterventionType({ value: res.interventionType.identifier, label: res.interventionType.name });
        })
        .catch(err => {
          toast.error(err.message ? err.message : UNEXPECTED_ERROR_STRING);
          navigate(PLANS);
        })
        .finally(() => dispatch(showLoader(false)));
    },
    [dispatch, setValue, navigate]
  );

  useEffect(() => {
    dispatch(showLoader(true));
    Promise.all([getLocationHierarchyList(0, 0, true), getInterventionTypeList()])
      .then(async ([locationHierarchyList, interventionTypeList]) => {
        setHierarchyList(
          locationHierarchyList.content.map<Options>(el => {
            return {
              label: el.name,
              value: el.identifier ?? ''
            };
          })
        );
        setInterventionTypeList(
          interventionTypeList.map<Options>(el => {
            return {
              label: el.name,
              value: el.identifier
            };
          })
        );
        if (id) {
          // id exists show plan details
          loadPlan(id);
        } else {
          dispatch(showLoader(false));
        }
      })
      .catch(err => {
        if (err.message) {
          toast.error(err.message);
        } else {
          toast.error(err.toString());
        }
        dispatch(showLoader(false));
      });
  }, [dispatch, id, loadPlan]);

  const createPlanHandler = (formData: any) => {
    dispatch(showLoader(true));
    let mStart = Moment(formData.effectivePeriod.start);
    let mEnd = Moment(formData.effectivePeriod.end);
    formData.effectivePeriod.start = Moment(mStart).utc().add(mStart.utcOffset(), 'm').format('yyyy-MM-DD');
    formData.effectivePeriod.end = Moment(mEnd).utc().add(mEnd.utcOffset(), 'm').format('yyyy-MM-DD');
    if (goalList.length) {
      formData.goals = goalList;
      createPlan(formData).then(_ => {
        dispatch(showLoader(false));
        navigate(PLANS);
      });
    } else {
      dispatch(showLoader(false));
      setCurrentForm(formData);
      setShowConfirmDialog(true);
    }
  };

  const updatePlanHandler = (form: any) => {
    if (id !== undefined) {
      dispatch(showLoader(true));
      toast
        .promise(updatePlanDetails(form, id), {
          pending: t('toast.loading'),
          success: t('planPage.planUpdatedMessage'),
          error: t('planPage.planUpdateErrorMessage')
        })
        .finally(() => dispatch(showLoader(false)));
    }
  };

  const createGoalHandler = (goal?: Goal) => {
    //we are updating a plan add goal to existing plan by id
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
        if (id) {
          // we are in edit mode call api to delete goal
          dispatch(showLoader(true));
          deleteGoalById(goalId, id).then(_ => {
            loadPlan(id);
            dispatch(showLoader(false));
          });
        } else {
          let newArr = goalList.filter(el => el.identifier !== goalId);
          setGoalList(newArr);
        }
      }
    });
  };

  const closeHandler = (action: boolean) => {
    if (action) {
      dispatch(showLoader(true));
      createPlan(currentFrom)
        .then(_ => {
          navigate(PLANS);
        })
        .catch(err => toast.error(err.message !== undefined ? err.message : t('toast.unexpectedError')))
        .finally(() => dispatch(showLoader(false)));
    } else {
      setShowConfirmDialog(false);
    }
  };

  const populateNameHandler = (e: any) => {
    setValue('name', e.target.value.replaceAll(' ', '-').toLowerCase());
  };

  return (
    <Container fluid>
      <Row className="mt-3 align-items-center">
        <Col md={3}>
          <Button
            id="back-button"
            onClick={() => {
              if (isDirty) {
                ConfirmDialogService(({ giveAnswer }) => (
                  <ConfirmDialog
                    closeHandler={giveAnswer}
                    backdrop
                    message={id ? t('planPage.planUpdateDiscardMessage') : t('planPage.planDiscardMessage')}
                    title={t('confirmDialog.discardChanges')}
                    isDarkMode={isDarkMode}
                  />
                )).then(res => {
                  if (res) {
                    navigate(PLANS);
                  }
                });
              } else {
                navigate(PLANS);
              }
            }}
            className="btn btn-primary"
          >
            <FontAwesomeIcon icon="arrow-left" className="me-2" /> {t('planPage.title')}
          </Button>
        </Col>
        <Col md={6} className="text-center">
          <h2 className="m-0">{id !== undefined ? t('planPage.planDetails') : t('planPage.createPlan')}</h2>
        </Col>
      </Row>
      <hr className="my-3" />
      <Row>
        <Col md={8} className="mx-auto">
          <Form>
            {activeTab === 'create-goals' && (
              <Button
                id="add-goal-button"
                className="float-end"
                style={{ marginLeft: '-45px' }}
                onClick={() => {
                  createGoalHandler();
                }}
              >
                <FontAwesomeIcon icon="plus" />
              </Button>
            )}
            <Tabs
              id="plans"
              className="mb-3"
              activeKey={activeTab}
              onSelect={tabName => {
                if (activeTab === 'plan-details') {
                  if (tabName === 'create-goals') {
                    trigger().then(value => {
                      if (value) {
                        setActiveTab(tabName);
                      }
                    });
                  }
                } else {
                  setActiveTab('plan-details');
                }
              }}
            >
              <Tab eventKey="plan-details" title={t('planPage.details')}>
                <Form.Group className="mb-2" style={{ display: 'none' }}>
                  <Form.Label>Plan name</Form.Label>
                  <Form.Control
                    id="plan-name-input"
                    {...register('name')}
                    type="name"
                    readOnly={true}
                    placeholder="Enter plan name"
                  />
                  {errors.name && <Form.Label className="text-danger">{errors.name.message}</Form.Label>}
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>{t('planPage.planForm.title')}</Form.Label>
                  <Form.Control
                    id="plan-title-input"
                    {...register('title', {
                      required: t('planPage.planForm.titleError') as string,
                      minLength: 1,
                      pattern: {
                        value: REGEX_TITLE_VALIDATION,
                        message: t('planPage.planForm.titleErrorRegex') as string
                      }
                    })}
                    type="text"
                    placeholder="Enter plan title"
                    onChange={populateNameHandler}
                  />
                  {errors.title && <Form.Label className="text-danger">{errors.title.message}</Form.Label>}
                </Form.Group>
                <Row>
                  <Col>
                    <Form.Group className="mb-2">
                      <Form.Label>{t('planPage.planForm.startDate')}</Form.Label>
                      <Controller
                        control={control}
                        name="effectivePeriod.start"
                        rules={{ required: t('planPage.planForm.startDateError') as string }}
                        render={({ field: { onChange, value } }) => (
                          <DatePicker
                            id="start-date-picker"
                            placeholderText="Select date"
                            onChange={e => {
                              resetField('effectivePeriod.end');
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
                      {errors.effectivePeriod?.start && (
                        <Form.Label className="text-danger">{errors.effectivePeriod?.start.message}</Form.Label>
                      )}
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-2">
                      <Form.Label>{t('planPage.planForm.endDate')}</Form.Label>
                      <Controller
                        control={control}
                        name="effectivePeriod.end"
                        rules={{
                          required: t('planPage.planForm.endDateError') as string
                        }}
                        render={({ field: { onChange, value } }) => (
                          <DatePicker
                            id="end-date-picker"
                            placeholderText="Select date"
                            onChange={onChange}
                            selected={value}
                            className="form-control"
                            dropdownMode="select"
                            preventOpenOnFocus
                            showPopperArrow={false}
                            popperPlacement="bottom-end"
                            dateFormat="yyyy-MM-dd"
                            minDate={watch('effectivePeriod.start')}
                            disabled={
                              watch('effectivePeriod.start') === null || watch('effectivePeriod.start') === undefined
                            }
                          />
                        )}
                      />
                      {errors.effectivePeriod?.end && (
                        <Form.Label className="text-danger">{errors.effectivePeriod?.end.message}</Form.Label>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-2">
                  <Form.Label>{t('planPage.planForm.selectHierarchy')}</Form.Label>
                  <Controller
                    control={control}
                    name="locationHierarchy"
                    rules={{ required: t('planPage.planForm.selectHierarchyError') as string, minLength: 1 }}
                    render={({ field }) => (
                      <Select
                        className="custom-react-select-container"
                        classNamePrefix="custom-react-select"
                        id="hierarchy-select"
                        menuPosition="fixed"
                        options={hierarchyList}
                        value={selectedHierarchy}
                        onChange={selected => {
                          setSelectedHierarchy(selected);
                          field.onChange(selected?.value);
                        }}
                      />
                    )}
                  />
                  {errors.locationHierarchy && (
                    <Form.Label className="text-danger">{errors.locationHierarchy.message}</Form.Label>
                  )}
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label>{t('planPage.planForm.selectInterventionType')}</Form.Label>
                  <Controller
                    control={control}
                    rules={{ required: t('planPage.planForm.selectInterventionTypeError') as string, minLength: 1 }}
                    name="interventionType"
                    render={({ field }) => (
                      <Select
                        className="custom-react-select-container"
                        classNamePrefix="custom-react-select"
                        id="intervetion-type-select"
                        menuPosition="fixed"
                        options={interventionTypeList}
                        value={selectedInterventionType}
                        onChange={selected => {
                          setSelectedInterventionType(selected);
                          field.onChange(selected?.value);
                        }}
                      />
                    )}
                  />
                  {errors.interventionType && (
                    <Form.Label className="text-danger">{errors.interventionType.message}</Form.Label>
                  )}
                </Form.Group>
              </Tab>
              <Tab eventKey="create-goals" title={t('planPage.goals')} style={{ minHeight: '406px' }}>
                <Accordion id="plan-card" defaultActiveKey="0" flush>
                  {goalList.map(el => {
                    return (
                      <Item
                        planId={id}
                        loadData={() => {
                          if (id) {
                            loadPlan(id);
                          }
                        }}
                        editGoalHandler={createGoalHandler}
                        key={el.identifier}
                        goal={el}
                        planPeriod={getValues('effectivePeriod')}
                        deleteHandler={deleteGoal}
                      />
                    );
                  })}
                </Accordion>
              </Tab>
            </Tabs>
            {id !== undefined && activeTab === 'plan-details' && (
              <Button
                id="update-details-button"
                disabled={!isDirty}
                onClick={() => {
                  handleSubmit(updatePlanHandler)();
                }}
                className="float-end mt-2"
              >
                {t('planPage.updateDetails')}
              </Button>
            )}
            {id === undefined && (
              <Button
                id="create-plan-button"
                onClick={() => {
                  handleSubmit(createPlanHandler)();
                }}
                className="float-end mt-2"
              >
                {t('planPage.createPlan')}
              </Button>
            )}
          </Form>
        </Col>
      </Row>
      {showConfirmDialog && (
        <ConfirmDialog
          backdrop={false}
          closeHandler={closeHandler}
          message={t('planPage.noGoalMessage')}
          title={t('planPage.createPlan')}
          isDarkMode={isDarkMode}
        />
      )}
      {showCreateGoal && (
        <CreateGoal
          planId={id}
          goalList={goalList}
          currentGoal={currentGoal}
          closeHandler={() => {
            setShowCreateGoal(false);
            if (id) {
              loadPlan(id);
            }
          }}
          show={showCreateGoal}
        />
      )}
    </Container>
  );
};

export default CreatePlan;
