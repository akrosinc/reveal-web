import React, { useEffect, useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { ErrorModel } from '../../../../../api/providers';
import { ConfirmDialog } from '../../../../../components/Dialogs';
import { useAppDispatch } from '../../../../../store/hooks';
import { showLoader } from '../../../../reducers/loader';
import { deleteGeographicLevel, updateGeographicLevel } from '../../../api';
import { GeographicLevel } from '../../../providers/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface Props {
  closeHandler: () => void;
  data?: GeographicLevel;
}

const GeoLevelDetails = ({ closeHandler, data }: Props) => {
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors }
  } = useForm<GeographicLevel>();
  const [edit, setEdit] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    setValue('identifier', data?.identifier ?? '');
    setValue('name', data?.name ?? '');
    setValue('title', data?.title ?? '');
  }, [data, setValue]);

  const submitHandler = (formValues: GeographicLevel) => {
    dispatch(showLoader(true));
    toast.promise(updateGeographicLevel(formValues), {
      pending: 'Loading...',
      success: {
        render({ data }: { data: GeographicLevel }) {
          dispatch(showLoader(false));
          closeHandler();
          return 'Geographic location updated successfully with id: ' + data.identifier;
        }
      },
      error: {
        render({ data }: any) {
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

  const deleteHandler = (action: boolean) => {
    if (action) {
      dispatch(showLoader(true));
      if (data !== undefined) {
        toast.promise(deleteGeographicLevel(data.identifier), {
          pending: 'Loading...',
          success: {
            render() {
              dispatch(showLoader(false));
              closeHandler();
              return `Geographic Level with id: ${data.identifier} deleted successfully!`;
            }
          },
          error: {
            render({ data }: { data: ErrorModel }) {
              dispatch(showLoader(false));
              return data.message !== undefined ? data.message : 'An error has occured!';
            }
          }
        });
      }
    } else {
      setShowConfirmDialog(false);
    }
  };

  return (
    <Form>
      <Form.Group className="mb-2">
        <Form.Label>Identifier</Form.Label>
        <Form.Control
          {...register('identifier', {
            required: true
          })}
          type="text"
          readOnly
        />
      </Form.Group>
      <Form.Group className="mb-2">
        <Form.Label>Name</Form.Label>
        <Form.Control
          {...register('name', {
            required: 'Geographic Level name must not be empty.',
            minLength: 1,
            pattern: {
              value: new RegExp('^[a-z0-9\\-]+$'),
              message: "Geographic Level can't start with empty space and can't containt uppercase characters."
            }
          })}
          type="text"
          placeholder="Enter geographic level name"
          readOnly={!edit}
        />
        {errors.name && <Form.Label className="text-danger">{errors.name.message}</Form.Label>}
      </Form.Group>
      <Form.Group className="mb-2">
        <Form.Label>Title</Form.Label>
        <Form.Control
          {...register('title', {
            required: 'Geographic Level title must not be empty.',
            minLength: 1,
            pattern: {
              value: new RegExp('^[^-\\s][\\w\\s-]+$'),
              message: "Geographic Level title can't start with empty space."
            }
          })}
          type="text"
          placeholder="Enter Geographic Level title"
          readOnly={!edit}
        />
        {errors.title && <Form.Label className="text-danger">{errors.title.message}</Form.Label>}
      </Form.Group>
      <hr style={{ margin: '15px -15px' }} />
      <div className="mt-3">
        {edit ? (
          <>
            <Button
              variant="secondary"
              className="float-start"
              onClick={() => (edit ? setEdit(false) : closeHandler())}
            >
              Discard
            </Button>
            <Button variant="primary" className="float-end ms-2 py-2" onClick={handleSubmit(submitHandler)}>
            <FontAwesomeIcon className="my-0 mx-1" icon="save" />
            </Button>
          </>
        ) : (
          <Button variant="primary" className="float-end ms-2 py-2" onClick={() => setEdit(true)}>
            <FontAwesomeIcon className="m-0 ms-1" icon="edit" />
          </Button>
        )}
        <Button variant="secondary" className="float-end py-2" onClick={() => setShowConfirmDialog(true)}>
          <FontAwesomeIcon className="my-0 mx-1" icon="trash" />
        </Button>
      </div>
      {showConfirmDialog && (
        <ConfirmDialog
          backdrop={false}
          closeHandler={deleteHandler}
          message="Are you sure? This Geographic level will be deleted."
          title="Delete Geographic Level"
        />
      )}
    </Form>
  );
};

export default GeoLevelDetails;
