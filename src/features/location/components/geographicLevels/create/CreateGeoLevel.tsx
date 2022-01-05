import React from 'react';
import { Form, Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAppDispatch } from '../../../../../store/hooks';
import { showLoader } from '../../../../reducers/loader';
import { createGeographicLevel } from '../../../api';
import { GeographicLevel } from '../../../providers/types';

interface Props {
  closeHandler: () => void;
}

interface FormValues {
  name: string;
  title: string;
}

const CreateGeoLevel = ({ closeHandler }: Props) => {
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<FormValues>();

  const submitHandler = (formValues: FormValues) => {
    dispatch(showLoader(true));
    toast.promise(createGeographicLevel(formValues), {
      pending: "Loading...",
      success: {
        render({ data }: { data: GeographicLevel }) {
          dispatch(showLoader(false));
          closeHandler();
          return 'Geographic location created successfully with id: ' + data.identifier;
        }
      },
      error: {
        render({ data }: any) {
          dispatch(showLoader(false));
          if (data.fieldValidationErrors) {
            data.fieldValidationErrors.forEach((el: any) => {
              if (el.field === 'name') {
                setError('name', {
                  message: "Name can't contain uppercase characters or numbers."
                });
              } else {
                setError('title', {
                  message: "Title can't contain uppercase characters or numbers."
                });
              }
            });
          }
          return data.message !== undefined ? data.message : 'An error has occured!';
        }
      }
    });
  };

  return (
    <Form>
      <Form.Group className="mb-2">
        <Form.Label>Name</Form.Label>
        <Form.Control
          {...register('name', {
            required: 'Name can not be empty.',
            pattern: {
              message: 'Name can not contain uppercase characters or numbers.',
              value: new RegExp('^[a-z0-9_\\-]+$')
            }
          })}
          type="text"
          placeholder="Enter geographic name"
        />
        {errors.name && <Form.Label className="text-danger">{errors.name.message}</Form.Label>}
      </Form.Group>
      <Form.Group className="mb-2">
        <Form.Label>Title</Form.Label>
        <Form.Control
          {...register('title', {
            required: 'Title can not be empty.',
            pattern: {
              message: 'Title can not contain uppercase characters or numbers.',
              value: new RegExp('^[a-z0-9_\\-]+$')
            }
          })}
          type="text"
          placeholder="Enter geographic title"
        />
        {errors.title && <Form.Label className="text-danger">{errors.title.message}</Form.Label>}
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

export default CreateGeoLevel;
