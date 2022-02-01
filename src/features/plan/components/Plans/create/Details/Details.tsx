import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Form, Button, Col, Row } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select, { SingleValue } from 'react-select';

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

interface Options {
  label: string;
  value: string;
}

interface Props {
  locationHierarchyList: Options[];
  interventionTypeList: Options[];
  nextHandler: (formData: any) => void;
}

const Details = ({ locationHierarchyList, interventionTypeList, nextHandler }: Props) => {
  const [selectedHierarchy, setSelectedHierarchy] = useState<SingleValue<Options>>();
  const [selectedInterventionType, setSelectedInterventionType] = useState<SingleValue<Options>>();
  const {
    register,
    handleSubmit,
    control,
    watch,
    resetField,
    formState: { errors }
  } = useForm<RegisterValues>();

  return (
    <Form>
      <Form.Group className="mb-2">
        <Form.Label>Plan name</Form.Label>
        <Form.Control
          {...register('name', {
            required: 'Plan name must not be empty',
            pattern: {
              value: new RegExp('^[a-z]+([._]?[a-z]+)*$'),
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
              value: new RegExp('^[^\\s]+[-a-zA-Z\\s]+([-a-zA-Z]+)*$'),
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
                  onChange={(e) => {
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
                required: 'End date must be selected!',
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
                  disabled={watch('effectivePeriod.start') === null || watch('effectivePeriod.start') === undefined}
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
          render={({ field }) => (
            <Select
              menuPosition="fixed"
              options={locationHierarchyList}
              value={selectedHierarchy}
              onChange={selected => {
                setSelectedHierarchy(selected);
                field.onChange(selected?.value);
              }}
            />
          )}
        />
      </Form.Group>
      <Form.Group className="mb-4">
        <Form.Label>Select Intervention Type</Form.Label>
        <Controller
          control={control}
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
      </Form.Group>
      <Button onClick={handleSubmit(nextHandler)} className="float-end mt-2">
        Submit
      </Button>
    </Form>
  );
};

export default Details;
