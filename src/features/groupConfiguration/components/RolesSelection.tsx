import React from 'react';
import { Card, Form } from 'react-bootstrap';
import { useAppSelector } from '../../../store/hooks';

const roles = ['Data analyze', 'User management', 'Manager'];

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

    const handleToggle = (role: string) => {
        if (!onRoleChange) return;
        const newRoles = selectedRoles.includes(role)
            ? selectedRoles.filter(r => r !== role)
            : [...selectedRoles, role];
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
                    Permission
                </Card.Header>
            )}
            <Card.Body className="p-3">
                {roles.map(role => (
                    <Form.Check
                        key={role}
                        type="checkbox"
                        id={`role-${role}`}
                        label={<span style={{ color: effectiveTextColor }}>{role}</span>}
                        className="mb-2"
                        checked={selectedRoles.includes(role)}
                        onChange={() => handleToggle(role)}
                    />
                ))}
            </Card.Body>
        </Card>
    );
};

export default RolesSelection;
