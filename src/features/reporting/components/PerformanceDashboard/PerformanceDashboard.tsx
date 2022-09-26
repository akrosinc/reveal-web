import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useEffect, useState } from 'react';
import { Button, Col, Container, OverlayTrigger, Row, Table, Tooltip } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import DetailsDialogService from '../../../../components/Dialogs/DetailsDialogService';
import { useAppSelector } from '../../../../store/hooks';
import { getPlanById } from '../../../plan/api';
import { PlanModel } from '../../../plan/providers/types';
import { getPerformanceDashboard, getPerformanceDashboardDataDetails } from '../../api';
import { PerformanceDashboardModel } from '../../providers/types';
import PerformanceDetailsModal from './PerformanceDetailsModal';

interface BreadcrumbPath {
  username: string;
  userId: string;
  parentId: string;
}

const PerformanceDashboard = () => {
  const { planId } = useParams();
  const [dashboardData, setDashboardData] = useState<PerformanceDashboardModel[]>([]);
  const navigate = useNavigate();
  const [plan, setPlan] = useState<PlanModel>();
  const [path, setPath] = useState<BreadcrumbPath[]>([]);
  const isDarkMode = useAppSelector(state => state.darkMode.value);

  const loadData = useCallback(
    (currentPath?: BreadcrumbPath) => {
      if (planId) {
        getPerformanceDashboard(planId, currentPath?.userId)
          .then(res => {
            setDashboardData(res);
            // if currentPath != undefined loading children triggred call
            // update path array for breadcrumb
            if (currentPath) {
              setPath(path => [...path, currentPath]);
            } else {
              setPath([]);
            }
          })
          .catch(err => {
            // if there is an error navigate to previouse page
            navigate(-1);
            toast.error(err);
          });
      }
    },
    [planId, navigate]
  );

  useEffect(() => {
    loadData();
    //get plan on first load
    if (planId) getPlanById(planId).then(res => setPlan(res));
  }, [loadData, planId]);

  const clickHandler = (newPath: BreadcrumbPath) => {
    //load child data on click
    loadData(newPath);
  };

  const breadCrumbClickHandler = (clickedPath: BreadcrumbPath, index: number) => {
    path.splice(index);
    setPath([...path]);
    loadData(clickedPath);
  };

  return (
    <>
      <Row className="my-3 align-items-center">
        <Col md={3}>
          <Button id="back-button" onClick={() => navigate(-1)} className="btn btn-primary mb-3 mb-md-0">
            <FontAwesomeIcon icon="arrow-left" className="me-2" /> Performance Reports
          </Button>
        </Col>
        <Col md={6} className="text-center">
          <h2 className="m-0">({plan?.name})</h2>
        </Col>
      </Row>
      <Container fluid className={(isDarkMode ? 'bg-dark' : 'bg-light') + ' my-2 p-3 rounded'}>
        <p className="p-0 m-0">
          <FontAwesomeIcon
            icon="align-left"
            className={path.length ? 'me-3 link-primary pe-none' : 'me-3 text-secondary pe-none'}
          />
          <span
            role="button"
            className={path.length ? 'me-1 link-primary' : 'me-1 text-secondary pe-none'}
            onClick={() => loadData()}
          >
            {plan?.title} /
          </span>
          {path.map((el, index) => {
            return (
              <span
                role="button"
                className={index === path.length - 1 ? 'me-1 text-secondary pe-none' : 'me-1 link-primary'}
                key={el.userId}
                onClick={() => {
                  if (index < path.length - 1) {
                    breadCrumbClickHandler(path[index], index);
                  }
                }}
              >
                {index !== 0 ? ' / ' : ''}
                {el.username}
              </span>
            );
          })}
        </p>
      </Container>
      {dashboardData.length && dashboardData[0] !== null ? (
        <Table hover responsive bordered variant={isDarkMode ? 'dark' : 'white'}>
          <thead className="border border-2">
            <tr>
              <th>Identifier</th>
              <th>{dashboardData[0].userLabel}</th>
              {Object.keys(dashboardData[0].columnDataMap).map((el, index) => (
                <th key={index}>{el}</th>
              ))}
              <th className="text-center">Details</th>
            </tr>
          </thead>
          <tbody>
            {dashboardData.map(el => (
              <tr
                key={el.userId}
                onClick={() => clickHandler({ userId: el.userId, username: el.userName, parentId: el.userParent })}
              >
                <td>{el.userId}</td>
                <td>{el.userName}</td>
                {Object.keys(el.columnDataMap).map((columns, index) =>
                  el.columnDataMap[columns].meta ? (
                    <OverlayTrigger
                      key={index}
                      placement="top"
                      overlay={<Tooltip id="meta-tooltip">{el.columnDataMap[columns].meta}</Tooltip>}
                    >
                      <td>{el.columnDataMap[columns].value}</td>
                    </OverlayTrigger>
                  ) : (
                    <td key={index}>{el.columnDataMap[columns].value}</td>
                  )
                )}
                <td>
                  <Button
                    onClick={e => {
                      //prevent row click event
                      e.stopPropagation();
                      //call details get request
                      if (planId)
                        getPerformanceDashboardDataDetails(planId, el.userId)
                          .then(res => {
                            if (res.length && res[0] !== null) {
                              DetailsDialogService(({ closeHandler }) => (
                                <PerformanceDetailsModal
                                  closeHandler={closeHandler}
                                  data={res}
                                  title={el.userName}
                                  darkMode={isDarkMode}
                                />
                              ));
                            }
                          })
                          .catch(err => toast.error(err));
                    }}
                  >
                    Daily Breakdown
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p className="mt-4 lead text-center">No data found.</p>
      )}
    </>
  );
};

export default PerformanceDashboard;
