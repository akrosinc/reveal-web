import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Column } from 'react-table';
import { toast } from 'react-toastify';
import MapViewDetail from './mapView/MapViewDetail';
import ReportsTable from '../../../../components/Table/ReportsTable';
import { REPORTING_PAGE } from '../../../../constants';
import { useAppDispatch } from '../../../../store/hooks';
import { getLocationById } from '../../../location/api';
import { LocationModel } from '../../../location/providers/types';
import { getPlanById } from '../../../plan/api';
import { PlanModel } from '../../../plan/providers/types';
import { showLoader } from '../../../reducers/loader';
import { getReportByPlanId } from '../../api';

const Report = () => {
  const [cols, setCols] = useState<Column[]>([]);
  const [data, setData] = useState<any[]>([]);
  const dispatch = useAppDispatch();
  const { planId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [path, setPath] = useState<{ locationName: string; locationIdentifier: string }[]>([]);
  const locationArr: LocationModel[] = [];
  const [featureSet, setFeatureSet] = useState({});
  const [plan, setPlan] = useState<PlanModel>();

  const loadData = useCallback(() => {
    dispatch(showLoader(true));
    if (planId && location.state?.reportType) {
      getPlanById(planId).then(res => setPlan(res));
      getReportByPlanId({
        getChildren: false,
        parentLocationIdentifier: null,
        reportTypeEnum: location.state.reportType,
        planIdentifier: planId
      })
        .then(res => {
          setCols(
            Object.keys(res.rowData[0].columnDataMap).map(el => {
              return {
                Header: el,
                accessor: (row: any) => {
                  return row.columnDataMap[el].value;
                }
              };
            })
          );
          setData(res.rowData);
          getLocationById(res.rowData[0].locationIdentifier).then(res => {
            setFeatureSet({
              identifier: 'main',
              type: 'FeatureCollection',
              features: [res]
            });
          });
        })
        .catch(err => {
          toast.error(err.message !== undefined ? err.message : 'Unexpected error');
          navigate(-1);
        })
        .finally(() => {
          dispatch(showLoader(false));
        });
    } else {
      dispatch(showLoader(false));
      navigate(-1);
    }
  }, [dispatch, planId, navigate, location]);

  const columns = React.useMemo<Column[]>(
    () => [{ Header: 'Location name', accessor: 'locationName' }, ...cols],
    [cols]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadChildHandler = (id: string, locationName: string) => {
    if (planId) {
      dispatch(showLoader(true));
      if (!path.some(el => el.locationIdentifier === id)) {
        setPath([...path, { locationIdentifier: id, locationName: locationName }]);
      }
      getReportByPlanId({
        getChildren: true,
        parentLocationIdentifier: id,
        reportTypeEnum: location.state.reportType,
        planIdentifier: planId
      })
        .then(res => {
          setData(res.rowData);
          res.rowData.forEach((el, index) => {
            getLocationById(el.locationIdentifier).then(loc => {
              locationArr.push(loc);
              if (index === res.rowData.length - 1) {
                setFeatureSet({
                  identifier: res.parentLocationIdentifier,
                  type: 'FeatureCollection',
                  features: locationArr
                });
              }
            });
          });
        })
        .finally(() => dispatch(showLoader(false)));
    }
  };

  return (
    <Container fluid className="my-4 px-2">
      <Row className="mt-3 align-items-center">
        <Col md={3}>
          <Link id="back-button" to={REPORTING_PAGE} className="btn btn-primary">
            <FontAwesomeIcon icon="arrow-left" className="me-2" /> Reports
          </Link>
        </Col>
        <Col md={6} className="text-center">
          <h2 className="m-0">Report ({plan?.title})</h2>
        </Col>
      </Row>
      <hr />
      <p className="bg-light p-3 link-primary">
        <FontAwesomeIcon icon="align-left" className="me-3" />
        <span
          className="me-1"
          style={{ cursor: 'pointer' }}
          onClick={() => {
            if (planId) {
              dispatch(showLoader(true));
              path.splice(0, path.length);
              setPath(path);
              getReportByPlanId({
                getChildren: false,
                parentLocationIdentifier: null,
                reportTypeEnum: location.state.reportType,
                planIdentifier: planId
              })
                .then(res => {
                  setData(res.rowData);
                })
                .finally(() => dispatch(showLoader(false)));
            }
          }}
        >
          {plan?.title} /
        </span>
        {path.map((el, index) => {
          return (
            <span
              style={{ cursor: 'pointer' }}
              key={el.locationIdentifier}
              onClick={() => {
                if (planId) {
                  dispatch(showLoader(true));
                  path.splice(index + 1, path.length - index);
                  setPath(path);
                  getReportByPlanId({
                    getChildren: true,
                    parentLocationIdentifier: el.locationIdentifier,
                    reportTypeEnum: location.state.reportType,
                    planIdentifier: planId
                  })
                    .then(res => {
                      setData(res.rowData);
                    })
                    .finally(() => dispatch(showLoader(false)));
                }
              }}
            >
              {index !== 0 ? ' / ' : ''}
              {el.locationName}
            </span>
          );
        })}
      </p>
      <div style={{ maxHeight: '400px', overflow: 'auto' }}>
        <ReportsTable clickHandler={loadChildHandler} columns={columns} data={data} />
      </div>
      <Row className="my-3">
        <Col md={12}>
          <MapViewDetail locations={featureSet} />
        </Col>
      </Row>
    </Container>
  );
};

export default Report;
