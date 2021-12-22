import { Button, Form, Modal } from "react-bootstrap";
import { uploadUserCsv } from "../../../../user/api";
import { useForm } from "react-hook-form";
import { useAppDispatch } from "../../../../../store/hooks";
import { showLoader } from "../../../../reducers/loader";
import { getSecurityGroups } from "../../../../organization/api";
import { toast } from "react-toastify";
import { ErrorModel } from "../../../../../api/ErrorModel";

interface RegisterValues {
  bulk: File[];
}

interface Props {
  show: boolean;
  handleClose: () => void;
}

const CreateBulk = ({ show, handleClose }: Props) => {
  const dispatch = useAppDispatch();
  const {
    reset,
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm();

  const submitHandler = (formValues: RegisterValues) => {
    let csv: File = formValues.bulk[0];
    if (csv !== undefined && csv.name.includes(".csv")) {
      dispatch(showLoader(true));
      const formData = new FormData();
      formData.append("File", csv);
      toast.promise(uploadUserCsv(formData), {
        pending: "CSV file is uploading...",
        success: {
          render({ data }) {
            reset();
            dispatch(showLoader(false));
            handleClose();
            return "CSV file uploaded successfully, you can track user creation progress in bulk import section."
          }
        },
        error: {
          render({ data }: ErrorModel) {
            dispatch(showLoader(false));
            setError("bulk", {}, {
              shouldFocus: true
            });
            return data.message;
          }
        }
      });
    } else {
      setError("bulk", {});
    }
  };

  const downloadSecurityGroups = () => {
      dispatch(showLoader(true));
      getSecurityGroups().then(res => {
        let csvContent =
          "data:text/csv;charset=utf-8," + res.map((group) => group.name);
        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "security_groups.csv");
        document.body.appendChild(link);
        dispatch(showLoader(false));
        link.click();
      })
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>{"Bulk user import"}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit(submitHandler)}>
        <Modal.Body>
          <Form.Group className="my-4">
            <Form.Label>Please provide a csv file</Form.Label>
            <Form.Control
              {...register("bulk", { required: true })}
              type="file"
              accept=".csv"
            />
            {errors.bulk && (
              <Form.Label className="text-danger">
                Invalid file type.
              </Form.Label>
            )}
          </Form.Group>
          <p>
            You can download CSV sample from{" "}
            <a href="/SampleCSVFile.csv" download>
              here
            </a>
          </p>
          <p>
            You can download security groups from{" "}
            <Button variant="link" className="pb-1 p-0" onClick={() => downloadSecurityGroups()}>here</Button>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CreateBulk;
