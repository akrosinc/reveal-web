import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useEffect, useState } from 'react';
import { Button, Col, Row, Table } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { getPerformanceDashboard } from '../../api';
import { PerformanceDashboardModel } from '../../providers/types';

const PerformanceDashboard = () => {
  const { planId } = useParams();
  const [dashboardData, setDashboardData] = useState<PerformanceDashboardModel[]>([]);
  const navigate = useNavigate();

  const loadData = useCallback(
    (userId?: string) => {
      if (planId) getPerformanceDashboard(planId, userId).then(res => setDashboardData(res));
    },
    [planId]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const clickHandler = (userId: string) => {
    loadData(userId);
  };

  return (
    <>
      <Row className="mt-3 align-items-center">
        <Col md={3}>
          <Button id="back-button" onClick={() => navigate(-1)} className="btn btn-primary">
            <FontAwesomeIcon icon="arrow-left" className="me-2" /> Performance Reports
          </Button>
        </Col>
        <Col md={6} className="text-center">
          <h2 className="m-0">
           ({planId})
          </h2>
        </Col>
      </Row>
      {dashboardData.length ? (
        <Table hover responsive bordered>
          <thead className="border border-2">
            <tr>
              <th>User Identifier</th>
              <th>Username</th>
              {Object.keys(dashboardData[0].columnDataMap).map(el => (
                <th>{el}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dashboardData.map(el => (
              <tr onClick={() => clickHandler(el.userId)}>
                <td>{el.userId}</td>
                <td>{el.userName}</td>
                {Object.keys(el.columnDataMap).map(columns => (
                  <td>{el.columnDataMap[columns].value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p className='mt-4 lead text-center'>No data found.</p>
      )}
    </>
  );
};

export default PerformanceDashboard;
