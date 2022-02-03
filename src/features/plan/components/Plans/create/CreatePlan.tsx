import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Col, Row, Container, Tab, Tabs, Form, Button, Accordion } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PLANS } from '../../../../../constants';
import { useAppDispatch } from '../../../../../store/hooks';
import { getLocationHierarchyList } from '../../../../location/api';
import { showLoader } from '../../../../reducers/loader';
import { createPlan, getInterventionTypeList, getPlanById } from '../../../api';
import Moment from 'moment';
import { useForm, Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select, { SingleValue } from 'react-select';
import { Goal, Action, ConditionModel } from '../../../providers/types';
import Item from './Goals/Items';
import { ConfirmDialog } from '../../../../../components/Dialogs';
import { toast } from 'react-toastify';

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
  const [currentFrom, setCurrentForm] = useState<any>();
  const { id } = useParams();

  const {
    register,
    handleSubmit,
    control,
    watch,
    resetField,
    formState: { errors },
    setValue,
    getValues
  } = useForm<RegisterValues>();

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
          getPlanById(id)
            .then(res => {
              setValue('effectivePeriod.start', Moment(res.effectivePeriod.start).toDate());
              setValue('effectivePeriod.end', Moment(res.effectivePeriod.end).toDate());
              setValue('name', res.name);
              setValue('title', res.title);
              setValue('locationHierarchy', res.locationHierarchy.identifier);
              setValue('interventionType', res.interventionType.identifier);
              setSelectedHierarchy({ value: res.locationHierarchy.identifier, label: res.locationHierarchy.name });
              setSelectedInterventionType({ value: res.interventionType.identifier, label: res.interventionType.name });
              let condition: ConditionModel = {
                entity: 'Person',
                entityProperties: 'Age',
                filterValue: '5',
                operator: '<',
              }
              let action: Action = {
                description: 'Register persons',
                formIdentifier: 'Person registration form',
                title: 'Register persons',
                reason: 'Reason',
                timingPeriod: {
                  start: Moment(res.effectivePeriod.start).toDate(),
                  end: Moment(res.effectivePeriod.end).toDate()
                },
                type: 'action',
                conditions: [condition]
              };
              let action1: Action = {
                description: 'Distribute drugs to eligible persons',
                formIdentifier: 'Drug distribution form',
                title: 'Distribute drugs',
                reason: 'Reason',
                timingPeriod: {
                  start: Moment(res.effectivePeriod.start).toDate(),
                  end: Moment(res.effectivePeriod.end).toDate()
                },
                type: 'action',
                conditions: []
              };
              let newGoal: Goal = {
                identifier: '1',
                actions: [action],
                description: 'Understand location demographics',
                priority: '',
                targets: []
              };
              let newGoal1: Goal = {
                identifier: '2',
                actions: [action1],
                description: 'Reduce impact of malaria',
                priority: '',
                targets: []
              };
              setGoalList([newGoal, newGoal1]);
            })
            .finally(() => dispatch(showLoader(false)));
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
  }, [dispatch, id, setValue]);

  const submitHandler = (formData: any) => {
    dispatch(showLoader(true));
    let mStart = Moment(formData.effectivePeriod.start);
    let mEnd = Moment(formData.effectivePeriod.end);
    formData.effectivePeriod.start = Moment(mStart).utc().add(mStart.utcOffset(), 'm');
    formData.effectivePeriod.end = Moment(mEnd).utc().add(mEnd.utcOffset(), 'm');
    if (goalList.length) {
      //formData.goals = goalList;
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

  const deleteGoal = (goalNumber: string) => {
    let newArr = goalList.filter(el => el.identifier !== goalNumber);
    setGoalList(newArr);
  };

  const closeHandler = (action: boolean) => {
    if (action) {
      dispatch(showLoader(true));
      createPlan(currentFrom)
        .then(_ => {
          navigate(PLANS);
        })
        .catch(err => toast.error(err.message !== undefined ? err.message : 'Server Error has occured!'))
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
            <Tabs className="mb-3" activeKey={activeTab} onSelect={tabName => setActiveTab(tabName ?? activeTab)}>
              <Tab eventKey="plan-details" title="Details">
                <Form.Group className="mb-2">
                  <Form.Label>Plan name</Form.Label>
                  <Form.Control
                    {...register('name', {
                      required: 'Plan name must not be empty',
                      pattern: {
                        value: new RegExp('^[^\\s]+([a-z0-9_.-])*$'),
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
                        value: new RegExp('^[^\\s]+[-a-zA-Z0-9\\s]+([-a-zA-Z0-9\\s]+)*$'),
                        message: "Plan title can't start with empty space."
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
                    rules={{required: 'Please selecet location hierarchy.', minLength: 1}}
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
                    rules={{required: 'Please selecet intervention type.', minLength: 1}}
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
              <Tab eventKey="create-goals" title="Goals">
                <Accordion defaultActiveKey="0" flush>
                  {goalList.map(el => {
                    return (
                      <Item
                        key={el.identifier}
                        goal={el}
                        planPeriod={getValues('effectivePeriod')}
                        deleteHandler={deleteGoal}
                      />
                    );
                  })}
                </Accordion>
                <Button
                  className="float-start mt-2 me-2"
                  onClick={() => {
                    let newGoal: Goal = {
                      identifier: (goalList.length + 1).toString(),
                      actions: [],
                      description: '',
                      priority: '',
                      targets: []
                    };
                    setGoalList([...goalList, newGoal]);
                  }}
                >
                  Create Goal
                </Button>
              </Tab>
            </Tabs>
            <Button
              onClick={() => {
                if (id) {
                  dispatch(showLoader(true));
                  setTimeout(() => {
                    dispatch(showLoader(false));
                    navigate(PLANS);
                  }, 2000);
                } else {
                  handleSubmit(submitHandler)();
                }
              }}
              className="float-end mt-2"
            >
              {id !== undefined ? 'Update plan' : 'Submit Plan'}
            </Button>
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
    </Container>
  );
};

export default CreatePlan;
