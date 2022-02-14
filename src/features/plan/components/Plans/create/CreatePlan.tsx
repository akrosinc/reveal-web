import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useEffect, useState } from 'react';
import { Col, Row, Container, Tab, Tabs, Form, Button, Accordion } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PLANS, REGEX_NAME_VALIDATION, REGEX_TITLE_VALIDATION } from '../../../../../constants';
import { useAppDispatch } from '../../../../../store/hooks';
import { getLocationHierarchyList } from '../../../../location/api';
import { showLoader } from '../../../../reducers/loader';
import { createPlan, deleteGoalById, getInterventionTypeList, getPlanById, updatePlanDetails } from '../../../api';
import Moment from 'moment';
import { useForm, Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select, { SingleValue } from 'react-select';
import { Goal } from '../../../providers/types';
import Item from './Goals/Items';
import { ConfirmDialog, ConfirmDialogService } from '../../../../../components/Dialogs';
import { toast } from 'react-toastify';
import CreateGoal from './Goals/Items/CreateGoal/CreateGoal';

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
        .finally(() => dispatch(showLoader(false)));
    },
    [dispatch, setValue]
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
          pending: 'Loading...',
          success: 'Plan updated successfully.',
          error: 'There was an error updating plan details'
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
      <ConfirmDialog closeHandler={giveAnswer} backdrop message={"Are you sure you want to delete goal with identifier: " + goalId + "?"} title="Delete Goal" />
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
        .catch(err => toast.error(err.message !== undefined ? err.message : 'Server Error occured!'))
        .finally(() => dispatch(showLoader(false)));
    } else {
      setShowConfirmDialog(false);
    }
  };

  return (
    <Container fluid className="my-4">
      <Link to={PLANS} className="btn btn-primary mb-4 px-4">
        <FontAwesomeIcon size="lg" icon="arrow-left" />
      </Link>
      <h2>{id !== undefined ? 'Plan details' : 'Create Plan'}</h2>
      <hr />
      <Row>
        <Col md={8} className="mx-auto">
          <Form>
            {activeTab === 'create-goals' && (
              <Button
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
              <Tab eventKey="plan-details" title="Details">
                <Form.Group className="mb-2">
                  <Form.Label>Plan name</Form.Label>
                  <Form.Control
                    {...register('name', {
                      required: 'Plan name must not be empty',
                      pattern: {
                        value: REGEX_NAME_VALIDATION,
                        message: 'Plan name containts unsupported characters.'
                      }
                    })}
                    type="name"
                    placeholder="Enter plan name"
                  />
                  {errors.name && <Form.Label className="text-danger">{errors.name.message}</Form.Label>}
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Plan title</Form.Label>
                  <Form.Control
                    {...register('title', {
                      required: 'Plan title must not be empty.',
                      minLength: 1,
                      pattern: {
                        value: REGEX_TITLE_VALIDATION,
                        message: 'Plan title containts unsupported characters.'
                      }
                    })}
                    type="text"
                    placeholder="Enter plan title"
                  />
                  {errors.title && <Form.Label className="text-danger">{errors.title.message}</Form.Label>}
                </Form.Group>
                <Row>
                  <Col>
                    <Form.Group className="mb-2">
                      <Form.Label>Start date</Form.Label>
                      <Controller
                        control={control}
                        name="effectivePeriod.start"
                        rules={{ required: 'Start date must be selected!' }}
                        render={({ field: { onChange, value } }) => (
                          <DatePicker
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
                      <Form.Label>End date</Form.Label>
                      <Controller
                        control={control}
                        name="effectivePeriod.end"
                        rules={{
                          required: 'End date must be selected!'
                        }}
                        render={({ field: { onChange, value } }) => (
                          <DatePicker
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
                  <Form.Label>Select Hierarchy</Form.Label>
                  <Controller
                    control={control}
                    name="locationHierarchy"
                    rules={{ required: 'Please selecet location hierarchy.', minLength: 1 }}
                    render={({ field }) => (
                      <Select
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
                  <Form.Label>Select Intervention Type</Form.Label>
                  <Controller
                    control={control}
                    rules={{ required: 'Please selecet intervention type.', minLength: 1 }}
                    name="interventionType"
                    render={({ field }) => (
                      <Select
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
              <Tab eventKey="create-goals" title="Goals" style={{ minHeight: '406px' }}>
                <Accordion defaultActiveKey="0" flush>
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
              disabled={!isDirty}
                onClick={() => {
                  handleSubmit(updatePlanHandler)();
                }}
                className="float-end mt-2"
              >
                Update details
              </Button>
            )}
            {id === undefined && (
              <Button
                onClick={() => {
                  handleSubmit(createPlanHandler)();
                }}
                className="float-end mt-2"
              >
                Create plan
              </Button>
            )}
          </Form>
        </Col>
      </Row>
      {showConfirmDialog && (
        <ConfirmDialog
          backdrop={false}
          closeHandler={closeHandler}
          message="You are creating a plan without any goals set. 
          Without a goal plan will be created as draft and you won't be able to activate it until you add at least one goal."
          title="Create Plan"
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
