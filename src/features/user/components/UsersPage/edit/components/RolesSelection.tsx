import React, { useEffect, useState } from 'react';
import { Card, Form, Spinner } from 'react-bootstrap';
import { useAppSelector } from '../../../../../../store/hooks';
import { getAssignedRoleList, AssignedRoleModel } from '../../../../../groupConfiguration/api';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

interface RolesSelectionProps {
    selectedRoles?: string[];
    onRoleChange?: (roles: string[]) => void;
    hideHeader?: boolean;
    textColor?: string;
    variant?: 'default' | 'editUser';
    readOnly?: boolean;
}

const RolesSelection: React.FC<RolesSelectionProps> = ({
    selectedRoles = [],
    onRoleChange,
    hideHeader,
    textColor,
    variant = 'default',
    readOnly = false
}) => {
    const isDarkMode = useAppSelector((state: any) => state.darkMode.value);
    const [roles, setRoles] = useState<AssignedRoleModel[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        getAssignedRoleList()
            .then(data => {
                setRoles(data);
                setIsLoading(false);
            })
            .catch(err => {
                toast.error('Error fetching roles');
                setIsLoading(false);
            });
    }, []);

    const handleToggle = (roleId: string) => {
        if (!onRoleChange) return;
        const newRoles = selectedRoles.includes(roleId)
            ? selectedRoles.filter(id => id !== roleId)
            : [...selectedRoles, roleId];
        onRoleChange(newRoles);
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
                    Roles
                </Card.Header>
            )}
            <Card.Body className="p-3">
                {isLoading ? (
                    <div className="text-center p-3">
                        <Spinner animation="border" size="sm" variant="primary" />
                    </div>
                ) : (
                     roles.map(role => {
                        const isSelected = selectedRoles.includes(role.identifier);
                        if (readOnly && !isSelected) return null;
                        return (
                            <div key={role.identifier} className="d-flex align-items-center mb-2">
                                {readOnly ? (
                                    <FontAwesomeIcon icon={faCheck} className="text-primary me-2" />
                                ) : (
                                    <Form.Check
                                        type="checkbox"
                                        id={`role-${role.identifier}`}
                                        checked={isSelected}
                                        onChange={() => handleToggle(role.identifier)}
                                        disabled={readOnly}
                                        className="me-2"
                                    />
                                )}
                                <span style={{ color: effectiveTextColor }}>{role.name}</span>
                            </div>
                        );
                    })
                )}
            </Card.Body>
        </Card>
    );
};

export default RolesSelection;
