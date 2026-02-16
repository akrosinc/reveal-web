import React from 'react';
import { Card, Form } from 'react-bootstrap';
import { useAppSelector } from '../../../store/hooks';

const roles = ['Data analyze', 'User management', 'Manager'];

interface RolesSelectionProps {
    selectedRoles?: string[];
    onRoleChange?: (roles: string[]) => void;
    hideHeader?: boolean;
    textColor?: string;
}

const RolesSelection: React.FC<RolesSelectionProps> = ({
    selectedRoles = [],
    onRoleChange,
    hideHeader = false,
    textColor
}) => {
    const isDarkMode = useAppSelector((state: any) => state.darkMode.value);

    const handleToggle = (role: string) => {
        if (!onRoleChange) return;
        const newRoles = selectedRoles.includes(role)
            ? selectedRoles.filter(r => r !== role)
            : [...selectedRoles, role];
        onRoleChange(newRoles);
    };

    return (
        <Card
            className={`flex-fill shadow-sm border-0 ${isDarkMode ? 'text-white' : ''}`}
            style={{ background: isDarkMode ? '#F0F2F5' : '#F0F2F5', height: '100%' }}
        >
            {!hideHeader && (
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
                        label={<span style={{ color: textColor }}>{role}</span>}
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
