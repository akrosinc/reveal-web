import React, { useState, useCallback, useEffect } from 'react';
import { Button, Col, Container, Form, Modal, Row, Nav, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Select, { MultiValue, SingleValue } from 'react-select';
import {
  CreateUserRequest,
  CreateUserResponse,
  createUser,
  UserModel,
  getOrganizationMembers,
  getUserList
} from '../../planSimulation/components/User/api/userAPI';
import { getOrganizationList } from './Teams/api/teamAPI';
import {
  getOrganizationListSummary,
  getSecurityGroups,
  createOrganization,
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
  show: boolean;
  onHide: () => void;
  className?: string;
}

interface TeamsRegisterValues {
  name: string;
  type: string;
  partOf: string;
  active: boolean;
}

const UserModal: React.FC<UserModalProps> = ({ show, onHide }) => {
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

  const [teamsList, setTeamsList] = useState<string[]>([]);

  const [selectedTeam, setSelectedTeam] = useState<string>('');

  // Dynamic filtering for Available/All Members dropdown
  const filteredAvailableUsers = viewType === 'All Members' ? allUsers : availableUsers;
  const [assignedUsers, setAssignedUsers] = useState<string[]>([]);

  const [selectedAvailable, setSelectedAvailable] = useState<string | null>(null);
  const [selectedAssigned, setSelectedAssigned] = useState<string | null>(null);

  // const moveToAssigned = () => {
  //   if (selectedAvailable) {
  //     setAvailableUsers(prev => prev.filter(user => user !== selectedAvailable));
  //     setTeamsAv(prev => ({
  //       ...prev,
  //       [selectedTeam]: [...prev[selectedTeam], selectedAvailable]
  //     }));
  //     setSelectedAvailable(null);
  //   }
  // };

  // const moveToAvailable = () => {
  //   if (selectedAssigned) {
  //     setAvailableUsers(prev => [...prev, selectedAssigned]);
  //     setteamsList(prev => ({
  //       ...prev,
  //       [selectedTeam]: prev[selectedTeam].filter(user => user !== selectedAssigned)
  //     }));
  //     setSelectedAssigned(null);
  //   }
  // };
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
      console.log('API Response:', res);
      if (res) {
        toast.success('User created successfully!');
        reset();
      } else {
        toast.error('Failed to create user');
      }
    });
  };

  const handleSortClick = (field: string) => {
    if (sortField === field) {
      setDirection(!direction);
    } else {
      setSortField(field);
      setDirection(true);
    }
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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const sortedUsers = await getUserList(searchTerm, filters, sortField, direction);
      console.log('Sorted users:', sortedUsers);
      setUsers(sortedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [sortField, filters, direction, searchTerm]);

  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      try {
        const response = await getOrganizationListSummary();

        const teamNames = response.content.map(org => org.name);
        console.log('teams with no filter', response.content);
        console.log('Teams:', teamNames);
        setTeams(teamNames);
        setTeamsList(teamNames);
      } catch (error) {
        console.error('Error fetching teams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);
  const filteredTeams = teams.filter(team => team.toLowerCase().includes(teamSearchTerm.toLowerCase()));
  const sortedTeams = filteredTeams.sort((a, b) => {
    if (teamSortField === 'name') {
      return teamSortDirection ? a.localeCompare(b) : b.localeCompare(a);
    }
    return 0;
  });
  const handleSortToggle = () => {
    setTeamSortDirection(!teamSortDirection);
  };
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

  const handleTeamSelection = (team: string) => {
    setSelectedTeam(team);
    setAssignedUsers([]);
  };

  const fetchMembers = async (organizationId: string) => {
    try {
      const members = await getOrganizationMembers(organizationId);
      console.log('Members of the organization:', members);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  return (
    <div>
      <Button className={style.openModalButton} onClick={handleShow}>
        Manage Teams
      </Button>

      <Modal show={showModal} onHide={handleClose} size="xl" className={style.modalFull} centered>
        <Modal.Header closeButton>
          <Modal.Title>Manage Users & Teams</Modal.Title>
        </Modal.Header>
        <Modal.Body className={style.bodyClass}>
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
                        <option>Available Members</option>
                        <option>All Members</option>
                      </Form.Select>
                    </Col>
                    <Col>
                      <Form.Select value={selectedTeam || ''} onChange={e => handleTeamSelection(e.target.value)}>
                        <option value="">Select a Team</option>
                        {teamsList.map((team, index) => (
                          <option key={index} value={team}>
                            {team}
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

                          <Form.Group className="my-4">
                            <Form.Label>Type</Form.Label>
                            <Form.Select
                              id="type-select"
                              {...registerTeams('type', { required: 'Teams type must be selected.' })}
                            >
                              <option value=""></option>
                              <option value="CG">Community group</option>
                              <option value="TEAM">Team</option>
                              <option value="OTHER">Other</option>
                            </Form.Select>
                            {errorsTeams.type && (
                              <Form.Label className="text-danger">{errorsTeams.type.message}</Form.Label>
                            )}
                          </Form.Group>

                          <Form.Group className="my-4">
                            <Form.Label>Part of</Form.Label>
                            <Controller
                              control={control}
                              name="partOf"
                              render={({ field: { onChange } }) => (
                                <Select
                                  className="custom-react-select-container"
                                  classNamePrefix="custom-react-select"
                                  id="part-of-select"
                                  menuPosition="fixed"
                                  isClearable
                                  {...registerTeams('partOf', { required: false })}
                                  value={selectedSecurityGroups}
                                  options={teamOrganization.map(el => {
                                    return {
                                      value: el.identifier,
                                      label: el.name
                                    };
                                  })}
                                  onChange={selectedOption => {
                                    setSelectedTeamSecurityGroups(selectedOption);
                                    onChange(selectedOption?.value);
                                  }}
                                />
                              )}
                            />
                          </Form.Group>

                          <Form.Group className="my-4">
                            <Form.Switch
                              id="active-switch"
                              {...registerTeams('active', { required: false })}
                              defaultChecked
                              label="Active"
                            />
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
                      <h5 className={style.columnHeader}>All Members</h5>
                      <ul className={style.userList}>
                        {users.map(user => (
                          <li
                            key={user.identifier}
                            className={`${style.userItem} ${
                              selectedAvailable === user.identifier ? style.selected : ''
                            }`}
                            onClick={() => setSelectedAvailable(user.identifier)}
                          >
                            <FontAwesomeIcon icon={faUser} className={style.userIcon} /> {user.firstName}
                          </li>
                        ))}
                      </ul>
                    </Col>

                    <Col md={2} className={style.arrowClass}>
                      <Button variant="primary" className="mb-2" disabled={!selectedAvailable}>
                        <FontAwesomeIcon icon={faArrowRight} />
                      </Button>
                      <br />
                      <Button variant="secondary" disabled={!selectedAssigned}>
                        <FontAwesomeIcon icon={faArrowLeft} />
                      </Button>
                    </Col>

                    <Col md={5} className={style.userColumn}>
                      <h5 className={style.columnHeader}>{selectedTeam} Members</h5>
                      <ul className={style.userList}>
                        {assignedUsers.map(user => (
                          <li
                            key={user}
                            className={`${style.userItem} ${selectedAssigned === user ? style.selected : ''}`}
                            onClick={() => setSelectedAssigned(user)}
                          >
                            <FontAwesomeIcon icon={faUser} className={style.userIcon} /> {user}
                          </li>
                        ))}
                      </ul>
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
                        <input
                          type="text"
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
                          <input
                            type="text"
                            value={filters.firstName}
                            onChange={e => handleFilterChange(e, 'firstName')}
                          />
                        </div>
                        <div>
                          <label>Last Name:</label>
                          <input
                            type="text"
                            value={filters.lastName}
                            onChange={e => handleFilterChange(e, 'lastName')}
                          />
                        </div>
                        <div>
                          <label>Email:</label>
                          <input type="text" value={filters.email} onChange={e => handleFilterChange(e, 'email')} />
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
                          filteredTeams
                            .filter(team => team.toLowerCase().includes(teamSearchTerm.toLowerCase()))
                            .sort((a, b) => {
                              if (sortDirection) {
                                return a.localeCompare(b);
                              } else {
                                return b.localeCompare(a);
                              }
                            })
                            .map((team, index) => (
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
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default UserModal;
