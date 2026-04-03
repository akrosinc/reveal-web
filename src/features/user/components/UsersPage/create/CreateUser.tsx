import { useCallback, useEffect, useState } from 'react';
import { Button, Col, Form, Modal, Row, ButtonGroup, ToggleButton } from 'react-bootstrap';
import Select, { MultiValue } from 'react-select';
import { createUser, createInstanceUser, getGroupManagementList, createGroupAuthUser, GroupModel } from '../../../api';
import { getOrganizationListSummary, getSecurityGroups } from '../../../../organization/api';
import { useForm } from 'react-hook-form';
import { CreateUserModel } from '../../../providers/types';
import { useAppSelector } from '../../../../../store/hooks';
import { toast } from 'react-toastify';
import { INSTANCE_USER_MANAGEMENT, REGEX_EMAIL_VALIDATION, REGEX_USERNAME_VALIDATION, USER_MANAGEMENT_ADD_GLOBAL_ADMIN, USER_MANAGEMENT_ADD_USER_TO_INSTANE } from '../../../../../constants';
import { FieldValidationError } from '../../../../../api/providers';
import { getInstances } from '../../../../instanceConfiguration/api';
import { useAuthorization } from '../../../../../hooks/useAuthorization';
import { STANDARD_USER, SUPER_ADMIN } from '../../../../../constants/userRoles';
import AuthorizedElement from '../../../../../components/AuthorizedElement';

