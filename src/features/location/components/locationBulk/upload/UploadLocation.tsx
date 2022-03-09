import { Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useAppDispatch } from '../../../../../store/hooks';
import { showLoader } from '../../../../reducers/loader';
import { toast } from 'react-toastify';
import { ErrorModel } from '../../../../../api/providers';
import { DOWNLOAD_LOCATION_BULK_TEMPLATE } from '../../../../../constants';
import { uploadLocationJSON } from '../../../api';

interface RegisterValues {
  bulk: File[];
}

interface Props {
  handleClose: () => void;
}

const UploadLocation = ({ handleClose }: Props) => {
  const dispatch = useAppDispatch();
  const {
    reset,
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<RegisterValues>();

  const submitHandler = (formValues: RegisterValues) => {
    let json: File = formValues.bulk[0];
    if (json !== undefined && json.name.includes('.json')) {
      dispatch(showLoader(true));
      const formData = new FormData();
      formData.append('file', json);
      toast.promise(uploadLocationJSON(formData), {
        pending: 'JSON file is uploading...',
        success: {
          render({ data }: { data: { identifier: string } }) {
            reset();
            dispatch(showLoader(false));
            handleClose();
            return `JSON file uploaded successfully, you can track location creation progress in location import section with identifier ${data.identifier}`;
          }
        },
        error: {
          render({ data }: { data: ErrorModel }) {
            dispatch(showLoader(false));
            setError(
              'bulk',
              { message: data.message },
              {
                shouldFocus: true
              }
            );
            return data.message;
          }
        }
      });
    } else {
      setError('bulk', { message: 'Unexpected file type, please try again.' });
    }
  };

  return (
    <Form onSubmit={handleSubmit(submitHandler)}>
      <Form.Group className="mb-3">
        <Form.Label>Please provide a JSON file:</Form.Label>
        <Form.Control
          id="bulk-json-input"
          {...register('bulk', { required: 'Please provide a JSON file.' })}
          type="file"
          accept=".json"
        />
        {errors.bulk && (
          <Form.Label className="text-danger mt-1">{errors.bulk && (errors.bulk as any).message}</Form.Label>
        )}
      </Form.Group>
      <p>
        You can download JSON sample from{' '}
        <a id="download-template-link" href={DOWNLOAD_LOCATION_BULK_TEMPLATE} download>
          here
        </a>
      </p>
      <hr style={{ margin: '12px -16px' }} />
      <Button id="submit-button" variant="primary" className="float-end" type="submit">
        Submit
      </Button>
      <Button id="close-button" variant="secondary" className="float-end me-2" onClick={handleClose}>
        Close
      </Button>
    </Form>
  );
};

export default UploadLocation;
