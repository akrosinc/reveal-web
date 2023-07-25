import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useMemo, useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import ResourcePlanningTable from '../../../../components/Table/ResourcePlanningTable';
import { RootState } from '../../../../store/store';
import { getResourceDashboard, submitDashboard } from '../../api';
import { ResourceDashboardRequest } from '../../providers/types';
import { toast } from 'react-toastify';

const DashboardTab = () => {
  const dashboardData = useSelector((state: RootState) => state.resourceConfig.dashboardData);
  const [columns, setColumns] = useState<string[]>([]);
  const [tableData, setTableData] = useState<any>();
  const [path, setPath] = useState<string[]>([]);
  const [currentLevel, setCurrentLevel] = useState<string | undefined>('');

  const tableColumns = useMemo(() => {
    return columns.map(el => {
      return {
        name: el,
        accessor: el,
        key: el === 'name' ? undefined : 'value'
      };
    });
  }, [columns]);

  useEffect(() => {
    if (dashboardData && dashboardData.response.length) {
      setPath(dashboardData.path);
      setCurrentLevel(dashboardData.request?.lowestGeography);
      const cols = ['name', ...Object.keys(dashboardData.response[0].columnDataMap)];
      setColumns(cols);
      setTableData(
        dashboardData.response.map(el => {
          return {
            ...el.columnDataMap,
            name: el.name,
            id: el.identifier
          };
        })
      );
    }
  }, [dashboardData]);

  const breadCrumbClickHandler = (path: string) => {
    if (dashboardData && dashboardData.request) {
      setCurrentLevel(path);
      const newLevelRequest = {
        ...dashboardData.request,
        lowestGeography: path
      };
      getResourceDashboard(newLevelRequest).then(res =>
        setTableData(
          res.map(el => {
            return {
              ...el.columnDataMap,
              name: el.name,
              id: el.identifier
            };
          })
        )
      );
    }
  };
  const submitDashboardData = () => {
    if (dashboardData && dashboardData.request) {
      let newRequest: ResourceDashboardRequest = {
        name: dashboardData.request.name,
        country: dashboardData.request.country,
        campaign: dashboardData.request.campaign,
        locationHierarchy: {
          identifier: dashboardData.request.locationHierarchy.identifier,
          nodeOrder: dashboardData.request.locationHierarchy.nodeOrder,
          type: dashboardData.request.locationHierarchy.type
        },
        lowestGeography: path[path.length - 1],
        populationTag: dashboardData.request.populationTag,
        structureCountTag: dashboardData.request.structureCountTag,
        countBasedOnImportedLocations: dashboardData.request.countBasedOnImportedLocations,
        stepOneAnswers: dashboardData.request.stepOneAnswers,
        stepTwoAnswers: dashboardData.request.stepTwoAnswers,
        minimalAgeGroup: dashboardData.request.minimalAgeGroup
      };
      submitDashboard(newRequest).then(_ => toast.success('saved data'));
    }
  };

  return (
    <div>
      <h3 className="my-2">Resource plan - {dashboardData?.request.name}</h3>
      <Container fluid className="my-2 p-3 rounded bg-light">
        <Row>
          <Col>
            <p className="p-0 m-0">
              <FontAwesomeIcon icon="align-left" className="me-3 text-secondary pe-none" />
              {path.map((el, index) => {
                return (
                  <span
                    role="button"
                    className={path[index] === currentLevel ? 'me-1 text-secondary pe-none' : 'me-1 link-primary'}
                    key={index}
                    onClick={() => {
                      if (path[index] !== currentLevel) {
                        breadCrumbClickHandler(path[index]);
                      }
                    }}
                  >
                    {index !== 0 ? ' / ' : ''}
                    {el}
                  </span>
                );
              })}
            </p>
          </Col>
          <Col>
            <Button variant={'primary'} className={'float-end position-relative'} onClick={() => submitDashboardData()}>
              Save Data
            </Button>
          </Col>
        </Row>
      </Container>
      {tableData ? <ResourcePlanningTable columns={tableColumns} data={tableData} /> : <p>No data found.</p>}
    </div>
  );
};

export default DashboardTab;
