import React from 'react';
import { Col, Row, Form } from 'react-bootstrap';
import { UseFormRegister } from 'react-hook-form';
import { EntityTags } from '../../providers/types';

interface Props {
  register: UseFormRegister<any>;
  entityTag: EntityTags;
  index: number;
  errors: { [x: string]: any };
}

const FormField = ({ register, entityTag, index, errors }: Props) => {
  return (
    <Form.Group>
      <Row>
        <Col xs={(entityTag.valueType === 'number' || entityTag.valueType === 'date') ? 6 : 12} sm={8} md={(entityTag.valueType === 'number' || entityTag.valueType === 'date') ? 9 : 12}>
          <Form.Label className="me-3">{entityTag.tag}</Form.Label>
          {(entityTag.valueType === 'string' || entityTag.valueType === 'number') && (
            <Form.Control
              {...register((entityTag.tag + index) as any, { required: true })}
              type={entityTag.valueType}
              name={entityTag.tag + index}
            />
          )}
          {entityTag.valueType === 'date' && (
            <Form.Control
              {...register((entityTag.tag + index) as any, { required: true })}
              type={entityTag.valueType}
              name={entityTag.tag + index}
            />
          )}
          {entityTag.valueType === 'boolean' && (
            <Form.Check
              {...register((entityTag.tag + index) as any, { required: true })}
              inline
              name={entityTag.tag + index}
            />
          )}
        </Col>
        {(entityTag.valueType === 'number' || entityTag.valueType === 'date') && (
          <Col xs={6} md={3} className='align-self-end'>
            <Form.Select
              {...register((entityTag.tag + index + 'sign') as any, { required: true })}
              name={entityTag.tag + index + 'sign'}
            >
              <option value=">">{'>'}</option>
              <option value=">=">{'>='}</option>
              <option value="<">{'<'}</option>
              <option value="<=">{'<='}</option>
              <option value="=">{'='}</option>
            </Form.Select>
          </Col>
        )}
      </Row>
      {errors[entityTag.tag + index] && <span className="text-danger">Field can't be empty.</span>}
    </Form.Group>
  );
};

export default FormField;
