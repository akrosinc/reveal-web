import React, { useEffect, useState } from 'react';
import { Card, Form, Spinner } from 'react-bootstrap';
import { useAppSelector } from '../../../store/hooks';
import { getAssignedRoleList, AssignedRoleModel } from '../api';
import { toast } from 'react-toastify';

interface RolesSelectionProps {
    selectedRoles?: string[];
    onRoleChange?: (roles: string[]) => void;
    hideHeader?: boolean;
    textColor?: string;
    variant?: 'default' | 'editUser';
}

const RolesSelection: React.FC<RolesSelectionProps> = ({
    selectedRoles = [],
    onRoleChange,
    hideHeader,
    textColor,
    variant = 'default'
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
                    roles.map(role => (
                        <Form.Check
                            key={role.identifier}
                            type="checkbox"
                            id={`role-${role.identifier}`}
                            label={<span style={{ color: effectiveTextColor }}>{role.name}</span>}
                            className="mb-2"
                            checked={selectedRoles.includes(role.identifier)}
                            onChange={() => handleToggle(role.identifier)}
                        />
                    ))
                )}
            </Card.Body>
        </Card>
    );
};

export default RolesSelection;
