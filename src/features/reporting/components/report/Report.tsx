import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useEffect, useState } from 'react';
import { Button, Col, Collapse, Container, Row, Table } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Column } from 'react-table';
import { toast } from 'react-toastify';
import MapViewDetail from './mapView/MapViewDetail';
import ReportsTable from '../../../../components/Table/ReportsTable';
import { REPORTING_PAGE } from '../../../../constants';
import { useAppDispatch } from '../../../../store/hooks';
import { getHierarchyById } from '../../../location/api';
import { getPlanById } from '../../../plan/api';
import { PlanModel } from '../../../plan/providers/types';
import { showLoader } from '../../../reducers/loader';
import { getMapReportData, getReportByPlanId } from '../../api';
import { Feature, FeatureCollection, MultiPolygon, Polygon } from '@turf/turf';
import { LocationProperties } from '../../../../utils';
import { useRef } from 'react';
import { FoundCoverage, RowData } from '../../providers/types';
import ReportModal from './reportModal';

const Report = () => {
  const [cols, setCols] = useState<Column[]>([]);
  const [data, setData] = useState<RowData[]>([]);
  const dispatch = useAppDispatch();
  const { planId, reportType } = useParams();
  const navigate = useNavigate();
  const [path, setPath] = useState<
    {
      locationName: string;
      locationIdentifier: string;
      location: FeatureCollection<Polygon | MultiPolygon, LocationProperties>;
    }[]
  >([]);
  const [plan, setPlan] = useState<PlanModel>();
  const [hierarchyLength, setHierarchyLength] = useState(0);
  const [showMap, setShowMap] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [featureSet, setFeatureSet] =
    useState<[location: FeatureCollection<Polygon | MultiPolygon, LocationProperties>, parentId: string]>();
  const [showModal, setShowModal] = useState(false);
  const [currentFeature, setCurrentFeature] = useState<Feature<Polygon | MultiPolygon, LocationProperties>>();
  const [currentSortDirection, setCurrentSortDirection] = useState(false);

  //Using useRef as a workaround for Mapbox issue that onClick event does not see state hooks changes
  const doubleClickHandler = (feature: Feature<Polygon | MultiPolygon, LocationProperties>) => {
    loadChildHandler(feature.id as string, feature.properties.name);
  };
  const handleDobuleClickRef = useRef(doubleClickHandler);
  handleDobuleClickRef.current = doubleClickHandler;

  //Dynamic function to map columns depending on server response
  const mapColumns = (rowColumns: { [x: string]: FoundCoverage }): Column[] => {
    return Object.keys(rowColumns).map(el => {
      return {
        Header: el,
        accessor: (row: any) => {
          return row.columnDataMap[el].value;
        }
      };
    });
  };

  const sortDataHandler = (sortDirection: boolean) => {
    if (data) {
      setCurrentSortDirection(sortDirection);
      setData([
        ...data.sort((a: RowData, b: RowData) => {
          let rowDataA = a.columnDataMap['Distribution Coverage']?.value;
          let rowDataB = b.columnDataMap['Distribution Coverage']?.value;
          if (rowDataA && rowDataB) {
            if (sortDirection) {
              return rowDataB - rowDataA;
            } else {
              return rowDataA - rowDataB;
            }
          } else {
            return 0;
          }
        })
      ]);
    }
  };

  const openModalHandler = (show: boolean, feature?: Feature<Polygon | MultiPolygon, LocationProperties>) => {
    if (feature) setCurrentFeature(feature);
    setShowModal(show);
  };

  const loadData = useCallback(() => {
    dispatch(showLoader(true));
    if (planId && reportType) {
      Promise.all([
        getPlanById(planId),
        getReportByPlanId({
          getChildren: false,
          parentLocationIdentifier: null,
          reportTypeEnum: reportType,
          planIdentifier: planId
        })
      ])
        .then(async ([plan, report]) => {
          setPlan(plan);
          getHierarchyById(plan.locationHierarchy.identifier).then(res => setHierarchyLength(res.nodeOrder.length));
          setCols(mapColumns(report.rowData[0].columnDataMap));
          // default sort by Distribution Coverage if possible
          if (report.rowData[0].columnDataMap['Distribution Coverage']) {
            setData(
              report.rowData.sort((a, b) => {
                let rowDataA = a.columnDataMap['Distribution Coverage'].value;
                let rowDataB = b.columnDataMap['Distribution Coverage'].value;
                if (rowDataA && rowDataB) {
                  return rowDataA - rowDataB;
                } else {
                  return 0;
                }
              })
            );
          } else {
            setData(report.rowData);
          }
          getMapReportData({
            parentLocationIdentifier: null,
            reportTypeEnum: reportType,
            planIdentifier: planId
          }).then(res => {
            setFeatureSet([res, 'main']);
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
  }, [dispatch, planId, navigate, reportType]);

  const columns = React.useMemo<Column[]>(
    () => [{ Header: 'Location name', accessor: 'locationName' }, ...cols],
    [cols]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadChildHandler = (id: string, locationName: string) => {
    if (planId && reportType && path.length < hierarchyLength - 1) {
      dispatch(showLoader(true));
      getReportByPlanId({
        getChildren: true,
        parentLocationIdentifier: id,
        reportTypeEnum: reportType,
        planIdentifier: planId
      })
        .then(res => {
          if (res.rowData.length && res.rowData[0].columnDataMap['Distribution Coverage']) {
            setData(
              res.rowData.sort((a, b) => {
                let rowDataA = a.columnDataMap['Distribution Coverage']?.value;
                let rowDataB = b.columnDataMap['Distribution Coverage']?.value;
                if (rowDataA && rowDataB) {
                  if (currentSortDirection) {
                    return rowDataB - rowDataA;
                  } else {
                    return rowDataA - rowDataB;
                  }
                } else {
                  return 0;
                }
              })
            );
          } else {
            setData(res.rowData);
          }
          getMapReportData({
            parentLocationIdentifier: id,
            planIdentifier: planId,
            reportTypeEnum: reportType
          }).then(res => {
            setFeatureSet([res, id]);
            if (!path.some(el => el.locationIdentifier === id)) {
              setPath([...path, { locationIdentifier: id, locationName: locationName, location: res }]);
            }
          });
        })
        .finally(() => dispatch(showLoader(false)));
    }
  };

  const clearMap = () => {
    if (planId && reportType) {
      dispatch(showLoader(true));
      path.splice(0, path.length);
      setPath(path);
      getReportByPlanId({
        getChildren: false,
        parentLocationIdentifier: null,
        reportTypeEnum: reportType,
        planIdentifier: planId
      })
        .then(res => {
          setData(res.rowData);
          getMapReportData({
            parentLocationIdentifier: null,
            reportTypeEnum: reportType,
            planIdentifier: planId
          }).then(res => {
            setFeatureSet([res, 'main']);
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
      <Row className="bg-light m-0 p-0 rounded">
        <Col xs sm md={10} className="mt-auto">
          <p className="link-primary">
            <FontAwesomeIcon icon="align-left" className="me-3" />
            <span className="me-1" style={{ cursor: 'pointer' }} onClick={() => clearMap()}>
              {plan?.title} /
            </span>
            {path.map((el, index) => {
              return (
                <span
                  style={{ cursor: 'pointer' }}
                  key={el.locationIdentifier}
                  onClick={() => {
                    if (planId && reportType) {
                      dispatch(showLoader(true));
                      path.splice(index + 1, path.length - index);
                      setPath(path);
                      getReportByPlanId({
                        getChildren: true,
                        parentLocationIdentifier: el.locationIdentifier,
                        reportTypeEnum: reportType,
                        planIdentifier: planId
                      })
                        .then(res => {
                          setData(res.rowData);
                          //if its the same object as before we need to make a new copy of an object otherwise rerender won't happen
                          //its enough to spread the object so rerender will be triggered
                          setFeatureSet([{ ...path[index > 0 ? index - 1 : index].location }, el.locationIdentifier]);
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
        </Col>
        <Col className="text-end p-2" xs sm md={2}>
          <Button onClick={() => setShowGrid(!showGrid)}>
            {showGrid ? <FontAwesomeIcon icon="chevron-up" /> : <FontAwesomeIcon icon="chevron-down" />}
          </Button>
        </Col>
      </Row>
      {showGrid && (
        <div
          style={{
            maxHeight: '50vh',
            overflow: 'auto',
          }}
        >
          <ReportsTable clickHandler={loadChildHandler} sortHandler={sortDataHandler} columns={columns} data={data} />
        </div>
      )}
      <Row className="my-3">
        <Col md={showMap ? 10 : 4}>
          <Collapse in={showMap}>
            <div id="expand-table">
              <MapViewDetail
                showModal={openModalHandler}
                doubleClickEvent={(feature: Feature<Polygon | MultiPolygon, LocationProperties>) =>
                  handleDobuleClickRef.current(feature)
                }
                featureSet={featureSet}
                clearMap={clearMap}
              />
            </div>
          </Collapse>
        </Col>
        <Col md={showMap ? 2 : 4} className="text-center">
          <Button
            className="w-75 mt-2"
            onClick={() => setShowMap(!showMap)}
            aria-controls="expand-table"
            aria-expanded={showMap}
          >
            {showMap ? 'Hide Map' : 'Show Map'}
          </Button>
          <Table className="mt-3 text-center">
            <tbody>
              <tr className="bg-light">
                <td>Light Gray</td>
                <td>{'0%'}</td>
              </tr>
              <tr className="bg-secondary">
                <td>Gray</td>
                <td>{'1% > < 20%'}</td>
              </tr>
              <tr className="bg-danger">
                <td>Red</td>
                <td>{'20% - 70%'}</td>
              </tr>
              <tr className="bg-warning">
                <td>Yellow</td>
                <td>{'70% > < 90% '}</td>
              </tr>
              <tr className="bg-success">
                <td>Green</td>
                <td>{'90% - 100%'}</td>
              </tr>
            </tbody>
          </Table>
          <p className="my-2">Conditional formatting rules</p>
        </Col>
      </Row>
      {showModal && currentFeature && <ReportModal showModal={openModalHandler} feature={currentFeature} />}
    </Container>
  );
};

export default Report;
