import React, { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { createOrganization, getOrganizationListSummary } from '../../api';
import { OrganizationModel } from '../../../organization/providers/types';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FieldValidationError } from '../../../../api/providers';
import Select, { SingleValue } from 'react-select';

interface Props {
  show: boolean;
  handleClose: (isEdited: boolean) => void;
}

interface RegisterValues {
  name: string;
  type: string;
  partOf: string;
  active: boolean;
}

interface Option {
  label: string;
  value: string;
}

const CreateOrganization = ({ show, handleClose }: Props) => {
  const [organizations, setOrganizations] = useState<OrganizationModel[]>([]);
  const [selectedSecurityGroups, setSelectedSecurityGroups] = useState<SingleValue<Option>>();
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors }
  } = useForm<RegisterValues>();

  useEffect(() => {
    getOrganizationListSummary().then(res => {
      setOrganizations(res.content);
    });
  }, []);

  const submitHandler = (formValues: RegisterValues) => {
    
    toast.promise(createOrganization(formValues), {
      pending: 'Loading...',
      success: {
        render({ data }: { data: OrganizationModel }) {
          
          handleClose(true);
          return `Organization with id: ${data.identifier} created successfully.`;
        }
      },
      error: {
        render({ data: err }: { data: any }) {
          if (typeof err !== 'string') {
            const fieldValidationErrors = err as FieldValidationError[];
            return 'Field Validation Error: ' + fieldValidationErrors.map(errField => {
              setError(errField.field as any, {message: errField.messageKey});
              return errField.field;
            }).toString();
          }
          return err;
        }
      }
    });
  };

  return (
    <Form>
      <Form.Group className="my-4">
        <Form.Label>Organization name</Form.Label>
        <Form.Control
          id='organization-name-input'
          {...register('name', {
            required: 'Organization name must not be empty.',
            minLength: 1,
            pattern: {
              value: new RegExp('^[^-\\s][\\w\\s-]+$'),
              message: "Organization name can't start with empty space."
            }
          })}
          type="input"
        />
        {errors.name && <Form.Label className="text-danger">{errors.name.message}</Form.Label>}
      </Form.Group>
      <Form.Group className="my-4">
        <Form.Label>Type</Form.Label>
        <Form.Select id='type-select' {...register('type', { required: 'Organization type must be selected.' })}>
          <option value=""></option>
          <option value="CG">Community group</option>
          <option value="TEAM">Team</option>
          <option value="OTHER">Other</option>
        </Form.Select>
        {errors.type && <Form.Label className="text-danger">{errors.type.message}</Form.Label>}
      </Form.Group>
      <Form.Group className="my-4">
        <Form.Label>Part of</Form.Label>
        <Controller
          control={control}
          name="partOf"
          render={({ field: { onChange } }) => (
            <Select
              className="custom-react-select-container"
              classNamePrefix="custom-react-select"
              id='part-of-select'
              menuPosition="fixed"
              isClearable
              {...register('partOf', { required: false })}
              value={selectedSecurityGroups}
              options={organizations.map(el => {
                return {
                  value: el.identifier,
                  label: el.name
                };
              })}
              onChange={selectedOption => {
                setSelectedSecurityGroups(selectedOption);
                onChange(selectedOption?.value);
              }}
            />
          )}
        />
      </Form.Group>
      <Form.Group className="my-4">
        <Form.Switch id='active-switch' {...register('active', { required: false })} defaultChecked label="Active" />
      </Form.Group>
      <hr />
      <Button id='save-button' variant="primary" className="float-end" onClick={handleSubmit(submitHandler)}>
        Save
      </Button>
      <Button id='close-button' variant="secondary" className="float-end me-2" onClick={() => handleClose(false)}>
        Close
      </Button>
    </Form>
  );
};

export default CreateOrganization;
