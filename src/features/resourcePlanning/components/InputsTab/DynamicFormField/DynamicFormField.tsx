import React from 'react';
import { Form } from 'react-bootstrap';
import { Control, Controller, FieldErrors, UseFormRegister } from 'react-hook-form';
import { ResourceQuestion } from '../../../providers/types';

interface Props {
  el: ResourceQuestion;
  register: UseFormRegister<any>;
  errors: FieldErrors;
  control: Control;
}

const DynamicFormField = ({ el, register, control, errors }: Props) => {
  return (
    <Form.Group className="my-2">
      <Form.Label>{el.question}</Form.Label>
      {el.fieldType.inputType === 'STRING' && (
        <Form.Control {...register(el.fieldName as any, { required: 'This field can not be empty.' })} type="text" />
      )}
      {(el.fieldType.inputType === 'DECIMAL' || el.fieldType.inputType === 'INTEGER') && (
        <Form.Control
          {...register(el.fieldName as any, { required: 'This field can not be empty.' })}
          type="number"
          min={el.fieldType.min}
          max={el.fieldType.max}
        />
      )}
      {el.fieldType.inputType === 'DROPDOWN' && (
        <Controller
          control={control}
          name={el.fieldName as any}
          rules={{ required: { value: true, message: 'Selecting an answer is required.' }, minLength: 1 }}
          render={({ field: { onChange, onBlur, ref, value } }) => (
            <Form.Select onChange={onChange} value={value} ref={ref} onBlur={onBlur}>
              <option>Select...</option>
              {el.fieldType.values.map((el, i) => (
                <option key={i} value={el}>
                  {el}
                </option>
              ))}
            </Form.Select>
          )}
        />
      )}
      {errors[el.fieldName] && <Form.Label className="text-danger">{errors[el.fieldName].message}</Form.Label>}
    </Form.Group>
  );
};

export default DynamicFormField;
