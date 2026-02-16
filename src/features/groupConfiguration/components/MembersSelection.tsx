import React, { useState } from 'react';
import { Card, Form, Button, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChevronRight,
    faChevronLeft,
    faAngleDoubleRight,
    faAngleDoubleLeft,
    faChevronDown,
    faChevronUp,
    faAngleDoubleDown,
    faAngleDoubleUp,
    faPencilAlt
} from '@fortawesome/free-solid-svg-icons';
import { useAppSelector } from '../../../store/hooks';

interface Member {
    id: string;
    name: string;
}

const mockMembers: Member[] = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Alex B' },
    { id: '3', name: 'Jane Smith' },
    { id: '4', name: 'Michael Brown' }
];

interface MembersSelectionProps {
    assignedMembers: string[];
    onAssignmentChange: (ids: string[]) => void;
}

const MembersSelection: React.FC<MembersSelectionProps> = ({ assignedMembers, onAssignmentChange }) => {
    const isDarkMode = useAppSelector((state: any) => state.darkMode.value);
    const [searchTerm, setSearchTerm] = useState('');
    const [leftSelected, setLeftSelected] = useState<string[]>([]);
    const [rightSelected, setRightSelected] = useState<string[]>([]);

    const availableMembers = mockMembers.filter(m => !assignedMembers.includes(m.id));
    const assignedList = mockMembers.filter(m => assignedMembers.includes(m.id));
    const filteredAvailable = availableMembers.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleMoveRight = () => {
        onAssignmentChange([...assignedMembers, ...leftSelected]);
        setLeftSelected([]);
    };

    const handleMoveLeft = () => {
        onAssignmentChange(assignedMembers.filter(id => !rightSelected.includes(id)));
        setRightSelected([]);
    };

    const toggleSelection = (id: string, listType: 'left' | 'right') => {
        if (listType === 'left') {
            setLeftSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
        } else {
            setRightSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
        }
    };

    return (
        <div className="mt-4">
            <h5 className="mb-3">Members</h5>
            <div className="d-flex flex-column flex-md-row align-items-center gap-3">
                {/* Available */}
                <Card
                    className={`flex-grow-1 w-100 ${isDarkMode ? 'border-white text-white' : ''}`}
                    style={{ background: isDarkMode ? '#212529' : '', height: '350px' }}
                >
                    <Card.Header className={`${isDarkMode ? 'border-bottom border-white text-white' : 'bg-light'} fw-bold`}>
                        All
                    </Card.Header>
                    <Card.Body className="d-flex flex-column p-3">
                        <Form.Control
                            placeholder="Search..."
                            className="mb-3"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        <div className="overflow-auto flex-grow-1">
                            {filteredAvailable.map(member => (
                                <div key={member.id} className="d-flex justify-content-between align-items-center mb-2">
                                    <Form.Check
                                        type="checkbox"
                                        id={`member-left-${member.id}`}
                                        label={member.name}
                                        checked={leftSelected.includes(member.id)}
                                        onChange={() => toggleSelection(member.id, 'left')}
                                    />
                                    <FontAwesomeIcon icon={faPencilAlt} size="xs" className="text-secondary" />
                                </div>
                            ))}
                        </div>
                    </Card.Body>
                </Card>

                {/* Transfer Buttons */}
                <div className="d-flex flex-row flex-md-column gap-2">
                    <Button variant="primary" size="sm" onClick={handleMoveRight} disabled={leftSelected.length === 0}>
                        <FontAwesomeIcon icon={faChevronRight} className="d-none d-md-inline" />
                        <FontAwesomeIcon icon={faChevronDown} className="d-inline d-md-none" />
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onAssignmentChange([...assignedMembers, ...filteredAvailable.map(m => m.id)])}
                    >
                        <FontAwesomeIcon icon={faAngleDoubleRight} className="d-none d-md-inline" />
                        <FontAwesomeIcon icon={faAngleDoubleDown} className="d-inline d-md-none" />
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleMoveLeft} disabled={rightSelected.length === 0}>
                        <FontAwesomeIcon icon={faChevronLeft} className="d-none d-md-inline" />
                        <FontAwesomeIcon icon={faChevronUp} className="d-inline d-md-none" />
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => onAssignmentChange([])}>
                        <FontAwesomeIcon icon={faAngleDoubleLeft} className="d-none d-md-inline" />
                        <FontAwesomeIcon icon={faAngleDoubleUp} className="d-inline d-md-none" />
                    </Button>
                </div>

                {/* Assigned */}
                <Card
                    className={`flex-grow-1 w-100 ${isDarkMode ? 'border-white text-white' : ''}`}
                    style={{ background: isDarkMode ? '#212529' : '', height: '350px' }}
                >
                    <Card.Header className={`${isDarkMode ? 'border-bottom border-white text-white' : 'bg-light'} fw-bold`}>
                        Assigned
                    </Card.Header>
                    <Card.Body className="d-flex flex-column p-3">
                        <div className="overflow-auto flex-grow-1">
                            {assignedList.map(member => (
                                <div key={member.id} className="d-flex justify-content-between align-items-center mb-2">
                                    <Form.Check
                                        type="checkbox"
                                        id={`member-right-${member.id}`}
                                        label={member.name}
                                        checked={rightSelected.includes(member.id)}
                                        onChange={() => toggleSelection(member.id, 'right')}
                                    />
                                    <FontAwesomeIcon icon={faPencilAlt} size="xs" className="text-secondary" />
                                </div>
                            ))}
                            {assignedList.length === 0 && (
                                <span className="text-muted text-center d-block mt-3">No members assigned</span>
                            )}
                        </div>
                    </Card.Body>
                </Card>
            </div>
        </div>
    );
};

export default MembersSelection;
