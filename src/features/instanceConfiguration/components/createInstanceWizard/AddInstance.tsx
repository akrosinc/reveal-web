import React, { ChangeEvent, useState, useEffect } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import { WizardStepProps } from '../Wizard/Wizard';
import { useAppSelector } from '../../../../store/hooks';
// import { getLocationHierarchyList, getGeographicLevelList } from '../../../location/api';
// import { getInterventionTypeList } from '../../../plan/api';
// import { toast } from 'react-toastify';
// import { set } from 'lodash';

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
}

const REGEX_TITLE_VALIDATION = /^[A-Za-z0-9\s-]+$/;

const CreateInstance: React.FC<WizardStepProps> = ({ onNext, onCancel, defaultValues, viewOnly }) => {
  const isDarkMode = useAppSelector((state: any) => state.darkMode.value);
  const [selectedIntervention, setSelectedIntervention] = useState<Options | null>(null);
  console.log('Wizard defaultValues passed to AddInstance ==>', defaultValues);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<RegisterValues>({
    mode: 'onChange',
    defaultValues: {
      name: defaultValues?.name || '',
      title: defaultValues?.title || '',
      effectivePeriod: {
        start: defaultValues?.effectivePeriod?.start ? new Date(defaultValues.effectivePeriod.start) : undefined,
        end: defaultValues?.effectivePeriod?.end ? new Date(defaultValues.effectivePeriod.end) : undefined
      }
    }
  });

  useEffect(() => {
    if (defaultValues && Object.keys(defaultValues).length > 0) {
      reset({
        name: defaultValues?.name || '',
        title: defaultValues?.title || '',
        effectivePeriod: {
          start: defaultValues?.effectivePeriod?.start ? new Date(defaultValues.effectivePeriod.start) : undefined,
          end: defaultValues?.effectivePeriod?.end ? new Date(defaultValues.effectivePeriod.end) : undefined
        }
      });
    }
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
              disabled={viewOnly}
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
                      disabled={viewOnly}
                      className={`form-control ${errors.effectivePeriod?.start ? 'is-invalid' : ''}`}
                      dateFormat="yyyy-MM-dd"
                      minDate={new Date()}
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
                      dateFormat="yyyy-MM-dd"
                      minDate={startDate}
                      disabled={viewOnly || !startDate}
                    />
                  )}
                />
                <div className="invalid-feedback d-block">{errors.effectivePeriod?.end?.message}</div>
              </Form.Group>
            </Col>
          </Row>
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
