import React, { useEffect, useState } from 'react';
import { Card, Form, Spinner } from 'react-bootstrap';
import { useAppSelector } from '../../../../../../store/hooks';
import { getGroupList, GroupModel } from '../../../../../groupConfiguration/api';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

interface GroupsSelectionProps {
    selectedGroups?: string[];
    onGroupChange?: (groups: string[]) => void;
    hideHeader?: boolean;
    textColor?: string;
    variant?: 'default' | 'editUser';
    readOnly?: boolean;
}

const GroupsSelection: React.FC<GroupsSelectionProps> = ({
    selectedGroups = [],
    onGroupChange,
    hideHeader,
    textColor,
    variant = 'default',
    readOnly = false
}) => {
    const isDarkMode = useAppSelector((state: any) => state.darkMode.value);
    const [groups, setGroups] = useState<GroupModel[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        // Fetching first 100 groups as we don't have a non-paged list API for groups here
        getGroupList(100, 0)
            .then(data => {
                setGroups(data.content);
                setIsLoading(false);
            })
            .catch(err => {
                toast.error('Error fetching groups');
                setIsLoading(false);
            });
    }, []);

    const handleToggle = (group: GroupModel) => {
        if (!onGroupChange) return;
        const isSelected = selectedGroups.includes(group.identifier) || selectedGroups.includes(group.name);
        const newGroups = isSelected
            ? selectedGroups.filter(id => id !== group.identifier && id !== group.name)
            : [...selectedGroups, group.identifier];
        onGroupChange(newGroups);
    };

    const isEditUser = variant === 'editUser';
    const showHeader = hideHeader !== undefined ? !hideHeader : !isEditUser;
    const effectiveTextColor = textColor || (isEditUser ? 'black' : (isDarkMode ? 'white' : 'black'));

    return (
        <Card
            className={`flex-fill shadow-sm ${isEditUser ? 'border-0' : (isDarkMode ? 'text-white border-white' : '')}`}
            style={{
                background: isEditUser ? '#F0F2F5' : (isDarkMode ? '#212529' : ''),
                height: isEditUser ? '100%' : 'auto',
                minHeight: isEditUser ? '0' : '300px'
            }}
        >
            {showHeader && (
                <Card.Header className={`${isDarkMode ? 'border-bottom border-white text-white' : 'bg-light'} fw-bold`}>
                    Groups
                </Card.Header>
            )}
            <Card.Body className="p-3">
                {isLoading ? (
                    <div className="text-center p-3">
                        <Spinner animation="border" size="sm" variant="primary" />
                    </div>
                ) : (
                     groups.map(group => {
                        const isSelected = selectedGroups.includes(group.identifier) || selectedGroups.includes(group.name);
                        if (readOnly && !isSelected) return null;
                        return (
                            <div key={group.identifier} className="d-flex align-items-center mb-2">
                                {readOnly ? (
                                    <FontAwesomeIcon icon={faCheck} className="text-primary me-2" />
                                ) : (
                                    <Form.Check
                                        type="checkbox"
                                        id={`group-${group.identifier}`}
                                        checked={isSelected}
                                        onChange={() => handleToggle(group)}
                                        disabled={readOnly}
                                        className="me-2"
                                    />
                                )}
                                <span style={{ color: effectiveTextColor }}>{group.name}</span>
                            </div>
                        );
                    })
                )}
            </Card.Body>
        </Card>
    );
};

export default GroupsSelection;
