import React from 'react';
import { Col, Row, Form } from 'react-bootstrap';
import { UseFormRegister } from 'react-hook-form';
import { EntityTag, OperatorSignEnum } from '../../providers/types';

interface Props {
  register: UseFormRegister<any>;
  entityTag: EntityTag;
  index: number | string;
  errors: { [x: string]: any };
  range: boolean;
}

const FormField = ({ register, entityTag, index, errors, range }: Props) => {
  return (
    <Form.Group>
      <Row>
        <Form.Label className="me-3">{entityTag.tag}</Form.Label>
        {(entityTag.valueType === 'number' || entityTag.valueType === 'date') && !range && (
          <Col xs={6} md={3} className="align-self-end">
            <Form.Select
              {...register((entityTag.tag + index + 'sign') as any, { required: true })}
              name={entityTag.tag + index + 'sign'}
            >
              <option value={OperatorSignEnum.GRATER_THAN}>{'>'}</option>
              <option value={OperatorSignEnum.GRATER_THAN_EQUAL}>{'>='}</option>
              <option value={OperatorSignEnum.LESS_THAN}>{'<'}</option>
              <option value={OperatorSignEnum.LESS_THAN_EQUAL}>{'<='}</option>
              <option value={OperatorSignEnum.EQUAL}>{'='}</option>
            </Form.Select>
          </Col>
        )}
        <Col
          xs={(entityTag.valueType === 'number' || entityTag.valueType === 'date') && !range ? 6 : 12}
          sm={8}
          md={(entityTag.valueType === 'number' || entityTag.valueType === 'date') && !range ? 9 : 12}
        >
          {(entityTag.valueType === 'string' || entityTag.valueType === 'number') && (
            <Form.Control
              {...register((entityTag.tag + index) as any, {
                required: true,
                valueAsNumber: entityTag.valueType === 'number'
              })}
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
              {...register((entityTag.tag + index) as any)}
              inline
              name={entityTag.tag + index}
            />
          )}
        </Col>
      </Row>
      {errors[entityTag.tag + index] && <span className="text-danger">Field can't be empty.</span>}
    </Form.Group>
  );
};

export default FormField;
