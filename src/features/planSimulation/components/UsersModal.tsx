import React, { useState, useCallback, useEffect } from 'react';
import { Button, Col, Container, Form, Modal, Row, Nav, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Select, { MultiValue, SingleValue } from 'react-select';
import { DebounceInput } from 'react-debounce-input';

import {
  CreateUserRequest,
  CreateUserResponse,
  createUser,
  UserModel,
  getOrganizationMembers,
  getUserList,
  addUserToOrganization,
  MemberModel,
  createOrganization,
  deleteUserFromOrganization
} from '../../planSimulation/components/User/api/userAPI';
import { getOrganizationList } from './Teams/api/teamAPI';
import {
  getOrganizationListSummary,
  getSecurityGroups,
  getOrganizationById
} from '../../organization/api';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { REGEX_EMAIL_VALIDATION, REGEX_NAME_VALIDATION, REGEX_USERNAME_VALIDATION } from '../../../constants/constants';
import {
  faUserPlus,
  faUsers,
  faUser,
  faSort,
  faFilter,
  faCogs,
  faUsersCog,
  faArrowRight,
  faArrowLeft,
  faArrowUp,
  faArrowDown
} from '@fortawesome/free-solid-svg-icons';
import style from './Users.module.css';
import CreateUser from '../../user/components/UsersPage/create/CreateUser';
import { OrganizationModel } from '../../organization/providers/types';
import { FieldValidationError } from '../../../api/providers';
import Accordion from '../../location/components/accordion/Accordion';
import { string } from 'mathjs';
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
interface Option {
  value: string;
  label: string;
}

interface Options {
  value: string;
  label: string;
}
interface UserModalProps {
  
  
  className?: string;
}

interface TeamsRegisterValues {
  name: string;
  type: string;
  partOf: string;
  active: boolean;
}

export default function UserModal(){
  const [selectedSecurityGroups, setSelectedSecurityGroups] = useState<Options[]>();
  const [selectedTeamSecurityGroups, setSelectedTeamSecurityGroups] = useState<SingleValue<Option>>();
  const [teamOrganization, setteamOrganization] = useState<OrganizationModel[]>([]);
  const [selectedOrganizations, setSelectedOrganizations] = useState<Options[]>();
  const [organizations, setOrganizations] = useState<Options[]>([]);
  const [groups, setGroups] = useState<Options[]>();
  const [users, setUsers] = useState<UserModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [sortField, setSortField] = useState<string>('firstName');
  const [sortDirection, setSortDirection] = useState<boolean>(true);

  const [teamSortField, setTeamSortField] = useState<string>('name');
  const [teamSortDirection, setTeamSortDirection] = useState<boolean>(true);

  const [teams, setTeams] = useState<string[]>([]);
  const [direction, setDirection] = useState<boolean>(true);
  const [teamSearchTerm, setTeamSearchTerm] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ firstName: '', lastName: '', email: '' });
  const [activeTab, setActiveTab] = useState('viewUsers');
  // const [show, setShow] = useState(false);
  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const allUsers = ['User A', 'User B', 'User C', 'User D', 'User E'];
  const [availableUsers, setAvailableUsers] = useState(['User A', 'User B', 'User C']);
  const [viewType, setViewType] = useState('Available Members');

  const [teamsList, setTeamsList] = useState<{ name: string; id: string }[]>([]);

  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedTeamName, setSelectedTeamName] = useState<string>('');

  // Dynamic filtering for Available/All Members dropdown
  const filteredAvailableUsers = viewType === 'All Members' ? allUsers : availableUsers;
  const [assignedUsers, setAssignedUsers] = useState<MemberModel[]>([]);

  const [selectedAvailable, setSelectedAvailable] = useState<string | null>(null);
  const [selectedAssigned, setSelectedAssigned] = useState<string | null>(null);

  const {
    reset,
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<RegisterValues>();

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
    getOrganizationListSummary().then(res => {
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
    let newUser: CreateUserRequest = {
      username: formValues.username,
      email: formValues.email === '' ? '' : formValues.email,
      firstName: formValues.firstname,
      lastName: formValues.lastname,
      organizations: selectedOrganizations?.map(el => el.value) ?? [],
      password: formValues.password,
      securityGroups: selectedSecurityGroups?.map(el => el.value) ?? []
    };
    createUser(newUser).then((res: CreateUserResponse | null) => {
      
      if (res) {
        toast.success('User created successfully!');
        reset();
      } else {
        toast.error('Failed to create user');
      }
    });
  };

 
  /// users list logic
  const handleSortClick = (field: string) => {
    setSortField(prev => (prev === field ? field : field));
    setDirection(prev => (sortField === field ? !prev : true));
  };

  const toggleFilter = () => {
    setIsFilterOpen(prev => !prev);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [field]: e.target.value
    }));
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const sortedUsers = await getUserList(searchTerm, filters, sortField, direction);
      setUsers(sortedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters, sortField, direction]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  /// users list logic end here

  /// teams logic
  const fetchTeams = async () => {
    setLoading(true);
    try {
      const response = await getOrganizationListSummary();
  
      const teamNames = response.content.map(org => ({
        name: org.name,
        id: org.identifier
      }));
      console.log('teams with no filter', response.content);
      console.log('Teams:', teamNames);
      setTeams(teamNames.map(team => team.name));
      setTeamsList(teamNames);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTeams(); 
  }, []);
  const filteredTeams = teams.filter(team => team.toLowerCase().includes(teamSearchTerm.toLowerCase()));

  const sortedTeams = [...filteredTeams].sort((a, b) => {
    if (teamSortField === 'name') {
      return teamSortDirection ? a.localeCompare(b) : b.localeCompare(a);
    }
    return 0;
  });
  const handleSortToggle = () => {
    setTeamSortDirection(prev => !prev);
  };

  // teams end here

  const {
    register: registerTeams,
    handleSubmit: handleSubmitTeams,
    control,
    reset: resetTeams,
    setError: setErrorTeams,
    formState: { errors: errorsTeams }
  } = useForm<TeamsRegisterValues>();

  useEffect(() => {
    getOrganizationListSummary().then(res => {
      setteamOrganization(res.content);
    });
  }, []);

  const submitTeamHandler = (formValues: TeamsRegisterValues) => {
    toast.promise(createOrganization(formValues), {
      pending: 'Loading...',
      success: {
        render({ data }: { data: OrganizationModel }) {
          resetTeams();
          return `Organization with id: ${data.identifier} created successfully.`;
        }
      },
      error: {
        render({ data: err }: { data: any }) {
          if (typeof err !== 'string') {
            const fieldValidationErrors = err as FieldValidationError[];
            return (
              'Field Validation Error: ' +
              fieldValidationErrors
                .map(errField => {
                  setErrorTeams(errField.field as any, { message: errField.messageKey });
                  return errField.field;
                })
                .toString()
            );
          }
          return err;
        }
      }
    });
  };

  const handleTeamSelection = (teamId: string) => {
    const selectedTeamObj = teamsList.find(team => team.id === teamId);

    if (selectedTeamObj) {
      setSelectedTeam(teamId);
      setSelectedTeamName(selectedTeamObj.name);
      setAssignedUsers([]);

      fetchMembers(teamId);
    }
  };
  const fetchMembers = async (organizationId: string) => {
    try {
      const members = await getOrganizationMembers(organizationId);
      setAssignedUsers(members);
      console.log('Members of the organization:', members);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  // Move member to Team

  const moveToTeam = async (userId: string) => {
    console.log('Current selectedTeamId:', selectedTeam);

    console.error('User ID or Team ID is missing');

    const user = users.find(u => u.identifier === userId);
    console.log(user, 'the user intent to be moved to team');

    if (!selectedTeam) {
      console.error('Error: selectedTeamId is missing or undefined');
      return; 
    }

    if (user) {
      const member: MemberModel = {
        identifier: user.identifier,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        role: 'default_role'
      };

      try {
        console.log('Sending request to add user to team');
        const response = await addUserToOrganization(selectedTeam, user.username);

        console.log('API Response:', response);

        if (response && response.success) {
          console.log('User moved successfully');
          setAssignedUsers(prevAssigned => [...prevAssigned, member]);
          
          fetchTeams(); 
          fetchMembers(selectedTeam); 
          toast.success('User moved to team successfully!');

          setSelectedAvailable(null);
        } else {
          toast.error('Failed to add user to team');
          console.error('Failed to add user to team');
        }
      } catch (error) {
        console.error('Error during API request:', error);
      }
    }
  };

  /// delete user from the team assigned

  const handleDeleteUser = async () => {
    const userToDelete = assignedUsers.find(u => u.identifier === selectedAssigned);

    if (userToDelete) {
      const username = userToDelete.username;
      const organizationId = selectedTeam;

      try {
        const response = await deleteUserFromOrganization(organizationId, username);

        if (response && response.success) {
          console.log('User deleted successfully');

          setAssignedUsers(prevAssigned => prevAssigned.filter(user => user.identifier !== selectedAssigned));
          
          fetchTeams(); 
          fetchMembers(organizationId); 
          toast.success('User deleted from team successfully!');
          setSelectedAssigned(null);
        } else {
          console.error('Failed to delete user');
        }
      } catch (error) {
        toast.error('Failed to delete user');
        console.error('Error during delete request:', error);
      }
    }
  };

  return (
    <div>
      
        <div>
          <h1>Manage Users & Teams</h1>
        </div>
        <section className={style.bodyClass}>
          <Row className={style.rowStyle}>
            <Col md={3} className={style.sidebarNav}>
              <Nav variant="pills" className="flex-column">
                <p className={style.title}>Management</p>
                <Nav.Item className={style.viewUsers}>
                  <Nav.Link
                    eventKey="viewUsers"
                    onClick={() => setActiveTab('viewUsers')}
                    className={style.viewItemMenu}
                  >
                    <FontAwesomeIcon icon={faUsers} className={style.viewIcon} />
                    View Users
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item className={style.userPlus}>
                  <Nav.Link
                    eventKey="createUser"
                    onClick={() => setActiveTab('createUser')}
                    className={style.userItemMenu}
                  >
                    <FontAwesomeIcon icon={faUserPlus} className={style.userIcon} />
                    Create User
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item className={style.manageTeams}>
                  <Nav.Link
                    eventKey="manageTeams"
                    onClick={() => setActiveTab('manageTeams')}
                    className={style.manageItemMenu}
                  >
                    <FontAwesomeIcon icon={faUsersCog} className={style.manageIcon} />
                    Manage Teams
                  </Nav.Link>
                </Nav.Item>
                {/* <Nav.Item className={style.settings}>
                  <Nav.Link
                    eventKey="settings"
                    onClick={() => setActiveTab('settings')}
                    className={style.navsettingItemMenu}
                  >
                    <FontAwesomeIcon icon={faCogs} className={style.settingIcon} />
                    Settings
                  </Nav.Link>
                </Nav.Item> */}
              </Nav>
            </Col>

            <Col md={9} className={style.contentArea}>
              {activeTab === 'createUser' && (
                <Container className={style.createUserContainer}>
                  <Form className={style.fullForm}>
                    <Form.Group className="mb-3">
                      <Form.Label>Username</Form.Label>
                      <Form.Control
                        placeholder="Enter username"
                        id="username-input"
                        {...register('username', {
                          required: 'Username must not be empty',
                          pattern: {
                            value: REGEX_USERNAME_VALIDATION,
                            message: 'Username contains unsupported characters.'
                          }
                        })}
                        type="username"
                      />
                      {errors.username && <Form.Label className="text-danger">{errors.username.message}</Form.Label>}
                    </Form.Group>

                    <Row>
                      <Col>
                        <Form.Group className="mb-3">
                          <Form.Label>First Name</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter first name"
                            id="first-name-input"
                            {...register('firstname', {
                              required: 'First name must not be empty.',
                              minLength: { message: 'First name must be at least 2 chars long.', value: 2 },
                              pattern: {
                                value: new RegExp('^[^\\s]+[-a-zA-Z\\s]+([-a-zA-Z]+)*$'),
                                message: "First name can't start with empty space."
                              }
                            })}
                          />
                          {errors.firstname && (
                            <Form.Label className="text-danger">{errors.firstname.message}</Form.Label>
                          )}
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group className="mb-3">
                          <Form.Label>Last Name</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter last name"
                            id="last-name-input"
                            {...register('lastname', {
                              required: 'Last name must not be empty.',
                              minLength: { message: 'Last name must be at least 2 chars long.', value: 2 },
                              pattern: {
                                value: new RegExp('^[^\\s]+[-a-zA-Z\\s]+([-a-zA-Z]+)*$'),
                                message: "Last name can't start with empty space."
                              }
                            })}
                          />
                          {errors.lastname && (
                            <Form.Label className="text-danger">{errors.lastname.message}</Form.Label>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Enter password"
                        id="password-input"
                        {...register('password', { required: 'Password must not be empty.' })}
                      />
                      {errors.password && <Form.Label className="text-danger">{errors.password.message}</Form.Label>}
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter email"
                        {...register('email', {
                          required: 'Email must not be empty',
                          pattern: {
                            value: REGEX_EMAIL_VALIDATION,
                            message: 'Invalid email format.'
                          }
                        })}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Security Groups</Form.Label>
                      <Select
                        className="custom-react-select-container"
                        classNamePrefix="custom-react-select"
                        menuPosition="fixed"
                        isMulti
                        value={selectedSecurityGroups}
                        options={groups}
                        onChange={selectHandler}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Teams</Form.Label>
                      <Select
                        className="custom-react-select-container"
                        classNamePrefix="custom-react-select"
                        menuPosition="fixed"
                        isMulti
                        value={selectedOrganizations}
                        options={organizations}
                        onChange={organizationSelectHandler}
                      />
                    </Form.Group>

                    <div className={style.buttonContainer}>
                      <Button className={style.primaryButton} onClick={handleSubmit(submitHandler)}>
                        Submit
                      </Button>
                      <Button variant="secondary" onClick={handleClose}>
                        Cancel
                      </Button>
                    </div>
                  </Form>
                </Container>
              )}
              {activeTab === 'manageTeams' && (
                <Container>
                  <Row className={style.dropDown}>
                    <Col>
                      <Form.Select value={viewType} onChange={e => setViewType(e.target.value)}>
                        <option value="Available Members">Available Members</option>
                        <option value="All Members">All Members</option>
                      </Form.Select>
                    </Col>
                    <Col>
                      <Form.Select value={selectedTeam || ''} onChange={e => handleTeamSelection(e.target.value)}>
                        <option value="">Select a Team</option>
                        {teamsList.map((team, index) => (
                          <option key={index} value={team.id}>
                            {team.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                  </Row>
                  <Accordion title="Teams Creation" open>
                    <Row className="my-4">
                      <Col md={8} className="mx-auto">
                        {' '}
                        <Form>
                          <Form.Group className="my-4">
                            <Form.Label>Teams name</Form.Label>
                            <Form.Control
                              id="organization-name-input"
                              {...registerTeams('name', {
                                required: {
                                  value: true,
                                  message: 'Teams name must not be empty.'
                                },
                                minLength: {
                                  value: 1,
                                  message: 'Teams name must be at least 1 char long.'
                                },
                                pattern: {
                                  value: new RegExp(REGEX_NAME_VALIDATION),
                                  message: "Teams name can't start with empty space or contain special characters."
                                }
                              })}
                              type="input"
                            />
                            {errorsTeams.name && (
                              <Form.Label className="text-danger">{errorsTeams.name.message}</Form.Label>
                            )}
                          </Form.Group>

                          
                          <hr />
                          <Button
                            id="save-button"
                            variant="primary"
                            className="float-end"
                            onClick={handleSubmitTeams(submitTeamHandler)}
                          >
                            Save
                          </Button>
                        </Form>
                      </Col>
                    </Row>
                  </Accordion>
                  <Row className={style.columnField}>
                    <Col md={5} className={style.userColumn}>
                      <h5 className={style.columnHeader}>{viewType}</h5>
                      <ul className={style.userList}>
                        {viewType === 'Available Members'
                          ? users
                              .filter(user => !user.organizations.length)
                              .map(user => (
                                <li
                                  key={user.identifier}
                                  className={`${style.userItem} ${
                                    selectedAvailable === user.identifier ? style.selected : ''
                                  }`}
                                  onClick={() => setSelectedAvailable(user.identifier)}
                                >
                                  <FontAwesomeIcon icon={faUser} className={style.userIcon} /> {user.firstName}{' '}
                                  {user.lastName}
                                </li>
                              ))
                          : users.map(user => (
                              <li
                                key={user.identifier}
                                className={`${style.userItem} ${
                                  selectedAvailable === user.identifier ? style.selected : ''
                                }`}
                                onClick={() => setSelectedAvailable(user.identifier)}
                              >
                                <FontAwesomeIcon icon={faUser} className={style.userIcon} /> {user.firstName}{' '}
                                {user.lastName}
                              </li>
                            ))}
                      </ul>
                    </Col>

                    <Col md={2} className={style.arrowClass}>
                      <Button
                        variant="primary"
                        className="mb-2"
                        disabled={!selectedAvailable}
                        onClick={() => {
                          if (selectedAvailable) {
                            moveToTeam(selectedAvailable);
                          } else {
                            console.log('No member selected');
                          }
                        }}
                      >
                        <FontAwesomeIcon icon={faArrowRight} />
                      </Button>
                      <br />
                      <Button variant="secondary" disabled={!selectedAssigned} onClick={handleDeleteUser}>
                        <FontAwesomeIcon icon={faArrowLeft} />
                      </Button>
                    </Col>

                    <Col md={5} className={style.userColumn}>
                      <h5 className={style.columnHeader}>{selectedTeamName}'s Members</h5>

                      {assignedUsers.length > 0 ? (
                        <ul className={style.userList}>
                          {assignedUsers.map(user => (
                            <li
                              key={user.identifier}
                              className={`${style.userItem} ${
                                selectedAssigned === user.identifier ? style.selected : ''
                              }`}
                              onClick={() => setSelectedAssigned(user.identifier)}
                            >
                              <FontAwesomeIcon icon={faUser} className={style.userIcon} />
                              {user.firstName} {user.lastName}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>No members available.</p>
                      )}
                    </Col>
                  </Row>
                </Container>
              )}
              {activeTab === 'viewUsers' && (
                <Row className={style.viewUserContainer}>
                  <Col md={6} className={style.usersSection}>
                    <div className={style.sectionHeader}>
                      <h5>Users</h5>
                      <div className={style.controls}>
                        <DebounceInput
                          minLength={2}
                          debounceTimeout={300}
                          className={style.searchInput}
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                          placeholder="Search by name..."
                        />
                        <FontAwesomeIcon
                          icon={faSort}
                          className={style.controlIcon}
                          onClick={() => handleSortClick('firstName')}
                        />
                        <FontAwesomeIcon icon={faFilter} className={style.controlIcon} onClick={toggleFilter} />
                      </div>
                    </div>
                    {isFilterOpen && (
                      <div className={style.filterPanel}>
                        <h5>Filter Options</h5>
                        <div>
                          <label>First Name:</label>
                          <DebounceInput
                            minLength={1}
                            debounceTimeout={300}
                            value={filters.firstName}
                            onChange={e => handleFilterChange(e, 'firstName')}
                          />
                        </div>
                      </div>
                    )}
                    <div>
                      {loading ? (
                        <p>Loading...</p>
                      ) : (
                        <div className={style.usersList}>
                          <ul>
                            {users.map(user => (
                              <li key={user.identifier} className={style.userEntry}>
                                <FontAwesomeIcon icon={faUser} className={style.userAvatar} />
                                {`${user.firstName} ${user.lastName}`}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </Col>

                  <Col md={6} className={style.teamsSection}>
                    <div className={style.sectionHeader}>
                      <h5>Teams</h5>
                      <div className={style.controls}>
                        <div className={style.searchContainer}>
                          <input
                            type="text"
                            placeholder="Search Teams..."
                            value={teamSearchTerm}
                            onChange={e => setTeamSearchTerm(e.target.value)}
                            className={style.searchInput}
                          />
                        </div>
                        <FontAwesomeIcon icon={faSort} className={style.controlIcon} onClick={handleSortToggle} />
                        <FontAwesomeIcon icon={faFilter} className={style.controlIcon} />
                      </div>
                    </div>

                    {loading ? (
                      <p>Loading...</p>
                    ) : (
                      <ul className={style.teamsList}>
                        {filteredTeams.length > 0 ? (
                          sortedTeams.map((team, index) => (
                            <li key={index} className={style.teamEntry}>
                              <FontAwesomeIcon icon={faUsers} className={style.teamAvatar} /> {team}
                            </li>
                          ))
                        ) : (
                          <li>No teams found</li>
                        )}
                      </ul>
                    )}
                  </Col>
                </Row>
              )}
            </Col>
          </Row>
        </section>
      
    </div>
  );
};


