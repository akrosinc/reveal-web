import React from 'react';
import { Modal, ListGroup } from 'react-bootstrap';

interface Props {
    show: boolean;
    onHide: () => void;
    onSelect: (team: string) => void;
}

const teams = ['Team 1', 'Team 2', 'Team 3', 'Team 4'];

const SelectTeamModal: React.FC<Props> = ({ show, onHide, onSelect }) => {
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Select Team</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0">
                <ListGroup variant="flush">
                    {teams.map(team => (
                        <ListGroup.Item
                            key={team}
                            action
                            onClick={() => {
                                onSelect(team);
                                onHide();
                            }}
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
