import { Button, Form, Modal } from "react-bootstrap";
import { uploadUserCsv } from "../../../../user/api";
import { useForm } from "react-hook-form";
import { showError, showInfo } from "../../../../reducers/tostify";
import { useAppDispatch } from "../../../../../store/hooks";
import { showLoader } from "../../../../reducers/loader";
import axios from "../../../../../api/axios";

interface RegisterValues {
  bulk: File[];
}

interface Groups {
  id: string;
  name: string;
  path: string;
  subgroups: Groups[];
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
      uploadUserCsv(formData)
        .then((res) => {
          reset();
          handleClose();
          dispatch(showInfo("User created successfully!"));
        })
        .catch((error) => {
          dispatch(showError(error.response.data.message));
          setError("bulk", {});
        })
        .then(() => {
          dispatch(showLoader(false));
        });
    } else {
      setError("bulk", {});
    }
  };

  const downloadSecurityGroups = () => {
    axios
      .get<Groups[]>(
        "https://sso-ops.akros.online/auth/admin/realms/reveal/groups"
      )
      .then((res) => {
        console.log(res.data);
        let csvContent =
          "data:text/csv;charset=utf-8," + res.data.map((group) => group.name);
        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "security_groups.csv");
        document.body.appendChild(link);
        link.click();
      });
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
