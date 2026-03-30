import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

interface Props {
    show: boolean;
    onHide: () => void;
    teamName: string;
}

const ViewTeamModal: React.FC<Props> = ({ show, onHide, teamName }) => {
    return (
        <Modal show={show} onHide={onHide} centered contentClassName="border-0 shadow-sm">
            <Modal.Header className="border-0 pb-0 d-flex justify-content-between align-items-center">
                <Modal.Title style={{ fontSize: '1.2rem', fontWeight: 500 }} className="text-dark ps-2 pt-2">
                    View Team
                </Modal.Title>
                <div className="pe-2 pt-2 cursor-pointer" onClick={onHide} style={{ fontSize: '1.2rem', color: '#999' }}>
                    <FontAwesomeIcon icon={faTimes} />
                </div>
            </Modal.Header>
            <Modal.Body className="mt-3 pb-3 px-4">
                <div className="p-3 bg-light rounded text-center">
                   <h5 className="mb-0 text-primary">{teamName || 'Not Assigned'}</h5>
                </div>
            </Modal.Body>
            <Modal.Footer className="border-0">
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ViewTeamModal;
