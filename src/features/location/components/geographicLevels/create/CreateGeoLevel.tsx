import React from 'react';
import { Form, Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { ErrorModel } from '../../../../../api/providers';
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
      pending: 'Loading...',
      success: {
        render({ data }: { data: GeographicLevel }) {
          dispatch(showLoader(false));
          closeHandler();
          return 'Geographic Location created successfully with id: ' + data.identifier;
        }
      },
      error: {
        render({ data }: { data: ErrorModel }) {
          dispatch(showLoader(false));
          if (data.fieldValidationErrors) {
            data.fieldValidationErrors.forEach((el: any) => {
              if (el.field === 'name') {
                setError('name', {
                  message: el.messageKey
                });
              } else {
                setError('title', {
                  message: el.messageKey
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
          id="name-input"
          {...register('name', {
            required: 'Geographic Level name must not be empty.',
            minLength: 1,
            pattern: {
              value: new RegExp('^[a-z0-9\\-]+$'),
              message:
                "Geographic Level name can't start with empty space and can't containt uppercase characters or special letters."
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
          id="title-input"
          {...register('title', {
            required: 'Geographic Level title must not be empty.',
            minLength: 1,
            pattern: {
              value: new RegExp('^[^-\\s][\\w\\s-]+$'),
              message: "Geographic Level title can't start with empty space or special letters."
            }
          })}
          type="text"
          placeholder="Enter geographic title"
        />
        {errors.title && <Form.Label className="text-danger">{errors.title.message}</Form.Label>}
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

export default CreateGeoLevel;
