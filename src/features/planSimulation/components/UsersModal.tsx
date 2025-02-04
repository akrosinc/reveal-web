import React, { useState } from 'react';
import { Button, Col, Container, Form, Modal, Row, Nav, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserPlus,
  faUsers,
  faUser,
  faSort,
  faFilter,
  faCogs,
  faUsersCog,
  faArrowRight,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import style from './Users.module.css';

interface UserModalProps {
  show: boolean;
  onHide: () => void;
  className?: string;
}

const UserModal: React.FC<UserModalProps> = ({ show, onHide }) => {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('viewUsers');

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const allUsers = ['User A', 'User B', 'User C', 'User D', 'User E'];
  const [availableUsers, setAvailableUsers] = useState(['User A', 'User B', 'User C']);
  const [viewType, setViewType] = useState('Available Members');

  const [teams, setTeams] = useState<Record<string, string[]>>({
    'Team 1': ['Alice', 'Bob'],
    'Team 2': ['Charlie', 'David'],
    'Team 3': ['Eve', 'Frank']
  });

  const [selectedTeam, setSelectedTeam] = useState<keyof typeof teams>('Team 1');

  // Dynamic filtering for Available/All Members dropdown
  const filteredAvailableUsers = viewType === 'All Members' ? allUsers : availableUsers;
  const assignedUsers = teams[selectedTeam] || [];

  const [selectedAvailable, setSelectedAvailable] = useState<string | null>(null);
  const [selectedAssigned, setSelectedAssigned] = useState<string | null>(null);

  const moveToAssigned = () => {
    if (selectedAvailable) {
      setAvailableUsers(prev => prev.filter(user => user !== selectedAvailable));
      setTeams(prev => ({
        ...prev,
        [selectedTeam]: [...prev[selectedTeam], selectedAvailable]
      }));
      setSelectedAvailable(null);
    }
  };

  const moveToAvailable = () => {
    if (selectedAssigned) {
      setAvailableUsers(prev => [...prev, selectedAssigned]);
      setTeams(prev => ({
        ...prev,
        [selectedTeam]: prev[selectedTeam].filter(user => user !== selectedAssigned)
      }));
      setSelectedAssigned(null);
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
                  <div className={style.avatarContainer}>
                    <div className={style.avatarPlaceholder}></div>
                  </div>
                  <Form className={style.fullForm}>
                    <Form.Group controlId="formName" className="mb-3">
                      <Form.Label>Name</Form.Label>
                      <Form.Control type="text" placeholder="Enter name" />
                    </Form.Group>
                    <Form.Group controlId="formSurname" className="mb-3">
                      <Form.Label>Surname</Form.Label>
                      <Form.Control type="text" placeholder="Enter surname" />
                    </Form.Group>
                    <Form.Group controlId="formPhone" className="mb-3">
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control type="text" placeholder="Enter phone number" />
                    </Form.Group>
                    <Form.Group controlId="formEmail" className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control type="email" placeholder="Enter email" />
                    </Form.Group>

                    <div className={style.buttonContainer}>
                      <Button className={style.primaryButton}>Save and Assign to Team</Button>
                      <Button className={style.primaryButton}>Save and Exit</Button>
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
                    <Col className="text-end">
                      <Form.Select value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)}>
                        {Object.keys(teams).map(team => (
                          <option key={team} value={team}>
                            {team}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                  </Row>

                  <Row className={style.columnField}>
                    <Col md={5} className={style.userColumn}>
                      <h5 className={style.columnHeader}>{viewType}</h5>
                      <ul className={style.userList}>
                        {filteredAvailableUsers.map(user => (
                          <li
                            key={user}
                            className={`${style.userItem} ${selectedAvailable === user ? style.selected : ''}`}
                            onClick={() => setSelectedAvailable(user)}
                          >
                            <FontAwesomeIcon icon={faUser} className={style.userIcon} /> {user}
                          </li>
                        ))}
                      </ul>
                    </Col>

                    <Col md={2} className={style.arrowClass}>
                      <Button variant="primary" className="mb-2" onClick={moveToAssigned} disabled={!selectedAvailable}>
                        <FontAwesomeIcon icon={faArrowRight} />
                      </Button>
                      <br />
                      <Button variant="secondary" onClick={moveToAvailable} disabled={!selectedAssigned}>
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
                        <FontAwesomeIcon icon={faSort} className={style.controlIcon} />
                        <FontAwesomeIcon icon={faFilter} className={style.controlIcon} />
                      </div>
                    </div>
                    <ul className={style.usersList}>
                      {['User1', 'User2'].map(user => (
                        <li key={user} className={style.userEntry}>
                          <FontAwesomeIcon icon={faUser} className={style.userAvatar} /> {user}
                        </li>
                      ))}
                    </ul>
                  </Col>

                  <Col md={6} className={style.teamsSection}>
                    <div className={style.sectionHeader}>
                      <h5>Teams</h5>
                      <div className={style.controls}>
                        <FontAwesomeIcon icon={faSort} className={style.controlIcon} />
                        <FontAwesomeIcon icon={faFilter} className={style.controlIcon} />
                      </div>
                    </div>
                    <ul className={style.teamsList}>
                      {['Team A', 'Team B'].map(team => (
                        <li key={team} className={style.teamEntry}>
                          <FontAwesomeIcon icon={faUsers} className={style.teamAvatar} /> {team}
                        </li>
                      ))}
                    </ul>
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
