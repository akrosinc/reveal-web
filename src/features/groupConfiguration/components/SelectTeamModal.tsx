import React from 'react';
import { Modal, ListGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

interface Props {
    show: boolean;
    onHide: () => void;
    onSelect: (team: string) => void;
}

const teams = ['Team 1', 'Team 2', 'Team 3', 'Team 4'];

const SelectTeamModal: React.FC<Props> = ({ show, onHide, onSelect }) => {
    return (
        <Modal show={show} onHide={onHide} centered contentClassName="border-0 shadow-sm">
            <Modal.Header className="border-0 pb-0 d-flex justify-content-between align-items-center">
                <Modal.Title style={{ fontSize: '1.2rem', fontWeight: 500 }} className="text-dark ps-2 pt-2">
                    Select Team
                </Modal.Title>
                <div className="pe-2 pt-2 cursor-pointer" onClick={onHide} style={{ fontSize: '1.2rem', color: '#999' }}>
                    <FontAwesomeIcon icon={faTimes} />
                </div>
            </Modal.Header>
            <Modal.Body className="p-0 mt-3 pb-3">
                <ListGroup variant="flush">
                    {teams.map((team, index) => (
                        <ListGroup.Item
                            key={team}
                            action
                            onClick={() => {
                                onSelect(team);
                                onHide();
                            }}
                            className={`border-0 py-3 px-4 ${index === 0 ? 'bg-light' : ''}`}
                            style={{ fontSize: '0.95rem' }}
                        >
                            {team}
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </Modal.Body>
        </Modal>
    );
};

export default SelectTeamModal;
