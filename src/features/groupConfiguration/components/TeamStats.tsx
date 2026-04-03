import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Spinner } from 'react-bootstrap';
import { useAppSelector } from '../../../store/hooks';
import { getGroupStats, GroupStatsResponse } from '../api';

const TeamStats: React.FC = () => {
    const isDarkMode = useAppSelector((state: any) => state.darkMode.value);
    const [statsData, setStatsData] = useState<GroupStatsResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getGroupStats()
            .then(res => setStatsData(res))
            .catch(err => console.error('Failed to load group stats:', err))
            .finally(() => setLoading(false));
    }, []);

    const stats = [
        { label: 'Target Areas', value: statsData?.targetAreas?.toLocaleString() || '0' },
        { label: 'Total structure', value: statsData?.totalStructures?.toLocaleString() || '0' },
        { label: 'Total population', value: statsData?.totalPopulation?.toLocaleString() || '0' },
        { label: 'Completion', value: `${(statsData?.completionPercentage || 0).toFixed(0)}%` }
    ];

    return (
        <Card
            className={`flex-fill shadow-sm ${isDarkMode ? 'border-white text-white' : ''}`}
            style={{ background: isDarkMode ? '#212529' : '', height: '100%' }}
        >
            <Card.Header className={`${isDarkMode ? 'border-bottom border-white text-white' : 'bg-light'} fw-bold`}>
                Assigned
            </Card.Header>
            <Card.Body className="p-3 d-flex flex-column justify-content-center">
                {loading ? (
                    <div className="text-center py-4">
                        <Spinner animation="border" variant="primary" size="sm" />
                        <p className="mt-2 text-muted small">Loading stats...</p>
                    </div>
                ) : (
                    stats.map((stat, index) => (
                        <Row key={index} className="mb-2">
                            <Col className="small">{stat.label}</Col>
                            <Col className="text-end fw-bold">{stat.value}</Col>
                        </Row>
                    ))
                )}
            </Card.Body>
        </Card>
    );
};

export default TeamStats;
