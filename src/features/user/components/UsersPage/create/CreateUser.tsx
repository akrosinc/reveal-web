import { useCallback, useEffect, useState } from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import Select, { MultiValue } from 'react-select';
import { createUser } from '../../../api';
import { getAllOrganizations, getSecurityGroups } from '../../../../organization/api';
import { useForm } from 'react-hook-form';
import { CreateUserModel } from '../../../providers/types';
import { useAppDispatch } from '../../../../../store/hooks';
import { showLoader } from '../../../../reducers/loader';
import { toast } from 'react-toastify';
import { ErrorModel } from '../../../../../api/providers';
import { REGEX_EMAIL_VALIDATION, REGEX_USERNAME_VALIDATION } from '../../../../../constants';

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
  const [selectedSecurityGroups, setSelectedSecurityGroups] = useState<Options[]>();
  const [selectedOrganizations, setSelectedOrganizations] = useState<Options[]>();
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterValues>();
  const [groups, setGroups] = useState<Options[]>();
  const [organizations, setOrganizations] = useState<Options[]>([]);

  const getData = useCallback(() => {
    getSecurityGroups().then(res => {
      setGroups(
        res.map(el => {
          return {
            value: el.name,
            label: el.name
          };
        })
      );
    });
    getAllOrganizations().then(res => {
      setOrganizations(
        res.content.map(el => {
          return {
            value: el.identifier,
            label: el.name
          };
        })
      );
    });
  }, []);

  useEffect(() => {
    getData();
  }, [getData]);

  const selectHandler = (selectedOption: MultiValue<{ value: string; label: string }>) => {
    const values = selectedOption.map(selected => {
      return selected;
    });
    setSelectedSecurityGroups(values);
  };

  const organizationSelectHandler = (selectedOption: MultiValue<{ value: string; label: string }>) => {
    const values = selectedOption.map(selected => {
      return selected;
    });
    setSelectedOrganizations(values);
  };

  const submitHandler = (formValues: RegisterValues) => {
    dispatch(showLoader(true));
    let newUser: CreateUserModel = {
      username: formValues.username,
      email: formValues.email === '' ? null : formValues.email,
      firstName: formValues.firstname,
      lastName: formValues.lastname,
      organizations: selectedOrganizations?.map(el => el.value) ?? [],
      securityGroups: selectedSecurityGroups?.map(el => el.value) ?? [],
      password: formValues.password,
      tempPassword: false
    };
    toast.promise(createUser(newUser), {
      pending: 'Loading...',
      success: {
        render({ data }) {
          reset();
          setSelectedOrganizations([]);
          setSelectedSecurityGroups([]);
          dispatch(showLoader(false));
          handleClose();
          return `User ${newUser.username} created successfully.`;
        }
      },
      error: {
        render({ data }: { data: ErrorModel }) {
          dispatch(showLoader(false));
          return data.message !== undefined ? data.message : 'Error creating user, please try again.';
        }
      }
    });
  };

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false} centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>Create user</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-2">
            <Form.Label>Username</Form.Label>
            <Form.Control
              id="username-input"
              {...register('username', {
                required: 'Username must not be empty',
                pattern: {
                  value: REGEX_USERNAME_VALIDATION,
                  message: 'Username containts unsupported characters.'
                }
              })}
              type="username"
              placeholder="Enter username"
            />
            {errors.username && <Form.Label className="text-danger">{errors.username.message}</Form.Label>}
          </Form.Group>
          <Row>
            <Col>
              <Form.Group className="mb-2">
                <Form.Label>First name</Form.Label>
                <Form.Control
                  id="first-name-input"
                  {...register('firstname', {
                    required: 'First name must not be empty.',
                    minLength: { message: 'First name must be at least 2 chars long.', value: 2 },
                    pattern: {
                      value: new RegExp('^[^\\s]+[-a-zA-Z\\s]+([-a-zA-Z]+)*$'),
                      message: "First name can't start with empty space."
                    }
                  })}
                  type="text"
                  placeholder="Enter First Name"
                />
                {errors.firstname && <Form.Label className="text-danger">{errors.firstname.message}</Form.Label>}
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-2">
                <Form.Label>Last name</Form.Label>
                <Form.Control
                  id="last-name-input"
                  {...register('lastname', {
                    required: 'Last name must not be empty.',
                    minLength: { message: 'Last name must be at least 2 chars long.', value: 2 },
                    pattern: {
                      value: new RegExp('^[^\\s]+[-a-zA-Z\\s]+([-a-zA-Z]+)*$'),
                      message: "Last name can't start with empty space."
                    }
                  })}
                  type="text"
                  placeholder="Enter Last Name"
                />
                {errors.lastname && <Form.Label className="text-danger">{errors.lastname.message}</Form.Label>}
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-2">
            <Form.Label>Password</Form.Label>
            <Form.Control
              id="password-input"
              {...register('password', { required: true, minLength: 5 })}
              type="password"
            />
            {errors.password && (
              <Form.Label className="text-danger">Password must not be empty and at least 5 chars long.</Form.Label>
            )}
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Email</Form.Label>
            <Form.Control
              id="email-input"
              {...register('email', {
                required: false,
                pattern: {
                  value: REGEX_EMAIL_VALIDATION,
                  message: 'Please enter a valid email address'
                }
              })}
              type="email"
              placeholder="Enter Email"
            />
            {errors.email && <Form.Label className="text-danger">Please enter a valid email.</Form.Label>}
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Security groups</Form.Label>
            <Select
              id="security-groups-select"
              menuPosition="fixed"
              isMulti
              value={selectedSecurityGroups}
              options={groups}
              onChange={selectHandler}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Organization</Form.Label>
            <Select
              id="organizations-select"
              menuPosition="fixed"
              isMulti
              value={selectedOrganizations}
              options={organizations}
              onChange={organizationSelectHandler}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button id="close-button" variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button id="submit-button" variant="primary" onClick={handleSubmit(submitHandler)}>
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateUser;
