import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import Select, { MultiValue } from "react-select";
import axios from "../../../../../api/axios";
import { createUser } from "../../../../user/api";
import { getAllOrganizations } from "../../../../organization/api";
import { useForm } from "react-hook-form";
import { CreateUserModel } from "../../../../user/providers/types";
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
  subgroups: Groups[];
}

interface Options {
  value: string;
  label: string;
}

interface Props {
  show: boolean;
  handleClose: () => void;
}

const CreateUser = ({ show, handleClose }: Props) => {
  const dispatch = useAppDispatch();
  const [selectedSecurityGroups, setSelectedSecurityGroups] =
    useState<Options[]>();
  const [selectedOrganizations, setSelectedOrganizations] =
    useState<Options[]>();
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [groups, setGroups] = useState<Options[]>();
  const [organizations, setOrganizations] = useState<Options[]>([]);

  useEffect(() => {
    axios
      .get<Groups[]>(
        "https://sso-ops.akros.online/auth/admin/realms/reveal/groups"
      )
      .then((res) => {
        setGroups(
          res.data.map((el) => {
            return {
              value: el.name,
              label: el.name,
            };
          })
        );
      });
      getAllOrganizations().then((res) => {
        setOrganizations(
          res.content.map((el) => {
            return {
              value: el.identifier,
              label: el.name,
            };
          })
        );
      });
  }, []);

  const selectHandler = (
    selectedOption: MultiValue<{ value: string; label: string }>
  ) => {
    const values = selectedOption.map((selected) => {
      return selected;
    });
    setSelectedSecurityGroups(values);
  };

  const organizationSelectHandler = (
    selectedOption: MultiValue<{ value: string; label: string }>
  ) => {
    const values = selectedOption.map((selected) => {
      return selected;
    });
    setSelectedOrganizations(values);
  };

  const submitHandler = (formValues: RegisterValues) => {
    dispatch(showLoader(true));
    let newUser: CreateUserModel = {
      userName: formValues.username,
      email: formValues.email === "" ? null : formValues.email,
      firstName: formValues.firstname,
      lastName: formValues.lastname,
      organizations: selectedOrganizations?.map((el) => el.value) ?? [],
      securityGroups: selectedSecurityGroups?.map((el) => el.value) ?? [],
      password: formValues.password,
      tempPassword: false,
    };
    createUser(newUser)
      .then((res) => {
        dispatch(showInfo("User created successfully!"));
        reset();
        setSelectedOrganizations([]);
        setSelectedSecurityGroups([]);
        handleClose();
      })
      .catch((error) => {
        console.log(error.response);
        dispatch(showError(error.response.data.message));
      })
      .finally(() => {
        dispatch(showLoader(false));
      });
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop="static"
      keyboard={false}
      centered
      size="lg"
      scrollable
    >
      <Modal.Header closeButton>
        <Modal.Title>Create user</Modal.Title>
      </Modal.Header>
        <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              {...register("username", { required: true })}
              type="username"
              placeholder="Enter username"
            />
            {errors.username && (
              <Form.Label className="text-danger">
                Username must not be empty.
              </Form.Label>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>First name</Form.Label>
            <Form.Control
              {...register("firstname", { required: true })}
              type="text"
              placeholder="Enter First Name"
            />
            {errors.firstname && (
              <Form.Label className="text-danger">
                First name must not be empty.
              </Form.Label>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Last name</Form.Label>
            <Form.Control
              {...register("lastname", { required: true })}
              type="text"
              placeholder="Enter Last Name"
            />
            {errors.lastname && (
              <Form.Label className="text-danger">
                Last name must not be empty.
              </Form.Label>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              {...register("password", { required: true })}
              type="password"
            />
            {errors.password && (
              <Form.Label className="text-danger">
                Password must not be empty.
              </Form.Label>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              {...register("email", { required: false })}
              type="email"
              placeholder="Enter Email"
            />
            {errors.email && (
              <Form.Label className="text-danger">
                Please enter a valid email.
              </Form.Label>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Security groups</Form.Label>
            <Select
              isMulti
              value={selectedSecurityGroups}
              options={groups}
              onChange={selectHandler}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Organization</Form.Label>
            <Select
              isMulti
              value={selectedOrganizations}
              options={organizations}
              onChange={organizationSelectHandler}
            />
          </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSubmit(submitHandler)}>
            Submit
          </Button>
        </Modal.Footer>
    </Modal>
  );
};

export default CreateUser;
