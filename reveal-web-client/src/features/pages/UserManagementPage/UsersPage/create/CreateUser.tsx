import { useState } from "react";
import { Button, Container, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { USER_MANAGEMENT } from "../../../../../constants";
import Select, { MultiValue } from "react-select";
import { useAppSelector } from "../../../../../store/hooks";
import { uploadUserCsv } from "../../../../user/api";
import { useForm } from 'react-hook-form';


interface RegisterValues {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  securityGroups: string[];
  organizations: string[];
  bulk: File[];
}

const CreateUser = () => {
  const [bulkImport, setBulkImport] = useState(false);
  const [selectedSecurityGroups, setSelectedSecurityGroups] = useState<string[]>();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const options = useAppSelector((state) =>
    state.user.value.roles.roles.map((role) => {
      return {
        value: role,
        label: role,
      };
    })
  );

  const selectHandler = (selectedOption: MultiValue<{value: string;label: string;}>) => {
    const values = selectedOption.map((selected) => {
      return selected.value;
    })
    setSelectedSecurityGroups(values);
  }

  const submitHandler = (formValues: RegisterValues) => {
    if (bulkImport) {
      let csv: File = formValues.bulk[0];
      if (csv !== undefined && csv.name.includes(".csv")) {
        const formData = new FormData();
        formData.append('File', csv);
        uploadUserCsv(formData);
      }
    } else {
      console.log(selectedSecurityGroups);
    }
  }

  return (
    <Container>
      <h2 className="text-center">Create User</h2>
        <Form.Check
          type="switch"
          id="custom-switch"
          label="Bulk import"
          className="float-end"
          onChange={() => {
            setBulkImport(!bulkImport);
          }}
        />
      <Form onSubmit={handleSubmit(submitHandler)}>
        {bulkImport ? (
          <Form.Group className="my-4">
            <Form.Label>Please provide a csv file</Form.Label>
            <Form.Control {...register('bulk', { required: true })} type="file" />
            {errors.bulk && <Form.Label className="text-danger">Invalid file type.</Form.Label>}
          </Form.Group>
        ) : (
          <>
            <Form.Group className="mt-4 mb-3" controlId="username">
              <Form.Label>Username</Form.Label>
              <Form.Control {...register('username', { required: true })} type="username" placeholder="Enter username" />
              {errors.username && <Form.Label className="text-danger">Username must not be empty.</Form.Label>}
            </Form.Group>

            <Form.Group className="mb-3" controlId="firstname">
              <Form.Label>First name</Form.Label>
              <Form.Control {...register('firstname', { required: true })} type="text" placeholder="Enter First Name" />
              {errors.firstname && <Form.Label className="text-danger">First name must not be empty.</Form.Label>}
            </Form.Group>

            <Form.Group className="mb-3" controlId="formGridAddress1">
              <Form.Label>Last name</Form.Label>
              <Form.Control {...register('lastname', { required: true })} type="text" placeholder="Enter Last Name" />
              {errors.lastname && <Form.Label className="text-danger">Last name must not be empty.</Form.Label>}
            </Form.Group>

            <Form.Group className="mb-3" controlId="formGridAddress2">
              <Form.Label>Email</Form.Label>
              <Form.Control {...register('email', { required: true })} type="email" placeholder="Enter Email" />
              {errors.email && <Form.Label className="text-danger">Please enter a valid email.</Form.Label>}
            </Form.Group>
            <Form.Group className="mb-3" controlId="formGridCity">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formGridState">
              <Form.Label>Security groups</Form.Label>
              <Select isMulti options={options} onChange={selectHandler} />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formGridState">
              <Form.Label>Organization</Form.Label>
              <Form.Select defaultValue="Choose...">
                <option>Choose...</option>
                <option>...</option>
              </Form.Select>
            </Form.Group>
          </>
        )}

        <Button className="my-4 px-5" variant="primary" type="submit">
          Submit
        </Button>
        <Link
          className="btn btn-outline-primary my-4 ms-4 px-5"
          role="button"
          to={USER_MANAGEMENT + "/user"}
        >
          Cancel
        </Link>
      </Form>
    </Container>
  );
};

export default CreateUser;
