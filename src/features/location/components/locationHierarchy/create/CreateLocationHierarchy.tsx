import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAppDispatch } from '../../../../../store/hooks';
import { showLoader } from '../../../../reducers/loader';
import Select, { MultiValue } from 'react-select';
import { createLocationHierarchy } from '../../../api';
import { LocationHierarchyModel } from '../../../providers/types';
import { ErrorModel } from '../../../../../api/providers';

interface Props {
  closeHandler: () => void;
  geographyLevelList: Options[];
}

interface Options {
  value: string;
  label: string;
}

const CreateLocationHierarchy = ({ closeHandler, geographyLevelList }: Props) => {
  const dispatch = useAppDispatch();
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
    setValue('nodeOrder', selected.toString());
  };

  const submitHandler = () => {
    if (locationHierarchy.length > 0) {
      const newHierarchy: LocationHierarchyModel = {
        nodeOrder: locationHierarchy
      };
      dispatch(showLoader(true));
      toast.promise(createLocationHierarchy(newHierarchy), {
        pending: 'Loading...',
        success: {
          render({ data }: { data: LocationHierarchyModel }) {
            closeHandler();
            dispatch(showLoader(false));
            return 'Successfully created location hierarchy with id: ' + data.identifier;
          }
        },
        error: {
          render({ data }: { data: ErrorModel }) {
            dispatch(showLoader(false));
            if (data.fieldValidationErrors) {
              data.fieldValidationErrors.forEach(el => {
                if (el.field === 'nodeOrder') {
                  setError('nodeOrder', {
                    message: el.messageKey
                  });
                }
              });
            }
            return data.message !== undefined ? data.message : 'An error has occured!';
          }
        }
      });
    }
  };

  return (
    <Form>
      <Form.Group>
        <Form.Label>Current Node List</Form.Label>
        <Form.Control
          {...register('nodeOrder', {
            required: 'Node order must not be empty. Select at least one level'
          })}
          type="text"
          readOnly
          placeholder="Pick geo levels from dropdown"
        ></Form.Control>
        {errors.nodeOrder && <Form.Label className="text-danger">{errors.nodeOrder.message}</Form.Label>}
      </Form.Group>
      <Form.Group className="mt-2">
        <Form.Label>Geography Levels</Form.Label>
        <Select menuPosition="fixed" isMulti options={geographyLevelList} onChange={selectHandler} />
      </Form.Group>
      <hr style={{ margin: '15px -15px' }} />
      <div className="mt-3">
        <Button variant="primary" className="float-end ms-2" onClick={handleSubmit(submitHandler)}>
          Create
        </Button>
        <Button variant="secondary" className="float-end" onClick={closeHandler}>
          Close
        </Button>
      </div>
    </Form>
  );
};

export default CreateLocationHierarchy;