interface RegisterValues {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  securityGroups: string[];
  organizations: string[];
  bulk: File[];
  userType: string;
  instances: string[];
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
  const [selectedSecurityGroups, setSelectedSecurityGroups] = useState<Options[]>();
  const [selectedOrganizations, setSelectedOrganizations] = useState<Options[]>();
  const [selectedInstance, setSelectedInstance] = useState<Options | null>(null);
  const [userType, setUserType] = useState(STANDARD_USER?.replace('/', ''));
  const [isInstanceAdmin, setIsInstanceAdmin] = useState(false);
  // const isAuthorized = true
  const isAuthorized = useAuthorization([USER_MANAGEMENT_ADD_USER_TO_INSTANE])
  const isAuthorizedForInstanceUserMgmt = useAuthorization([INSTANCE_USER_MANAGEMENT])
  const {
    reset,
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<RegisterValues>();
  const [groups, setGroups] = useState<Options[]>();
  const [organizations, setOrganizations] = useState<Options[]>([]);
  const [instances, setInstances] = useState<Options[]>([]);
  const [groupOptions, setGroupOptions] = useState<Options[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Options | null>(null);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const isDarkMode = useAppSelector(state => state.darkMode.value);
  const ctx = useAppSelector(state => state.instanceContext);
  console.log(isAuthorizedForInstanceUserMgmt)
  useEffect(() => {
    if (show && isAuthorized) {
      getInstances(1000, 0).then(res => {
        const fetchedInstances = res.content.map(inst => ({
          value: inst.identifier,
          label: inst?.instanceName as string
        }));
        setInstances(fetchedInstances);
        if (fetchedInstances.length === 0) {
          toast.warn('No instances found. User creation might be restricted.');
        }
      });
    }
  }, [show, isAuthorized]);

  useEffect(() => {
    if (selectedInstance && !isInstanceAdmin && isAuthorized) {
      setIsLoadingGroups(true);
      getGroupManagementList(selectedInstance.value)
        .then(res => {
          const groups = res.content.map((g: GroupModel) => ({
            value: g.identifier,
            label: g.name
          }));
          setGroupOptions(groups);
          if (groups.length === 0) {
            toast.warn('No groups found for this instance.');
          }
        })
        .finally(() => setIsLoadingGroups(false));
    } else {
      setGroupOptions([]);
      setSelectedGroup(null);
    }
  }, [selectedInstance, isInstanceAdmin, isAuthorized]);
  useEffect(()=>{
    if(isAuthorizedForInstanceUserMgmt && ctx?.selectedInstance?.identifier){
       getGroupManagementList(ctx.selectedInstance.identifier)
        .then(res => {
          const groups = res.content.map((g: GroupModel) => ({
            value: g.identifier,
            label: g.name
          }));
          setGroupOptions(groups);
          if (groups.length === 0) {
            toast.warn('No groups found for this instance.');
          }
        })
        .finally(() => setIsLoadingGroups(false));
    }
  },[isAuthorizedForInstanceUserMgmt])

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

  const instanceSelectHandler = (selectedOption: any) => {
    setSelectedInstance(selectedOption);
  };

  const submitHandler = (formValues: RegisterValues) => {
    if (selectedInstance && isAuthorized && userType === STANDARD_USER?.replace('/', '')) {
      if (!selectedInstance) {
        toast.error('Please select an instance.');
        return;
      }
      if (!isInstanceAdmin && !selectedGroup) {
        toast.error('Please select a group.');
        return;
      }

      const payloadBase = {
        username: formValues.username,
        firstName: formValues.firstname,
        lastName: formValues.lastname,
        email: formValues.email === '' ? null : formValues.email,
        password: formValues.password,
        tempPassword: true,
        securityGroups: [userType],
        instanceIdentifier: selectedInstance.value,
        isInstanceAdmin: isInstanceAdmin
      };

      const apiCall = isInstanceAdmin
        ? createInstanceUser(payloadBase)
        : createGroupAuthUser({ ...payloadBase, groupIdentifier: selectedGroup!.value });

      toast.promise(apiCall, {
        pending: isInstanceAdmin ? 'Creating instance admin...' : 'Creating standard user...',
        success: {
          render() {
            reset();
            setSelectedInstance(null);
            setSelectedGroup(null);
            setIsInstanceAdmin(false);
            handleClose();
            return `${ isInstanceAdmin ? 'Instance admin' : 'Standard user' } (${payloadBase.username}) created successfully.`;
          }
        },
        error: {

          render({ data: err }: { data: any }) {
            // console.log(err)
            return err?.message || err?.data?.message || err || 'Failed to create instance user';
          }
        }
      });
      return;
    }
//
    if(selectedInstance && isAuthorizedForInstanceUserMgmt && userType === STANDARD_USER?.replace('/', '')){
       const payloadBase = {
        username: formValues.username,
        firstName: formValues.firstname,
        lastName: formValues.lastname,
        email: formValues.email === '' ? null : formValues.email,
        password: formValues.password,
        tempPassword: true,
        securityGroups: [userType],
        instanceIdentifier:ctx.selectedInstance?.identifier || '',
        isInstanceAdmin: false
      };
      if(groupOptions.length > 0 && !selectedGroup){
        toast.error('Please select a group.');
        return;
      }

      const apiCall = groupOptions?.length === 0
        ? createInstanceUser({...payloadBase,isInstanceAdmin:true})
        : createGroupAuthUser({ ...payloadBase, groupIdentifier: selectedGroup!.value });
        

      toast.promise(apiCall, {
        pending: groupOptions?.length === 0 ? 'Creating instance admin...' : 'Creating standard user...',
        success: {
          render() {
            reset();
            setSelectedInstance(null);
            setSelectedGroup(null);
            setIsInstanceAdmin(false);
            handleClose();
            return `${groupOptions?.length === 0 ? 'Instance admin' : 'Standard user'} (${payloadBase.username}) created successfully.`;
          }
        },
        error: {

          render({ data: err }: { data: any }) {
            // console.log(err)
            return err?.message || err?.data?.message || err || 'Failed to create instance user';
          }
        }
      });
      return;
    }
//
    let newUser: CreateUserModel = {
      username: formValues.username,
      email: formValues.email === '' ? null : formValues.email,
      firstName: formValues.firstname,
      lastName: formValues.lastname,
      organizations: selectedOrganizations?.map(el => el.value) ?? [],
      securityGroups: [userType],
      password: formValues.password,
      tempPassword: false,
    };

    toast.promise(createUser(newUser), {
      pending: 'Loading...',
      success: {
        render() {
          reset();
          setSelectedOrganizations([]);
          setSelectedSecurityGroups([]);
          handleClose();
          return `${userType === SUPER_ADMIN?.replace('/', '') ? 'Global Admin' : 'Standard User'} (${newUser.username}) created successfully.`;
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
  };

  const userTypeOptions = [
    { name: 'Admin', value: SUPER_ADMIN?.replace('/', '') },
    { name: 'Standard User', value: STANDARD_USER?.replace('/', '') }
  ];

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false} centered scrollable contentClassName={isDarkMode ? 'bg-dark' : 'bg-white'}>
      <Modal.Header closeButton>
        <Modal.Title>Create user</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <AuthorizedElement roles={[USER_MANAGEMENT_ADD_GLOBAL_ADMIN]}>
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
          </AuthorizedElement>

          <Form.Group className="mb-2">
            <Form.Label>Username</Form.Label>
            <Form.Control
              id="username-input"
              {...register('username', {
                required: 'Username must not be empty',
                pattern: {
                  value: REGEX_USERNAME_VALIDATION,
                  message: 'Username contains unsupported characters.'
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
            {errors.email && <Form.Label className="text-danger">Please enter a valid email address.</Form.Label>}
          </Form.Group>
          {userType===STANDARD_USER?.replace('/','') && isAuthorizedForInstanceUserMgmt && (
              <Form.Group className="mb-3">
                  <Form.Label>Select Group</Form.Label>
                  <Select
                    className="custom-react-select-container"
                    classNamePrefix="custom-react-select"
                    id="group-select"
                    value={selectedGroup}
                    options={groupOptions}
                    onChange={(option) => setSelectedGroup(option as Options)}
                    placeholder={isLoadingGroups ? "Loading groups..." : "Select group..."}
                    isDisabled={isLoadingGroups || groupOptions.length === 0}
                  />
                  {groupOptions.length === 0 && !isLoadingGroups && selectedInstance && (
                    <Form.Text className="text-danger mt-1 d-block">
                      No groups available for this instance.
                    </Form.Text>
                  )}
                </Form.Group>
          )}
          { userType===STANDARD_USER?.replace('/','') && isAuthorized && (
            <>
              {instances.length === 0 && (
                <div className="alert alert-warning py-2 mb-3 small">
                  No instances found. Please ensure at least one instance exists.
                </div>
              )}
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="is-instance-admin-checkbox"
                  label="Is Instance Admin"
                  checked={isInstanceAdmin}
                  onChange={(e) => setIsInstanceAdmin(e.target.checked)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Select Instance</Form.Label>
                <Select
                  className="custom-react-select-container"
                  classNamePrefix="custom-react-select"
                  id="instance-select"
                  value={selectedInstance}
                  options={instances}
                  onChange={instanceSelectHandler}
                  placeholder="Select instance..."
                />
              </Form.Group>


              {!isInstanceAdmin && (
                <Form.Group className="mb-3">
                  <Form.Label>Select Group</Form.Label>
                  <Select
                    className="custom-react-select-container"
                    classNamePrefix="custom-react-select"
                    id="group-select"
                    value={selectedGroup}
                    options={groupOptions}
                    onChange={(option) => setSelectedGroup(option as Options)}
                    placeholder={isLoadingGroups ? "Loading groups..." : "Select group..."}
                    isDisabled={isLoadingGroups || groupOptions.length === 0}
                  />
                  {groupOptions.length === 0 && !isLoadingGroups && selectedInstance && (
                    <Form.Text className="text-danger mt-1 d-block">
                      No groups available for this instance.
                    </Form.Text>
                  )}
                </Form.Group>
              )}
            </>
          )}
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
