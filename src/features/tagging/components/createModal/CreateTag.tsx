import React, { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { BOOLEAN_STRING_AGGREGATION, DATA_AGGREGATION, NUMBER_AGGREGATION } from '../../../../constants';
import { createTag } from '../../api';
import { EntityTypeEnum, TagCreateRequest } from '../../providers/types';
import Select from 'react-select';

interface Props {
  closeHandler: () => void;
}

const CreateTag = ({ closeHandler }: Props) => {
  const [aggregation, setAggregation] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors }
  } = useForm<TagCreateRequest>({
    defaultValues: {
      scope: 'global'
    }
  });

  const selectedValueType = watch('valueType');

  useEffect(() => {
    let selected: string[] = [];
    switch (selectedValueType) {
      case 'integer':
        selected = NUMBER_AGGREGATION;
        break;
      case 'string':
        selected = BOOLEAN_STRING_AGGREGATION;
        break;
      case 'date':
        selected = DATA_AGGREGATION;
        break;
      case 'boolean':
        selected = BOOLEAN_STRING_AGGREGATION;
        break;
    }
    setAggregation(selected);
  }, [selectedValueType]);

  const submitHandler = (form: any) => {
    createTag(form)
      .then(res => {
        toast.success(`Tag ${res.tag} created.`);
        closeHandler();
      })
      .catch(err => toast.error(err));
  };

  return (
    <Modal show centered size="lg" onHide={() => closeHandler()}>
      <Modal.Header closeButton>
        <Modal.Title>Create Tag</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Tag Name</Form.Label>
            <Form.Control
              {...register('tag', {
                required: { value: true, message: 'Tag name is required' }
              })}
              type="text"
            />
            {errors.tag && <Form.Label className="text-danger mt-2">{errors.tag?.message}</Form.Label>}
          </Form.Group>
          <Form.Group className="mt-2">
            <Form.Label>Form Title</Form.Label>
            <Form.Control disabled type="text" />
          </Form.Group>
          <Form.Group className="mt-2">
            <Form.Label>Form Key</Form.Label>
            <Form.Control disabled type="text" />
          </Form.Group>
          <Form.Group className="mt-2">
            <Form.Label>Entity Type</Form.Label>
            <Form.Select
              {...register('entityType', {
                required: { value: true, message: 'Entity Type is required' }
              })}
            >
              <option value={''}>Select Entity Type</option>
              <option value={EntityTypeEnum.PERSON_CODE}>Person</option>
              <option value={EntityTypeEnum.LOCATION_CODE}>Location</option>
            </Form.Select>
            {errors.entityType && <Form.Label className="text-danger mt-2">{errors.entityType?.message}</Form.Label>}
          </Form.Group>
          <Form.Group className="mt-2">
            <Form.Label>Data Type</Form.Label>
            <Form.Select
              {...register('valueType', {
                required: { value: true, message: 'Data Type must be selected.' }
              })}
            >
              <option value="">Select Data Type</option>
              <option value="integer">Number</option>
              <option value="string">String</option>
              <option value="boolean">Boolean</option>
              <option value="date">Date</option>
            </Form.Select>
            {errors.valueType && <Form.Label className="text-danger mt-2">{errors.valueType?.message}</Form.Label>}
          </Form.Group>
          <Form.Group className="mt-2">
            <Form.Label>Aggregation Method</Form.Label>
            {/* <Form.Select {...register('aggregationMethod')}>
              {aggregation.length ? (
                aggregation.map(el => (
                  <option key={el} value={el}>
                    {el}
                  </option>
                ))
              ) : (
                <option value="">Data Type needs to be selected</option>
              )}
            </Form.Select> */}
            <Controller
              control={control}
              name="aggregationMethod"
              rules={{ required: 'Select aggregation method first.', minLength: 1 }}
              render={({ field }) => (
                <Select
                  className="custom-react-select-container"
                  classNamePrefix="custom-react-select"
                  menuPosition="fixed"
                  isMulti
                  options={aggregation.map<{ value: string; label: string }>(el => {
                    return {
                      label: el,
                      value: el
                    };
                  })}
                  onChange={selected => {
                    field.onChange(selected.map(el => el.value));
                  }}
                />
              )}
            />
            {errors.aggregationMethod && (
              <Form.Label className="text-danger mt-2">
                {errors.aggregationMethod && (errors.aggregationMethod as any).message}
              </Form.Label>
            )}
          </Form.Group>
          <Form.Group className="mt-2">
            <Form.Label>Scope</Form.Label>
            <Form.Select {...register('scope')} disabled>
              <option value="global">Global</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="my-2">
            <Form.Label>Definition Type</Form.Label>
            <Form.Select disabled>
              <option></option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleSubmit(submitHandler)}>Submit</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateTag;
