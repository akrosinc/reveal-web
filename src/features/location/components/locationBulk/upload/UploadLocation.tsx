import { Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { DOWNLOAD_LOCATION_BULK_TEMPLATE } from '../../../../../constants';
import { uploadLocationJSON, validateLocationJSON } from '../../../api';

interface RegisterValues {
  bulk: File[];
}

interface Props {
  handleClose: () => void;
  isValidate: boolean;
}

const UploadLocation = ({ handleClose, isValidate }: Props) => {
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
      const formData = new FormData();
      formData.append('file', json);
      const uploadToast = toast.info('JSON file is uploading...', { progress: 0 });
      if (isValidate) {
        validateLocationJSON(formData, uploadToast.toString()).then(res => {
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(new Blob([res], {type: 'text/csv;charset=utf-8'}));
          link.setAttribute('download', `fileValidation${+new Date()}.csv`);
          link.click();
          link.remove();
        });
      } else {
        uploadLocationJSON(formData, uploadToast.toString())
          .then(res => {
            reset();
            handleClose();
            toast.success(
              `JSON file uploaded successfully, you can track location creation progress in location import section with identifier ${res.identifier}`
            );
          })
          .catch((err: string) => {
            setError(
              'bulk',
              { message: err },
              {
                shouldFocus: true
              }
            );
            toast.error(err);
          })
          .finally(() => {
            toast.done(uploadToast.toString());
          });
      }
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
      {!isValidate && (
        <p>
          You can download JSON sample from{' '}
          <a id="download-template-link" href={DOWNLOAD_LOCATION_BULK_TEMPLATE} download>
            here
          </a>
        </p>
      )}
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
