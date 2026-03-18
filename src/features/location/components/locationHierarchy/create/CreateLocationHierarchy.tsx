import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Select, { MultiValue } from 'react-select';
import { createLocationHierarchy, createLocationHierarchyBase } from '../../../api';
import { LocationHierarchyModel } from '../../../providers/types';
import { FieldValidationError } from '../../../../../api/providers';

interface Props {
  closeHandler: () => void;
  geographyLevelList: Options[];
  isBase?: boolean;
  baseHierarchyName?: string;
}

interface Options {
  value: string;
  label: string;
}

const CreateLocationHierarchy = ({ closeHandler, geographyLevelList, isBase, baseHierarchyName }: Props) => {
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors }
  } = useForm();
  const [locationHierarchy, setLocationHierarchy] = useState<string[]>([]);

  const selectHandler = (selectedOptions: MultiValue<{ value: string; label: string }>) => {
    const selected = selectedOptions.map(el => el.value);
    setLocationHierarchy(selected);
    setValue('nodeOrder', selected);
  };

  const submitHandler = (formData: LocationHierarchyModel) => {
    if (locationHierarchy.length > 0) {
      const apiCall = isBase ? createLocationHierarchyBase : createLocationHierarchy;
      toast.promise(apiCall({ name: formData.name, nodeOrder: formData.nodeOrder }), {
        pending: 'Loading...',
        success: {
          render({ data }: { data: any }) {
            closeHandler();
            return (
              'Successfully created ' + (isBase ? 'base ' : '') + 'location hierarchy with id: ' + data.identifier
            );
          }
        },
        error: {
          render({ data: err }: { data: any }) {
            if (typeof err !== 'string') {
              const fieldValidationErrors = err as FieldValidationError[];
              return (
                'Field Validation Error: ' +
                fieldValidationErrors
                  .map(errField => {
                    setError(errField.field as any, { message: errField.messageKey });
                    return errField.field;
                  })
                  .toString()
              );
            }
            return err;
          }
        }
      });
    }
  };

  return (
    <Form>
      <Form.Group>
        <Form.Label>Hierarchy name</Form.Label>
        <Form.Control
          id="name-input"
          {...register('name', {
            required: 'Hierarchy name must not be empty.'
          })}
          type="text"
          placeholder="Hierarchy name"
        ></Form.Control>
        {errors.name && <Form.Label className="text-danger">{errors.name.message}</Form.Label>}
      </Form.Group>
      <Form.Group>
        <Form.Label>Current Node List</Form.Label>
        <Form.Control
          id="nodeOrder-display"
          value={(baseHierarchyName && !isBase ? `${baseHierarchyName}, ` : '') + locationHierarchy.join(', ')}
          type="text"
          readOnly
          placeholder="Pick geo levels from dropdown"
        ></Form.Control>
        <input
          type="hidden"
          {...register('nodeOrder', {
            required: 'Node order must not be empty. Select at least one level'
          })}
        />
        {errors.nodeOrder && <Form.Label className="text-danger">{errors.nodeOrder.message}</Form.Label>}
      </Form.Group>
      <Form.Group className="mt-2">
        <Form.Label>Geography Levels</Form.Label>
        <Select
          className="custom-react-select-container"
          classNamePrefix="custom-react-select"
          id="hierarchy-select"
          menuPosition="fixed"
          isMulti
          options={geographyLevelList}
          onChange={selectHandler}
        />
      </Form.Group>
      <hr style={{ margin: '15px -15px' }} />
      <div className="mt-3">
        <Button id="create-button" variant="primary" className="float-end ms-2" onClick={handleSubmit(submitHandler)}>
          Create
        </Button>
        <Button id="close-button" variant="secondary" className="float-end" onClick={closeHandler}>
          Close
        </Button>
      </div>
    </Form>
  );
};

export default CreateLocationHierarchy;
