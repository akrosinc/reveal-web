import { useCallback, useEffect, useState } from 'react';
import { Button, Form, Row, Col } from 'react-bootstrap';
import { deleteUserById, resetUserPassword, updateUser } from '../../../../user/api';
import { EditUserModel, UserModel } from '../../../../user/providers/types';
import { ConfirmDialog } from '../../../../../components/Dialogs';
import { showLoader } from '../../../../reducers/loader';
import { useAppDispatch } from '../../../../../store/hooks';
import { useForm } from 'react-hook-form';
import Select, { MultiValue } from 'react-select';
import { getOrganizationListSummary, getSecurityGroups } from '../../../../organization/api';
import { toast } from 'react-toastify';
import { ErrorModel } from '../../../../../api/providers';
import { AxiosResponse } from 'axios';
import { REGEX_EMAIL_VALIDATION } from '../../../../../constants';

interface Props {
  user: UserModel;
  handleClose: () => void;
}

interface RegisterValues {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  securityGroups: string[];
  organizations: string[];
  isTemp: boolean;
}

interface Options {
  value: string;
  label: string;
}

const EditUser = ({ user, handleClose }: Props) => {
  const [edit, setEdit] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedSecurityGroups, setSelectedSecurityGroups] = useState<Options[]>();
  const [selectedOrganizations, setSelectedOrganizations] = useState<Options[]>();
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors, isDirty }
  } = useForm();
  const [groups, setGroups] = useState<Options[]>();
  const [organizations, setOrganizations] = useState<Options[]>([]);
  const dispatch = useAppDispatch();

  const setStartValues = useCallback(
    (userDetails: UserModel) => {
      setValue('username', userDetails.username);
      setValue('firstname', userDetails.firstName);
      setValue('lastname', userDetails.lastName);
      setValue('email', userDetails.email);
      setSelectedSecurityGroups(
        userDetails.securityGroups !== undefined
          ? userDetails.securityGroups.map(group => {
              return {
                label: group,
                value: group
              };
            })
          : []
      );
      setSelectedOrganizations(
        userDetails.organizations.map(org => {
          return {
            label: org.name,
            value: org.identifier
          };
        })
      );
    },
    [setValue]
  );

  const getData = useCallback(
    () => {
      getSecurityGroups()
        .then(res => {
          setGroups(
            res.map(el => {
              return {
                label: el.name,
                value: el.name
              };
            })
          );
        })
        .catch(err => toast.error(err.message !== undefined ? err.message : err.toString()));
      getOrganizationListSummary().then(res => {
        setOrganizations(
          res.content.map(org => {
            return {
              label: org.name,
              value: org.identifier
            };
          })
        );
      });
      setStartValues(user);
    },
    [setStartValues, user]
  );

  useEffect(() => {
    getData();
  }, [getData]);

  const deleteHandler = (action: boolean) => {
    setShowDialog(false);
    if (action) {
      dispatch(showLoader(true));
      toast.promise(deleteUserById(user.identifier), {
        pending: 'Loading...',
        success: {
          render() {
            dispatch(showLoader(false));
            handleClose();
            return `User with id ${user.identifier} deleted successfully`;
          }
        },
        error: {
          render({ data }: { data: ErrorModel }) {
            dispatch(showLoader(false));
            return data.message !== undefined ? data.message : data.error;
          }
        }
      });
    }
  };

  const submitHandler = (formValues: RegisterValues) => {
    dispatch(showLoader(true));
    if (changePassword) {
      const passwordModel = {
        identifier: user.identifier,
        password: formValues.password,
        tempPassword: formValues.isTemp
      };
      toast.promise(resetUserPassword(passwordModel), {
        pending: 'Loading...',
        success: {
          render({ data }) {
            const response = data as AxiosResponse;
            if (response.status === 204) {
              setChangePassword(false);
              setEdit(false);
              dispatch(showLoader(false));
              return 'Password updated successfully.';
            }
          }
        },
        error: {
          render({ data }: { data: ErrorModel }) {
            dispatch(showLoader(false));
            return data !== undefined ? data.message : 'Something went wrong!';
          }
        }
      });
    } else {
      let updatedUser: EditUserModel = {
        identifier: user.identifier,
        email: formValues.email,
        firstName: formValues.firstname,
        lastName: formValues.lastname,
        organizations: selectedOrganizations?.map(el => el.value) ?? [],
        securityGroups: selectedSecurityGroups?.map(el => el.value) ?? []
      };
      toast
        .promise(updateUser(updatedUser), {
          pending: 'Loading...',
          success: {
            render() {
              setEdit(false);
              handleClose();
              return `User with id ${user.identifier} updated successfully.`;
            }
          },
          error: {
            render({ data }: { data: ErrorModel }) {
              return data !== undefined ? data.message : 'Something went wrong!';
            }
          }
        })
        .finally(() => dispatch(showLoader(false)));
    }
  };

  const selectHandler = (selectedOption: MultiValue<{ value: string; label: string }>) => {
    const values = selectedOption.map(selected => {
      return selected;
    });
    setValue('securityGroups', values, { shouldDirty: true });
    setSelectedSecurityGroups(values);
  };

  const organizationSelectHandler = (selectedOption: MultiValue<{ value: string; label: string }>) => {
    const values = selectedOption.map(selected => {
      return selected;
    });
    setValue('organizations', values, { shouldDirty: true });
    setSelectedOrganizations(values);
  };

  return (
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>Identifier</Form.Label>
        <Form.Control readOnly={true} type="text" defaultValue={user?.identifier} />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Username</Form.Label>
        <Form.Control readOnly={true} type="username" defaultValue={user?.username} />
      </Form.Group>
      {changePassword ? (
        <>
          <Form.Group className="mb-3">
            <Form.Label>Change password</Form.Label>
            <Form.Control
              id="new-password-input"
              type="password"
              placeholder="Enter new password"
              {...register('password', {
                required: 'Password can not be empty',
                minLength: { value: 5, message: 'Password must be at least 5 characters long' }
              })}
            />
            {errors.password && <Form.Label className="text-danger">{errors.password.message}</Form.Label>}
          </Form.Group>
          <Form.Group className="mb-3 d-flex">
            <Form.Label>Request user to change password after first login?</Form.Label>
            <Form.Check className="ms-2" type="checkbox" {...register('isTemp', { required: false })} />
          </Form.Group>
        </>
      ) : (
        <>
          <Row>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>First name</Form.Label>
                <Form.Control
                  id="first-name-input"
                  readOnly={!edit}
                  type="text"
                  placeholder="Enter first name"
                  {...register('firstname', {
                    required: 'First name must not be empty.',
                    minLength: 1,
                    pattern: {
                      value: new RegExp('^[^\\s]+[-a-zA-Z\\s]+([-a-zA-Z]+)*$'),
                      message: "First name can't start with empty space."
                    }
                  })}
                />
                {errors.firstname && <Form.Label className="text-danger">{errors.firstname.message}</Form.Label>}
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Last name</Form.Label>
                <Form.Control
                  id="last-name-input"
                  readOnly={!edit}
                  type="text"
                  placeholder="Enter last name"
                  {...register('lastname', {
                    required: 'Last name must not be empty.',
                    minLength: 1,
                    pattern: {
                      value: new RegExp('^[^\\s]+[-a-zA-Z\\s]+([-a-zA-Z]+)*$'),
                      message: "Last name can't start with empty space."
                    }
                  })}
                />
                {errors.lastname && <Form.Label className="text-danger">{errors.lastname.message}</Form.Label>}
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              id="email-input"
              readOnly={!edit}
              type="email"
              placeholder="Enter email"
              defaultValue={user?.email}
              {...register('email', {
                required: false,
                pattern: {
                  value: REGEX_EMAIL_VALIDATION,
                  message: 'Please enter a valid email address'
                }
              })}
            />
            {errors.email && <Form.Label className="text-danger">{errors.email.message}</Form.Label>}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Security groups</Form.Label>
            <Select
              id="security-groups-select"
              {...register('securityGroups', { required: false })}
              isDisabled={!edit}
              isMulti
              value={selectedSecurityGroups}
              options={groups}
              onChange={selectHandler}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Organization</Form.Label>
            <Select
              id="organizations-select"
              {...register('organizations', { required: false })}
              isDisabled={!edit}
              isMulti
              value={selectedOrganizations}
              options={organizations}
              onChange={organizationSelectHandler}
            />
          </Form.Group>
        </>
      )}
      <hr />
      {edit ? (
        <>
          <Button
            id="change-password-button"
            className="float-start"
            onClick={() => setChangePassword(!changePassword)}
            hidden={changePassword}
          >
            Change password
          </Button>
          <Button
            id="save-button"
            className="float-end"
            variant="primary"
            disabled={!isDirty}
            onClick={handleSubmit(submitHandler)}
          >
            Save
          </Button>
          <Button
            id="discard-button"
            className="float-end me-2 btn-secondary"
            onClick={() => {
              setEdit(!edit);
              setChangePassword(false);
            }}
          >
            Discard changes
          </Button>
        </>
      ) : (
        <>
          <Button id="edit-button" className="float-end" variant="primary" onClick={() => setEdit(!edit)}>
            Edit
          </Button>
          <Button
            id="delete-button"
            className="float-end me-2"
            variant="primary"
            onClick={() => setShowDialog(!showDialog)}
          >
            Delete
          </Button>
          <Button id="close-button" className="float-start" variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </>
      )}
      {showDialog && (
        <ConfirmDialog
          closeHandler={deleteHandler}
          message={'Are you sure you want to permanently delete the user ' + user?.username}
          title="Delete user"
          backdrop={true}
        />
      )}
    </Form>
  );
};

export default EditUser;
