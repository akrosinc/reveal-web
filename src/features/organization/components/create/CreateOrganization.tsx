import React, { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { createOrganization, getOrganizationListSummary } from '../../api';
import { OrganizationModel } from '../../../organization/providers/types';
import { useForm } from 'react-hook-form';
import { useAppDispatch } from '../../../../store/hooks';
import { showLoader } from '../../../reducers/loader';
import { toast } from 'react-toastify';
import { ErrorModel } from '../../../../api/providers';

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

const CreateOrganization = ({ show, handleClose }: Props) => {
  const [organizations, setOrganizations] = useState<OrganizationModel[]>([]);
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterValues>();

  useEffect(() => {
    getOrganizationListSummary().then(res => {
      setOrganizations(res.content);
    });
  }, []);

  const submitHandler = (formValues: RegisterValues) => {
    dispatch(showLoader(true));
    toast.promise(createOrganization(formValues), {
      pending: 'Loading...',
      success: {
        render({ data }: { data: OrganizationModel }) {
          dispatch(showLoader(false));
          handleClose(true);
          return `Organization with id: ${data.identifier} created successfully.`;
        }
      },
      error: {
        render({ data }: { data: ErrorModel }) {
          dispatch(showLoader(false));
          return data.message;
        }
      }
    });
  };

  return (
    <Form>
      <Form.Group className="my-4">
        <Form.Label>Organization name</Form.Label>
        <Form.Control
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
        <Form.Select {...register('type', { required: 'Organization type must be selected.' })}>
          <option value=""></option>
          <option value="CG">Community group</option>
          <option value="TEAM">Team</option>
          <option value="OTHER">Other</option>
        </Form.Select>
        {errors.type && <Form.Label className="text-danger">{errors.type.message}</Form.Label>}
      </Form.Group>
      <Form.Group className="my-4">
        <Form.Label>Part of</Form.Label>
        <Form.Select {...register('partOf', { required: false })}>
          <option value=""></option>
          {organizations.map(org => {
            return (
              <option key={org.identifier} value={org.identifier}>
                {org.name}
              </option>
            );
          })}
        </Form.Select>
      </Form.Group>
      <Form.Group className="my-4">
        <Form.Switch {...register('active', { required: false })} label="Active" />
      </Form.Group>
      <hr />
      <Button variant="primary" className="float-end" onClick={handleSubmit(submitHandler)}>
        Save
      </Button>
      <Button variant="secondary" className="float-end me-2" onClick={() => handleClose(false)}>
        Close
      </Button>
    </Form>
  );
};

export default CreateOrganization;
