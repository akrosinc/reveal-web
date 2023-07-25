import React, { useEffect, useState } from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { BOOLEAN_STRING_AGGREGATION, DATA_AGGREGATION, NUMBER_AGGREGATION } from '../../../../constants';
import { createTag } from '../../api';
import { TagCreateRequest } from '../../providers/types';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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
      tags: [{ name: '' }]
    }
  });
  const { fields, append } = useFieldArray({
    control,
    name: 'tags'
  });

  const selectedValueType = watch('valueType');

  useEffect(() => {
    let selected: string[] = [];
    switch (selectedValueType) {
      case 'number':
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

  const submitHandler = (form: TagCreateRequest) => {
    form.tags.forEach(tag => {
      tag.name = tag.name.replaceAll(' ', '-');
      tag.name = tag.name.replaceAll('_', '-');
    });
    createTag(form)
      .then(res => {
        toast.success(`Tag ${res.tag} created.`);
        closeHandler();
      })
      .catch(err => toast.error(err));
  };

  const getError = (errors: any, index: number) => {
    let find = errors.tags.find((tag: any, tagIndex: number) => tagIndex === index);
    if (find) {
      return find.name.message;
    } else {
      return '';
    }
  };

  return (
    <Modal show centered size="lg" onHide={() => closeHandler()}>
      <Modal.Header closeButton>
        <Modal.Title>Create Tag</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col>
              <Form.Label>Tag Name</Form.Label>
            </Col>
          </Row>
          <Row>
            <Col md={11}>
              {fields.map((item, index: number) => (
                <>
                  <Controller
                    rules={{ required: 'error' }}
                    control={control}
                    render={({ field: { onChange } }) => (
                      <>
                        <Form.Group>
                          <Form.Control
                            {...register(`tags.${index}.name` as const, { required: 'error' })}
                            onChange={onChange}
                            type="text"
                          />
                        </Form.Group>
                        {errors.tags && <Form.Label className="text-danger mt-2">{getError(errors, index)}</Form.Label>}
                      </>
                    )}
                    name={`tags.${index}.name` as const}
                  />
                </>
              ))}
            </Col>
            <Col md={1}>
              <Button className="rounded float-end" onClick={() => append({})}>
                <FontAwesomeIcon icon="plus" />
              </Button>
            </Col>
          </Row>
          <Form.Group className="mt-2">
            <Form.Label>Data Type</Form.Label>
            <Form.Select
              {...register('valueType', {
                required: { value: true, message: 'Data Type must be selected.' }
              })}
            >
              <option value="">Select Data Type</option>
              <option value="number">Number</option>
              <option value="string">String</option>
              <option value="boolean">Boolean</option>
            </Form.Select>
            {errors.valueType && <Form.Label className="text-danger mt-2">{errors.valueType?.message}</Form.Label>}
          </Form.Group>
          <Form.Group className="mt-2">
            <Form.Label>Aggregation Method</Form.Label>
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
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleSubmit(submitHandler)}>Submit</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateTag;
