import { Button, Form } from 'react-bootstrap';
import { uploadUserCsv } from '../../../api';
import { useForm } from 'react-hook-form';
import { getSecurityGroups } from '../../../../organization/api';
import { toast } from 'react-toastify';
import { FieldValidationError } from '../../../../../api/providers';
import { DOWNLOAD_USER_BULK_TEMPLATE } from '../../../../../constants';

interface RegisterValues {
  bulk: File[];
}

interface Props {
  handleClose: () => void;
}

const CreateBulk = ({ handleClose }: Props) => {
  const {
    reset,
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<RegisterValues>();

  const submitHandler = (formValues: RegisterValues) => {
    let csv: File = formValues.bulk[0];
    if (csv !== undefined) {
      const formData = new FormData();
      formData.append('file', csv);
      toast.promise(uploadUserCsv(formData), {
        pending: 'CSV file is uploading...',
        success: {
          render({ data }: { data: { identifier: string } }) {
            reset();
            handleClose();
            return `CSV file uploaded successfully, you can track user creation progress in bulk import section with identifier ${data.identifier}`;
          }
        },
        error: {
          render({ data: err }: { data: any }) {
            if (typeof err !== 'string') {
              const fieldValidationErrors = err as FieldValidationError[];
              return 'Field Validation Error: ' + fieldValidationErrors.map(errField => {
                setError(errField.field as any, {message: errField.messageKey});
                return errField.field;
              }).toString();
            }
            setError('bulk', {});
            return err;
          }
        }
      });
    } else {
      setError('bulk', {});
    }
  };

  const downloadSecurityGroups = () => {
    getSecurityGroups().then(res => {
      let csvContent = 'data:text/csv;charset=utf-8,' + res.map(group => group.name);
      var encodedUri = encodeURI(csvContent);
      var link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'security_groups.csv');
      document.body.appendChild(link);
      link.click();
    });
  };

  return (
    <Form onSubmit={handleSubmit(submitHandler)}>
      <Form.Group className="mb-3">
        <Form.Label>Please provide a csv file</Form.Label>
        <Form.Control id="csv-input" {...register('bulk', { required: true })} type="file" accept=".csv" />
        {errors.bulk && <Form.Label className="text-danger mt-1">Invalid file type.</Form.Label>}
      </Form.Group>
      <p>
        You can download CSV sample from{' '}
        <a href={DOWNLOAD_USER_BULK_TEMPLATE} download>
          here
        </a>
      </p>
      <p>
        You can download security groups from{' '}
        <Button
          id="download-security-groups-button"
          variant="link"
          className="pb-1 p-0"
          onClick={() => downloadSecurityGroups()}
        >
          here
        </Button>
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

export default CreateBulk;
