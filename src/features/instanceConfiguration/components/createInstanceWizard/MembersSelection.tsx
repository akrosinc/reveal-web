import React, { useState } from 'react';
import { Card, Form, ListGroup, Button, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faChevronRight, faChevronLeft, faAngleDoubleRight, faAngleDoubleLeft } from '@fortawesome/free-solid-svg-icons';

interface Member {
    id: string;
    name: string;
}

const mockMembers: Member[] = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Alex B' },
    { id: '3', name: 'Jane Smith' },
    { id: '4', name: 'Michael Brown' },
    { id: '5', name: 'Sarah Wilson' }
];

interface Props {
    assignedMembers: string[];
    onAssignmentChange: (ids: string[]) => void;
}

const MembersSelection = ({ assignedMembers, onAssignmentChange }: Props) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [leftSelected, setLeftSelected] = useState<string[]>([]);
    const [rightSelected, setRightSelected] = useState<string[]>([]);

    // Filter available members (those not in assigned list)
    const availableMembers = mockMembers.filter(m => !assignedMembers.includes(m.id));
    const assignedList = mockMembers.filter(m => assignedMembers.includes(m.id));

    const filteredAvailable = availableMembers.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleMoveRight = () => {
        onAssignmentChange([...assignedMembers, ...leftSelected]);
        setLeftSelected([]);
    };

    const handleMoveLeft = () => {
        onAssignmentChange(assignedMembers.filter(id => !rightSelected.includes(id)));
        setRightSelected([]);
    };

    const handleMoveAllRight = () => {
        onAssignmentChange([...assignedMembers, ...filteredAvailable.map(m => m.id)]);
        setLeftSelected([]);
    };

    const handleMoveAllLeft = () => {
        onAssignmentChange([]);
        setRightSelected([]);
    };

    const toggleSelection = (id: string, listType: 'left' | 'right') => {
        if (listType === 'left') {
            setLeftSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
        } else {
            setRightSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
        }
    };

    return (
        <div className="d-flex align-items-center gap-3">
            {/* Available Members */}
            <Card className="flex-grow-1" style={{ height: '400px' }}>
                <Card.Header className="bg-light fw-bold">All</Card.Header>
                <Card.Body className="d-flex flex-column">
                    <InputGroup className="mb-3">
                        <Form.Control
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        {/* <InputGroup.Text><FontAwesomeIcon icon={faSearch} /></InputGroup.Text> */}
                    </InputGroup>
                    <div className="overflow-auto flex-grow-1 border rounded p-2">
                        {filteredAvailable.map(member => (
                            <Form.Check
                                key={member.id}
                                type="checkbox"
                                id={`left-${member.id}`}
                                label={member.name}
                                checked={leftSelected.includes(member.id)}
                                onChange={() => toggleSelection(member.id, 'left')}
                                className="mb-2"
                            />
                        ))}
                    </div>
                </Card.Body>
            </Card>

            {/* Transfer Buttons */}
            <div className="d-flex flex-column gap-2">
                <Button variant="primary" size="sm" onClick={handleMoveRight} disabled={leftSelected.length === 0}>
                    <FontAwesomeIcon icon={faChevronRight} />
                </Button>
                <Button variant="primary" size="sm" onClick={handleMoveAllRight} disabled={filteredAvailable.length === 0}>
                    <FontAwesomeIcon icon={faAngleDoubleRight} />
                </Button>
                <Button variant="primary" size="sm" onClick={handleMoveLeft} disabled={rightSelected.length === 0}>
                    <FontAwesomeIcon icon={faChevronLeft} />
                </Button>
                <Button variant="primary" size="sm" onClick={handleMoveAllLeft} disabled={assignedList.length === 0}>
                    <FontAwesomeIcon icon={faAngleDoubleLeft} />
                </Button>
            </div>

            {/* Assigned Members */}
            <Card className="flex-grow-1" style={{ height: '400px' }}>
                <Card.Header className="bg-light fw-bold">Assigned</Card.Header>
                <Card.Body className="d-flex flex-column">
                    <div className="overflow-auto flex-grow-1 border rounded p-2 mt-3">
                        {assignedList.map(member => (
                            <Form.Check
                                key={member.id}
                                type="checkbox"
                                id={`right-${member.id}`}
                                label={member.name}
                                checked={rightSelected.includes(member.id)}
                                onChange={() => toggleSelection(member.id, 'right')}
                                className="mb-2"
                            />
                        ))}
                        {assignedList.length === 0 && <span className="text-muted text-center d-block mt-3">No members assigned</span>}
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default MembersSelection;
