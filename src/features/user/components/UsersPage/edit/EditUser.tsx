import { useCallback, useEffect, useState } from 'react';
import { Button, Form, Row, Col, ButtonGroup, ToggleButton } from 'react-bootstrap';
import { deleteUserById, resetUserPassword, updateUser } from '../../../../user/api';
import { EditUserModel, UserModel } from '../../../../user/providers/types';
import { ConfirmDialog } from '../../../../../components/Dialogs';
import { useAppSelector } from '../../../../../store/hooks';
import { useForm } from 'react-hook-form';
import Select, { MultiValue } from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { getOrganizationListSummary, getSecurityGroups } from '../../../../organization/api';
import { toast } from 'react-toastify';
import { FieldValidationError } from '../../../../../api/providers';
import { AxiosResponse } from 'axios';
import { REGEX_EMAIL_VALIDATION } from '../../../../../constants';
import AreasSelection from '../../../../groupConfiguration/components/AreasSelection';
import RolesSelection from '../../../../groupConfiguration/components/RolesSelection';
import DatasetsSelection from '../../../../groupConfiguration/components/DatasetsSelection';


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
  userType: string;
  instances: string[];
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
  const [selectedInstances, setSelectedInstances] = useState<Options[]>([]);
  const [userType, setUserType] = useState('Standard User');
  const [selectedGroup, setSelectedGroup] = useState<Options | null>(null);
  const [selectedUserAreas, setSelectedUserAreas] = useState<string[]>([]);
  const [selectedUserRoles, setSelectedUserRoles] = useState<string[]>([]);
  const [selectedUserDatasets, setSelectedUserDatasets] = useState<string[]>([]);
  const [areaTeams, setAreaTeams] = useState<Record<string, string>>({});
  // const level="Instance"
  const level = "Global"

  const {
    register,
    setValue,
    handleSubmit,
    setError,
    formState: { errors, isDirty }
  } = useForm<RegisterValues>();
  const [groups, setGroups] = useState<Options[]>();
  const [organizations, setOrganizations] = useState<Options[]>([]);
  const isDarkMode = useAppSelector(state => state.darkMode.value);

  const setStartValues = useCallback(
    (userDetails: UserModel & { userType?: string; instances?: string[] }) => {
      setValue('username', userDetails.username);
      setValue('firstname', userDetails.firstName);
      setValue('lastname', userDetails.lastName);
      setValue('email', userDetails.email);

      setUserType(userDetails.userType || 'Standard User');
      setSelectedInstances(
        userDetails.instances
          ? userDetails.instances.map(inst => ({ label: inst, value: inst }))
          : []
      );

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

  const getData = useCallback(() => {
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
      .catch(err => toast.error(err));
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
  }, [setStartValues, user]);

  useEffect(() => {
    getData();
  }, [getData]);

  const deleteHandler = (action: boolean) => {
    setShowDialog(false);
    if (action) {
      toast.promise(deleteUserById(user.identifier), {
        pending: 'Loading...',
        success: {
          render() {
            handleClose();
            return `User with id ${user.identifier} deleted successfully`;
          }
        },
        error: {
          render({ data: err }: { data: string }) {
            return err;
          }
        }
      });
    }
  };

  const submitHandler = (formValues: RegisterValues) => {
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
              return 'Password updated successfully.';
            }
          }
        },
        error: {
          render({ data: err }: { data: any }) {
            if (typeof err !== 'string') {
              const fieldValidationErrors = err as FieldValidationError[];
              return 'Field Validation Error: ' + fieldValidationErrors.map(errField => {
                setError(errField.field as any, { message: errField.messageKey });
                return errField.field;
              }).toString();
            }
            return err;
          }
        }
      });
    } else {
      let updatedUser: EditUserModel & { userType: string; instances: string[] } = {
        identifier: user.identifier,
        email: formValues.email,
        firstName: formValues.firstname,
        lastName: formValues.lastname,
        organizations: selectedOrganizations?.map(el => el.value) ?? [],
        securityGroups: selectedSecurityGroups?.map(el => el.value) ?? [],
        userType: userType,
        instances: selectedInstances.map(el => el.value),
        // groupId: selectedGroup?.value,
        // areas: selectedUserAreas,
        // roles: selectedUserRoles,
        // datasets: selectedUserDatasets
      };
      toast
        .promise(updateUser(updatedUser as any), {
          pending: 'Loading...',
          success: {
            render() {
              setEdit(false);
              handleClose();
              return `User with id ${user.identifier} updated successfully.`;
            }
          },
          error: {
            render({ data: err }: { data: any }) {
              if (typeof err !== 'string') {
                const fieldValidationErrors = err as FieldValidationError[];
                return 'Field Validation Error: ' + fieldValidationErrors.map(errField => {
                  setError(errField.field as any, { message: errField.messageKey });
                  return errField.field;
                }).toString();
              }
              return err;
            }
          }
        });
    }
  };

  const selectHandler = (selectedOption: MultiValue<{ value: string; label: string }>) => {
    const values = selectedOption.map(selected => {
      return selected;
    });
    setValue('securityGroups', values as any, { shouldDirty: true });
    setSelectedSecurityGroups(values);
  };

  const organizationSelectHandler = (selectedOption: MultiValue<{ value: string; label: string }>) => {
    const values = selectedOption.map(selected => {
      return selected;
    });
    setValue('organizations', values as any, { shouldDirty: true });
    setSelectedOrganizations(values);
  };

  const instanceSelectHandler = (selectedOption: MultiValue<Options>) => {
    const values = [...selectedOption];
    setSelectedInstances(values);
    setValue('instances', values as any, { shouldDirty: true });
  };

  const userTypeOptions = [
    { name: 'Admin', value: 'Admin' },
    { name: 'Standard User', value: 'Standard User' }
  ];

  return (
    <Form>
      <Form.Group className="mb-3">
        <Form.Label className="d-block">User Type</Form.Label>
        <ButtonGroup className="border rounded overflow-hidden" style={{ padding: 3 }}>
          {userTypeOptions.map((option, idx) => (
            <ToggleButton
              key={idx}
              id={`user-type-${idx}`}
              type="radio"
              variant={userType === option.value ? 'primary' : 'light'}
              name="userType"
              value={option.value}
              checked={userType === option.value}
              onChange={(e) => setUserType(e.currentTarget.value)}
              className={`py-2 border-0 rounded-0 ${userType !== option.value ? 'text-secondary bg-light bg-opacity-75' : ''}`}
              style={{ padding: '11px 30px' }}
            >
              {option.name}
            </ToggleButton>
          ))}
        </ButtonGroup>
      </Form.Group>

      {/* <Form.Group className="mb-2">
        <Form.Label>Instance Name</Form.Label>
        <CreatableSelect
          className="custom-react-select-container"
          classNamePrefix="custom-react-select"
          id="instances-select"
          menuPosition="fixed"
          isMulti
          isDisabled={!edit}
          value={selectedInstances}
          onChange={instanceSelectHandler}
          placeholder="Type instance name and press Enter"
          noOptionsMessage={() => 'Type to add new instance'}
        />
      </Form.Group> */}

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
          <div
            className="d-flex"
            style={{
              overflowX: "auto",
              overflowY: "hidden",
              whiteSpace: "nowrap",
              gap: "8px",
              scrollbarWidth: "none", marginTop: 4
            }}
          >
            {['Instance 1', 'Instance 2'].map((item, index) => (
              <div
                key={index}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "11px 20px",
                  borderRadius: "999px",
                  background: "#E2EDFe",
                  cursor: "pointer",
                  fontWeight: 400,
                  fontStyle: "normal",
                  fontSize: "14px",
                  lineHeight: "100%",
                  letterSpacing: "0%",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  transition: "all 0.2s ease",
                  color: "#0D6EFD"
                }}
              >
                {item}
              </div>
            ))}
          </div>
          {/* <Form.Group className="mb-3">
            <Form.Label>Security groups</Form.Label>
            <Select
              className="custom-react-select-container"
              classNamePrefix="custom-react-select"
              id="security-groups-select"
              {...register('securityGroups', { required: false })}
              isDisabled={!edit}
              isMulti
              value={selectedSecurityGroups}
              options={groups}
              onChange={selectHandler}
            />
          </Form.Group>

          {/* <Form.Group className="mb-3">
            <Form.Label>Organization</Form.Label>
            <Select
              className="custom-react-select-container"
              classNamePrefix="custom-react-select"
              id="organizations-select"
              {...register('organizations', { required: false })}
              isDisabled={!edit}
              isMulti
              value={selectedOrganizations}
              options={organizations}
              onChange={organizationSelectHandler}
            />
          </Form.Group> */}
          {/* For Instance level  */}
          <>
            <Form.Group className="mb-3">
              <Form.Label>Group</Form.Label>
              <Select
                className="custom-react-select-container"
                classNamePrefix="custom-react-select"
                id="group-select"
                isDisabled={!edit}
                value={selectedGroup}
                options={groups}
                onChange={(opt) => setSelectedGroup(opt as Options)}
                placeholder="Select a group..."
              />
            </Form.Group>

            <Row className="mb-4 g-3">
              <Col md={4}>
                <Form.Label>Areas</Form.Label>
                <div style={{ position: 'relative' }} className={!edit ? 'opacity-75 pointer-events-none' : ''}>
                  {!edit && <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, height: '100%', width: '100%', cursor: 'not-allowed',
                  }}></div>}
                  <AreasSelection
                    isTeamMode={false}
                    selectedAreas={selectedUserAreas}
                    onSelectionChange={setSelectedUserAreas}
                    areaTeams={areaTeams}
                    onAreaTeamChange={(id, team) => setAreaTeams(prev => ({ ...prev, [id]: team }))}
                    hideHeader={true}
                    textColor="black"
                  />
                </div>
              </Col>
              <Col md={4}>
                <Form.Label>Permission</Form.Label>
                <div style={{ position: 'relative' }} className={!edit ? 'opacity-75 pointer-events-none' : ''}>
                  {!edit && <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, height: '100%', width: '100%', cursor: 'not-allowed',
                  }}></div>}
                  <RolesSelection
                    selectedRoles={selectedUserRoles}
                    onRoleChange={setSelectedUserRoles}
                    hideHeader={true}
                    textColor="black"
                  />
                </div>
              </Col>
              <Col md={4}>
                <Form.Label>Datasets</Form.Label>
                <div style={{ position: 'relative' }} className={!edit ? 'opacity-75 pointer-events-none' : ''}>
                  {!edit && <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, height: '100%', width: '100%', cursor: 'not-allowed',

                  }}>

                  </div>}
                  <DatasetsSelection
                    selectedDatasets={selectedUserDatasets}
                    onDatasetChange={setSelectedUserDatasets}
                    hideHeader={true}
                    textColor="black"
                  />
                </div>
              </Col>
            </Row>
          </>
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
              setStartValues(user);
              setSelectedGroup(null);
              setSelectedUserAreas([]);
              setSelectedUserRoles([]);
              setSelectedUserDatasets([]);
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
          isDarkMode={isDarkMode}
        />
      )}
    </Form>
  );
};

export default EditUser;
