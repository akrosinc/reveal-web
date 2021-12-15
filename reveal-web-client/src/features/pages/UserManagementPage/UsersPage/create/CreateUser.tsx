import { useEffect, useState } from "react";
import { Button, Container, Form, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { USER_MANAGEMENT } from "../../../../../constants";
import Select, { MultiValue } from "react-select";
import axios from "../../../../../api/axios";
import { createUser, uploadUserCsv } from "../../../../user/api";
import { getAllOrganizations } from "../../../../organization/api";
import { useForm } from 'react-hook-form';
import { UserModel } from "../../../../user/providers/types";
import { showError, showInfo } from "../../../../reducers/tostify";
import { useAppDispatch } from "../../../../../store/hooks";
import { showLoader } from "../../../../reducers/loader";


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

interface Groups {
  id: string;
  name: string;
  path: string;
  subgroups: Groups[]
}

interface Options {
  value: string,
  label: string
}

interface Props {
  bulk: boolean
}

const CreateUser = ({bulk}: Props) => {
  const [bulkImport] = useState(bulk);
  const dispatch = useAppDispatch();
  const [selectedSecurityGroups, setSelectedSecurityGroups] = useState<Options[]>();
  const [selectedOrganizations, setSelectedOrganizations] = useState<Options[]>();
  const {
    reset,
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm();
  const [groups, setGroups] = useState<Options[]>();
  const [organizations, setOrganizations] = useState<Options[]>([]);

  useEffect(() => {
    axios.get<Groups[]>("https://sso-ops.akros.online/auth/admin/realms/reveal/groups").then(res => {
      setGroups(res.data.map(el => {
        return {
          value: el.name,
          label: el.name
        }
      }));
      getAllOrganizations().then(res => {
        setOrganizations(res.content.map(el => {
          return {
            value: el.identifier,
            label: el.name
          }
        }));
      })
    })
  }, [])

  const selectHandler = (selectedOption: MultiValue<{value: string;label: string;}>) => {
    const values = selectedOption.map((selected) => {
      return selected;
    })
    setSelectedSecurityGroups(values);
  }

  const organizationSelectHandler = (selectedOption: MultiValue<{value: string;label: string;}>) => {
    const values = selectedOption.map((selected) => {
      return selected;
    })
    setSelectedOrganizations(values);
  }

  const submitHandler = (formValues: RegisterValues) => {
    if (bulkImport) {
      let csv: File = formValues.bulk[0];
      if (csv !== undefined && csv.name.includes(".csv")) {
        const formData = new FormData();
        formData.append('File', csv);
        uploadUserCsv(formData);
      } else {
        setError("bulk", {});
      }
    } else {
      dispatch(showLoader(true));
      let newUser: UserModel = {
        identifier: "",
        userName: formValues.username,
        email: formValues.email,
        firstName: formValues.firstname,
        lastName: formValues.lastname,
        organizations: selectedOrganizations?.map(el => el.value) ?? [],
        securityGroups: selectedSecurityGroups?.map(el => el.value) ?? [],
        password: formValues.password,
        tempPassword: false
      }
      createUser(newUser).then(res => {
        dispatch(showInfo("User created successfully!"));
        reset();
        setSelectedOrganizations([]);
        setSelectedSecurityGroups([]);
      }).catch(error => {
        dispatch(showError(error.response.data.message));
      }).finally(() => {
        dispatch(showLoader(false));
      });
    }
  }

  return (
    <Container className="py-4">
      <Row>
        <Col md={8} className="mx-auto">
      <h2 className="text-center">{bulk ? "Bulk user import" : "Create user"}</h2>
      <Form onSubmit={handleSubmit(submitHandler)}>
        {bulkImport ? (
          <>
          <Form.Group className="my-4">
            <Form.Label>Please provide a csv file</Form.Label>
            <Form.Control {...register('bulk', { required: true })} type="file" accept=".csv" />
            {errors.bulk && <Form.Label className="text-danger">Invalid file type.</Form.Label>}
          </Form.Group>
          <p>You can download CSV sample from <a href="/SampleCSVFile.csv" download>here</a></p>
          </>
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
              <Form.Control {...register('password', { required: true })} type="password" />
              {errors.password && <Form.Label className="text-danger">Password must not be empty.</Form.Label>}
            </Form.Group>

            <Form.Group className="mb-3" controlId="formGridState">
              <Form.Label>Security groups</Form.Label>
              <Select isMulti value={selectedSecurityGroups} options={groups} onChange={selectHandler} />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formGridState">
              <Form.Label>Organization</Form.Label>
              <Select isMulti value={selectedOrganizations} options={organizations} onChange={organizationSelectHandler} />
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
      </Col>
      </Row>
    </Container>
  );
};

export default CreateUser;
