import React, { ChangeEvent, useState, useEffect } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import { WizardStepProps } from '../Wizard/Wizard';
import { useAppSelector } from '../../../../store/hooks';
import { getLocationHierarchyList, getGeographicLevelList } from '../../../location/api';
import { getInterventionTypeList } from '../../../plan/api';
import { toast } from 'react-toastify';

/* -------------------- Types -------------------- */
interface Options {
  value: string;
  label: string;
  nodeOrder?: string[];
}

interface RegisterValues {
  name: string;
  title: string;
  effectivePeriod: {
    start: Date;
    end: Date;
  };
  // locationHierarchy: string;
  interventionType: string;
  // hierarchyLevelTarget?: string;
}

const REGEX_TITLE_VALIDATION = /^[A-Za-z0-9\s-]+$/;

const CreateInstance: React.FC<WizardStepProps> = ({ onNext, onCancel, defaultValues }) => {
  const isDarkMode = useAppSelector((state: any) => state.darkMode.value);
  const [hierarchyList, setHierarchyList] = useState<Options[]>([]);
  const [interventionTypeList, setInterventionTypeList] = useState<Options[]>([]);
  const [geographicLevelList, setGeographicLevelList] = useState<any[]>([]);
  const [selectedHierarchy, setSelectedHierarchy] = useState<Options | null>(null);
  const [selectedIntervention, setSelectedIntervention] = useState<Options | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors }
  } = useForm<RegisterValues>({
    mode: 'onChange',
    defaultValues: {
      name: defaultValues?.name || '',
      title: defaultValues?.title || '',
      effectivePeriod: {
        start: defaultValues?.effectivePeriod?.start ? new Date(defaultValues.effectivePeriod.start) : undefined,
        end: defaultValues?.effectivePeriod?.end ? new Date(defaultValues.effectivePeriod.end) : undefined
      },
      interventionType: defaultValues?.interventionType || '',
      // hierarchyLevelTarget: defaultValues?.hierarchyLevelTarget || ''
    }
  });

  useEffect(() => {
    Promise.all([getLocationHierarchyList(0, 0, true), getInterventionTypeList(), getGeographicLevelList(0, 0)])
      .then(([locationHierarchyList, interventionTypeList, geoLevelList]) => {
        const hList = locationHierarchyList.content.map<Options>(el => ({
          label: el.name,
          value: el.identifier ?? '',
          nodeOrder: el.nodeOrder
        }));
        const iList = interventionTypeList.map<Options>(el => ({
          label: el.name,
          value: el.identifier
        }));

       
        setInterventionTypeList(iList);
        setGeographicLevelList(geoLevelList.content);

        if (defaultValues?.locationHierarchy) {
          setSelectedHierarchy(hList.find(opt => opt.value === defaultValues.locationHierarchy) || null);
        }
        if (defaultValues?.interventionType) {
          setSelectedIntervention(iList.find(opt => opt.value === defaultValues.interventionType) || null);
        }
      })
      .catch(err => toast.error(err));
  }, [defaultValues]);

  const onSubmit = (data: RegisterValues) => {
    // Pass data to next step
    onNext && onNext(data);
  };

  const populateNameHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setValue('name', e.target.value.replaceAll(' ', '-').toLowerCase());
  };

  const startDate = watch('effectivePeriod.start');

  /* ========================== UI ========================== */

  return (
    <Row
      className={`p-4 ${isDarkMode ? 'text-white' : 'bg-white'}`}
      style={isDarkMode ? { backgroundColor: '#282828' } : {}}
    >
      <Col md={8} className="">
        <Form onSubmit={handleSubmit(onSubmit)}>
          {/* Hidden Name */}
          <Form.Group className="mb-3 d-none">
            <Form.Control {...register('name')} />
          </Form.Group>

          {/* Title */}
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter plan title"
              // className={isDarkMode ? 'text-white border-secondary' : 'bg-light border-0'}
              // style={isDarkMode ? { backgroundColor: '#282828' } : {}}
              isInvalid={!!errors.title}
              {...register('title', {
                required: 'Title is required',
                minLength: {
                  value: 2,
                  message: 'Minimum 2 characters required'
                },
                maxLength: {
                  value: 80,
                  message: 'Maximum 80 characters allowed'
                },
                pattern: {
                  value: REGEX_TITLE_VALIDATION,
                  message: 'Only letters, numbers, spaces and hyphen allowed'
                }
              })}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                register('title').onChange(e);
                populateNameHandler(e);
              }}
            />
            <Form.Control.Feedback type="invalid">{errors.title?.message}</Form.Control.Feedback>
          </Form.Group>
          <Row>
            {/* Start Date */}
            <Col>
              <Form.Group className="mb-2">
                <Form.Label>Start Date</Form.Label>
                <Controller
                  control={control}
                  name="effectivePeriod.start"
                  rules={{
                    required: 'Start date is required'
                  }}
                  render={({ field }) => (
                    <DatePicker
                      selected={field.value}
                      onChange={field.onChange}
                      className={`form-control ${errors.effectivePeriod?.start ? 'is-invalid' : ''}`}
                      // className={`form-control ${isDarkMode ? 'text-white border-secondary' : 'bg-light border-0'} ${errors.effectivePeriod?.start ? 'is-invalid' : ''}`}
                      // style={isDarkMode ? { backgroundColor: '#282828' } : {}}
                      dateFormat="yyyy-MM-dd"
                      minDate={new Date()}
                      calendarClassName={isDarkMode ? 'bg-dark text-white' : ''}
                    />
                  )}
                />
                <div className="invalid-feedback d-block">{errors.effectivePeriod?.start?.message}</div>
              </Form.Group>
            </Col>

            {/* End Date */}
            <Col>
              <Form.Group className="mb-2">
                <Form.Label>End Date</Form.Label>
                <Controller
                  control={control}
                  name="effectivePeriod.end"
                  rules={{
                    required: 'End date is required',
                    validate: value => value > startDate || 'End date must be after start date'
                  }}
                  render={({ field }) => (
                    <DatePicker
                      selected={field.value}
                      onChange={field.onChange}
                      className={`form-control ${errors.effectivePeriod?.end ? 'is-invalid' : ''}`}
                      // className={`form-control ${ 'text-white border-secondary' : 'bg-light border-0'} ${errors.effectivePeriod?.end ? 'is-invalid' : ''}`}
                      // style={isDarkMode ? { backgroundColor: '#282828' } : {}}
                      dateFormat="yyyy-MM-dd"
                      minDate={startDate}
                      disabled={!startDate}
                      calendarClassName={isDarkMode ? 'bg-dark text-white' : ''}
                    />
                  )}
                />
                <div className="invalid-feedback d-block">{errors.effectivePeriod?.end?.message}</div>
              </Form.Group>
            </Col>
          </Row>
          {/* Location Hierarchy */}
          {/* <Form.Group className="mb-3">
            <Form.Label>Location Hierarchy</Form.Label>
            <Controller
              control={control}
              name="locationHierarchy"
              rules={{
                required: 'Hierarchy selection is required'
              }}
              render={({ field }) => (
                <Select
                  className="custom-react-select-container"
                  classNamePrefix="custom-react-select"
                  options={hierarchyList}
                  value={selectedHierarchy}
                  onChange={(val: any) => {
                    setSelectedHierarchy(val);
                    field.onChange(val?.value);
                  }}
                />
              )}
            />
            <div className="text-danger small mt-1">{errors.locationHierarchy?.message}</div>
          </Form.Group> */}

          {/* Intervention Type */}
          <Form.Group className="mb-3">
            <Form.Label>Intervention Type</Form.Label>
            <Controller
              control={control}
              name="interventionType"
              rules={{
                required: 'Intervention type is required'
              }}
              render={({ field }) => (
                <Select
                  className="custom-react-select-container"
                  classNamePrefix="custom-react-select"
                  options={interventionTypeList}
                  value={selectedIntervention}
                  onChange={(val: any) => {
                    setSelectedIntervention(val);
                    field.onChange(val?.value);
                  }}
                />
              )}
            />
            <div className="text-danger small mt-1">{errors.interventionType?.message}</div>
          </Form.Group>

          {/* Hierarchy Level Target (Conditional) */}
          {/* {selectedIntervention?.label?.toLowerCase().includes('lite') && (
            <Form.Group className="mb-3">
              <Form.Label>Hierarchy Level Target</Form.Label>
              <Controller
                control={control}
                name="hierarchyLevelTarget"
                rules={{
                  required: 'Hierarchy level target is required for Lite intervention'
                }}
                render={({ field }) => (
                  <Select
                    className="custom-react-select-container"
                    classNamePrefix="custom-react-select"
                    options={
                      selectedHierarchy?.nodeOrder
                        ?.filter(el => el !== 'structure')
                        .map((el: string) => {
                          const geoLevel = geographicLevelList.find(g => g.name === el);
                          return {
                            label: geoLevel ? geoLevel.title : el,
                            value: el
                          };
                        }) || []
                    }
                    value={selectedHierarchy?.nodeOrder
                      ?.filter(el => el !== 'structure')
                      .map((el: string) => {
                        const geoLevel = geographicLevelList.find(g => g.name === el);
                        return {
                          label: geoLevel ? geoLevel.title : el,
                          value: el
                        };
                      })
                      .find((opt: any) => opt.value === watch('hierarchyLevelTarget'))}
                    onChange={(val: any) => field.onChange(val?.value)}
                  />
                )}
              />
              <div className="text-danger small mt-1">{errors.hierarchyLevelTarget?.message}</div>
            </Form.Group>
          )} */}
          <hr className="my-3" />
          <div className="d-flex  justify-content-between mt-4">
            {/* Step 1 Cancel Button */}
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="">
              Next and Continue
            </Button>
          </div>
        </Form>
      </Col>
    </Row>
  );
};

export default CreateInstance;
