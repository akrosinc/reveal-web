import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { UseFormRegister } from 'react-hook-form';
import { EntityTag } from '../../providers/types';
import FormField from './FormField';

interface Props {
  register: UseFormRegister<any>;
  entityTag: EntityTag;
  index: number;
  errors: { [x: string]: any };
  deleteHandler: (index: number, range: boolean) => void;
}

const MultiFormField = ({ register, entityTag, index: parentIndex, errors, deleteHandler }: Props) => {
  const [range, setRange] = useState(false);

  return (
    <div className="border border-2 p-2" key={parentIndex}>
      {entityTag.valueType !== 'string' && (
        <>
          <Form.Label className="me-2">Range</Form.Label>{' '}
          <Form.Check
            inline
            onChange={e => {
              deleteHandler(1, e.target.checked);
              setRange(e.target.checked);
            }}
          />
        </>
      )}
      {range && <p>Beetween</p>}
      <FormField entityTag={entityTag} errors={errors} index={parentIndex} register={register} range={range} />
      <p className="my-2">{range ? 'AND' : 'OR'}</p>
      {range ? (
        <FormField entityTag={entityTag} errors={errors} index={parentIndex + 'range'} register={register} range />
      ) : (
        entityTag.more.map((el, index) => (
          <div key={index}>
            <FormField
              range={false}
              entityTag={el}
              errors={errors}
              index={entityTag.identifier + parentIndex + index}
              register={register}
            />
            <div className="d-flex justify-content-between align-items-center">
              {index !== entityTag.more.length - 1 && <span>OR</span>}
              <Button className="my-2 ms-auto" onClick={() => deleteHandler(index, false)}>
                Delete
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MultiFormField;
