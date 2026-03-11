import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { useAppSelector } from '../../../store/hooks';

const TeamStats: React.FC = () => {
    const isDarkMode = useAppSelector((state: any) => state.darkMode.value);

    const stats = [
        { label: 'Target Areas', value: '92' },
        { label: 'Total structure', value: '1,231' },
        { label: 'Total population', value: '5,429' },
        { label: 'Completion', value: '70%' }
    ];

    return (
        <Card
            className={`flex-fill shadow-sm ${isDarkMode ? 'border-white text-white' : ''}`}
            style={{ background: isDarkMode ? '#212529' : '', height: '100%' }}
        >
            <Card.Header className={`${isDarkMode ? 'border-bottom border-white text-white' : 'bg-light'} fw-bold`}>
                Assigned
            </Card.Header>
            <Card.Body className="p-3">
                {stats.map((stat, index) => (
                    <Row key={index} className="mb-2">
                        <Col>{stat.label}</Col>
                        <Col className="text-end fw-bold">{stat.value}</Col>
                    </Row>
                ))}
            </Card.Body>
        </Card>
    );
};

export default TeamStats;
