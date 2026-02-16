import React from 'react';
import { Card, Form } from 'react-bootstrap';
import { useAppSelector } from '../../../store/hooks';

const roles = ['Data analyze', 'User management', 'Manager'];

const RolesSelection: React.FC = () => {
    const isDarkMode = useAppSelector((state: any) => state.darkMode.value);

    return (
        <Card
            className={`flex-fill shadow-sm border-1 ${isDarkMode ? 'border-white text-white' : ''}`}
            style={{ background: isDarkMode ? '#212529' : '', height: '100%' }}
        >
            <Card.Header className={`${isDarkMode ? 'border-bottom border-white text-white' : 'bg-light'} fw-bold`}>
                Roles
            </Card.Header>
            <Card.Body className="p-3">
                {roles.map(role => (
                    <Form.Check key={role} type="checkbox" id={`role-${role}`} label={role} className="mb-2" />
                ))}
            </Card.Body>
        </Card>
    );
};

export default RolesSelection;
