import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Form, Button, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DebounceInput } from 'react-debounce-input';
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
import { getUserList, getUserList1 } from '../../planSimulation/components/User/api/userAPI';
// import { AssignedUserModel } from '../api';
// import { getAssignedUserList } from '../api';

interface Member {
    id: string;
    name: string;
}

interface MembersSelectionProps {
    assignedMembers: string[];
    onAssignmentChange: (ids: string[]) => void;
    memberNames: Record<string, string>;
    onMemberNamesChange: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    disabled?: boolean;
}

const MembersSelection: React.FC<MembersSelectionProps> = React.memo(({ assignedMembers, onAssignmentChange, memberNames, onMemberNamesChange, disabled = false }) => {
    const isDarkMode = useAppSelector((state: any) => state.darkMode.value);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<string[]>([]);
    const [leftSelected, setLeftSelected] = useState<string[]>([]);
    const [rightSelected, setRightSelected] = useState<string[]>([]);

    useEffect(() => {
        let isCurrent = true;
        getUserList1(searchTerm.trim())
            .then(fetchedUsers => {
                if (!isCurrent) return;
                const ids: string[] = [];
                const names: Record<string, string> = {};
                fetchedUsers?.forEach(elem => {
                    if (elem?.identifier && !names[elem.identifier]) {
                        ids.push(elem.identifier);
                        names[elem.identifier] = ((elem.firstName || '') + ' ' + (elem.lastName || '')).trim();
                    }
                });
                setSearchResults(ids);
                onMemberNamesChange(prev => ({ ...prev, ...names }));
            })
            .catch(err => console.log(err));
        return () => {
            isCurrent = false;
        };
    }, [searchTerm, onMemberNamesChange]);

    // Optimized lookups using Set
    const assignedSet = useMemo(() => new Set(assignedMembers), [assignedMembers]);

    const assignedList = useMemo<Member[]>(() =>
        assignedMembers.filter(id => memberNames[id] !== undefined).map(id => ({ id, name: memberNames[id] })),
        [assignedMembers, memberNames]);

    const filteredAvailable = useMemo<Member[]>(() =>
        searchResults.filter(id => !assignedSet.has(id)).map(id => ({ id, name: memberNames[id] })),
        [searchResults, assignedSet, memberNames]);

    const handleMoveRight = useCallback(() => {
        onAssignmentChange([...assignedMembers, ...leftSelected]);
        setLeftSelected([]);
    }, [assignedMembers, leftSelected, onAssignmentChange]);

    const handleMoveLeft = useCallback(() => {
        const selectedSet = new Set(rightSelected);
        onAssignmentChange(assignedMembers.filter(id => !selectedSet.has(id)));
        setRightSelected([]);
    }, [assignedMembers, rightSelected, onAssignmentChange]);

    const toggleSelection = useCallback((id: string, listType: 'left' | 'right') => {
        if (listType === 'left') {
            setLeftSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
        } else {
            setRightSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
        }
    }, [setLeftSelected, setRightSelected]);

    return (
        <div className="mt-4">
            <h5 className="mb-3 text-secondary fw-bold">Members</h5>
            <div className="d-flex flex-column flex-lg-row align-items-stretch gap-3">
                {/* Available */}
                <Card
                    className={`flex-grow-1 shadow-sm ${isDarkMode ? 'text-white border-white' : ''}`}
                    style={{ background: isDarkMode ? '#212529' : '', minHeight: '300px', minWidth: 0 }}
                >
                    <Card.Header className={`${isDarkMode ? 'border-bottom border-white text-white' : 'bg-light'} fw-bold`}>
                        All
                    </Card.Header>
                    <Card.Body className="d-flex flex-column p-0">
                        <div className="p-3 pb-0">
                            <InputGroup className="mb-3">
                                <DebounceInput
                                    className="form-control"
                                    placeholder="Search..."
                                    debounceTimeout={500}
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                                {/* <InputGroup.Text><FontAwesomeIcon icon={faSearch} /></InputGroup.Text> */}
                            </InputGroup>
                            {/* <Form.Control
                                placeholder="Search..."
                                className="mb-3 border-0 bg-light"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            /> */}
                        </div>
                        <div className="overflow-auto flex-grow-1 px-3 pb-3" style={{ maxHeight: '300px' }}>
                            {filteredAvailable.map(member => (
                                <div key={member.id} className="d-flex justify-content-between align-items-center py-2 w-100 overflow-hidden">
                                    <Form.Check
                                        type="checkbox"
                                        id={`member-left-${member.id}`}
                                        label={<span className="text-break">{member.name}</span>}
                                        checked={leftSelected.includes(member.id)}
                                        onChange={() => toggleSelection(member.id, 'left')}
                                        className="mb-0 flex-grow-1"
                                    />
                                    {/* <FontAwesomeIcon icon={faPencilAlt} size="xs" className="text-secondary opacity-50 cursor-pointer" /> */}
                                </div>
                            ))}
                        </div>
                    </Card.Body>
                </Card>

                {/* Transfer Buttons */}
                {!disabled && <div className="d-flex flex-row flex-lg-column align-items-center justify-content-center gap-2 my-2 my-lg-0">
                    <Button variant="primary" className="btn-sm px-3" onClick={handleMoveRight} disabled={leftSelected.length === 0}>
                        <FontAwesomeIcon icon={faChevronRight} className="d-none d-lg-inline" />
                        <FontAwesomeIcon icon={faChevronDown} className="d-inline d-lg-none" />
                    </Button>
                    <Button
                        variant="primary"
                        className="btn-sm px-3"
                        onClick={() => onAssignmentChange([...assignedMembers, ...filteredAvailable.map(m => m.id)])}
                    >
                        <FontAwesomeIcon icon={faAngleDoubleRight} className="d-none d-lg-inline" />
                        <FontAwesomeIcon icon={faAngleDoubleDown} className="d-inline d-lg-none" />
                    </Button>
                    <Button variant="primary" className="btn-sm px-3" onClick={handleMoveLeft} disabled={rightSelected.length === 0}>
                        <FontAwesomeIcon icon={faChevronLeft} className="d-none d-lg-inline" />
                        <FontAwesomeIcon icon={faChevronUp} className="d-inline d-lg-none" />
                    </Button>
                    <Button variant="primary" className="btn-sm px-3" onClick={() => onAssignmentChange([])}>
                        <FontAwesomeIcon icon={faAngleDoubleLeft} className="d-none d-lg-inline" />
                        <FontAwesomeIcon icon={faAngleDoubleUp} className="d-inline d-lg-none" />
                    </Button>
                </div>}

                {/* Assigned */}
                <Card
                    className={`flex-grow-1 shadow-sm ${isDarkMode ? 'text-white border-white' : ''}`}
                    style={{ background: isDarkMode ? '#212529' : '', minHeight: '300px', minWidth: 0 }}
                >
                    <Card.Header className={`${isDarkMode ? 'border-bottom border-white text-white' : 'bg-light'} fw-bold`}>
                        Assigned
                    </Card.Header>
                    <Card.Body className="d-flex flex-column p-0">
                        <div className="overflow-auto flex-grow-1 p-3" style={{ maxHeight: '350px' }}>
                            {assignedList.map(member => (
                                <div key={member.id} className="d-flex justify-content-between align-items-center py-2 w-100 overflow-hidden">
                                    <Form.Check
                                        type="checkbox"
                                        id={`member-right-${member.id}`}
                                        label={<span className="text-break">{member.name}</span>}
                                        checked={rightSelected.includes(member.id)}
                                        onChange={() => toggleSelection(member.id, 'right')}
                                        className="mb-0 flex-grow-1"
                                    />
                                    {/* <FontAwesomeIcon icon={faPencilAlt} size="xs" className="text-secondary opacity-50 cursor-pointer" /> */}
                                </div>
                            ))}
                            {assignedList.length === 0 && (
                                <div className="text-center py-5">
                                    <span className="text-muted small">No members assigned</span>
                                </div>
                            )}
                        </div>
                    </Card.Body>
                </Card>
            </div>
        </div>
    );
});

export default MembersSelection;
