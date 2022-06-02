import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useEffect, useState } from 'react';
import { Button, Col, Collapse, Container, Row, Table } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Column } from 'react-table';
import { toast } from 'react-toastify';
import MapViewDetail from './mapView/MapViewDetail';
import ReportsTable from '../../../../components/Table/ReportsTable';
import { REPORTING_PAGE, REPORT_TABLE_PERCENTAGE_HIGH, REPORT_TABLE_PERCENTAGE_LOW, REPORT_TABLE_PERCENTAGE_MEDIUM } from '../../../../constants';
import { useAppDispatch } from '../../../../store/hooks';
import { getPlanById } from '../../../plan/api';
import { PlanModel } from '../../../plan/providers/types';
import { showLoader } from '../../../reducers/loader';
import { getMapReportData } from '../../api';
import { Feature, FeatureCollection, MultiPolygon, Polygon } from '@turf/turf';
import { useRef } from 'react';
import { FoundCoverage, ReportLocationProperties } from '../../providers/types';
import ReportModal from './reportModal';

interface BreadcrumbModel {
  locationName: string;
  locationIdentifier: string;
  location: FeatureCollection<Polygon | MultiPolygon, ReportLocationProperties>;
}

const Report = () => {
  const [cols, setCols] = useState<Column[]>([]);
  const [data, setData] = useState<ReportLocationProperties[]>([]);
  const dispatch = useAppDispatch();
  const { planId, reportType } = useParams();
  const navigate = useNavigate();
  const [path, setPath] = useState<BreadcrumbModel[]>([]);
  const [plan, setPlan] = useState<PlanModel>();
  const [showMap, setShowMap] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [featureSet, setFeatureSet] =
    useState<[location: FeatureCollection<Polygon | MultiPolygon, ReportLocationProperties>, parentId: string]>();
  const [showModal, setShowModal] = useState(false);
  const [currentFeature, setCurrentFeature] = useState<Feature<Polygon | MultiPolygon, ReportLocationProperties>>();
  const [currentSortDirection, setCurrentSortDirection] = useState(false);

  //Using useRef as a workaround for Mapbox issue that onClick event does not see state hooks changes
  const doubleClickHandler = (feature: Feature<Polygon | MultiPolygon, ReportLocationProperties>) => {
    loadChildHandler(feature.id as string, feature.properties.name, feature.properties.childrenNumber);
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
        ...data.sort((a, b) => {
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

  const openModalHandler = (show: boolean, feature?: Feature<Polygon | MultiPolygon, ReportLocationProperties>) => {
    if (feature) setCurrentFeature(feature);
    setShowModal(show);
  };

  const loadData = useCallback(() => {
    dispatch(showLoader(true));
    if (planId && reportType) {
      Promise.all([
        getPlanById(planId),
        getMapReportData({
          parentLocationIdentifier: null,
          reportTypeEnum: reportType,
          planIdentifier: planId
        })
      ])
        .then(async ([plan, report]) => {
          setPlan(plan);
          setData([]);
          setCols(mapColumns(report.features[0].properties.columnDataMap));
          //map location data to show it in a table also
          let mapData = report.features.map(el => el.properties);
          // default sort by Distribution Coverage if possible
          if (mapData[0].columnDataMap['Distribution Coverage']) {
            setData(
              mapData.sort((a, b) => {
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
            setData(mapData);
          }
          setFeatureSet([report, 'main']);
          if (!report.features.length) {
            dispatch(showLoader(false));
          }
        })
        .catch(err => {
          dispatch(showLoader(false));
          toast.error(err.message !== undefined ? err.message : 'Unexpected error');
          navigate(-1);
        });
    } else {
      dispatch(showLoader(false));
      navigate(-1);
    }
  }, [dispatch, planId, navigate, reportType]);

  const columns = React.useMemo<Column[]>(
    () => [{ Header: 'Location name', accessor: 'name', id: 'locationName' }, ...cols],
    [cols]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadChildHandler = (id: string, locationName: string, childrenNumber: number) => {
    if (planId && reportType && childrenNumber) {
      dispatch(showLoader(true));
      getMapReportData({
        parentLocationIdentifier: id,
        reportTypeEnum: reportType,
        planIdentifier: planId
      })
        .then(res => {
          let mapData = res.features.map(el => el.properties);
          if (mapData.length) {
            if (res.features[0].properties.columnDataMap['Distribution Coverage']) {
              setCols(mapColumns(mapData[0].columnDataMap));
              setData(
                mapData.sort((a, b) => {
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
              //first set data to empty array for new columns to render
              setData([]);
              setCols(mapColumns(res.features[0].properties.columnDataMap));
              setData(mapData);
            }
            setFeatureSet([res, id]);
            if (!path.some(el => el.locationIdentifier === id)) {
              setPath([...path, { locationIdentifier: id, locationName: locationName, location: res }]);
            }
          } else {
            dispatch(showLoader(false));
            toast.info(`${locationName} has no child locations.`);
          }
        })
        .catch(err => {
          dispatch(showLoader(false));
          toast.error(err.message ? err.message : 'There was an error loading this location.');
        });
    } else {
      dispatch(showLoader(false));
      toast.info(`${locationName} has no child locations.`);
    }
  };

  const clearMap = () => {
    if (planId && reportType) {
      dispatch(showLoader(true));
      path.splice(0, path.length);
      setPath(path);
      loadData();
    }
  };

  const breadCrumbClickHandler = (el: BreadcrumbModel, index: number) => {
    if (planId && reportType) {
      dispatch(showLoader(true));
      path.splice(index + 1, path.length - index);
      setPath(path);
      getMapReportData({
        parentLocationIdentifier: el.locationIdentifier,
        reportTypeEnum: reportType,
        planIdentifier: planId
      })
        .then(res => {
          setData([]);
          if (res.features.length) {
            setCols(mapColumns(res.features[0].properties.columnDataMap));
          }
          setData(res.features.map(el => el.properties));
          //if its the same object as before we need to make a new copy of an object otherwise rerender won't happen
          //its enough to spread the object so rerender will be triggered
          setFeatureSet([{ ...path[index > 0 ? index - 1 : index].location }, el.locationIdentifier]);
          if (!res.features.length) {
            dispatch(showLoader(false));
          }
        })
        .catch(err => {
          dispatch(showLoader(false));
          toast.error(err.message ? err.message : 'There was an error loading this location.');
        });
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
                  onClick={() => breadCrumbClickHandler(el, index)}
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
            overflow: 'auto'
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
                doubleClickEvent={(feature: Feature<Polygon | MultiPolygon, ReportLocationProperties>) =>
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
            className="w-75 my-2"
            onClick={() => setShowMap(!showMap)}
            aria-controls="expand-table"
            aria-expanded={showMap}
          >
            {showMap ? 'Hide Map' : 'Show Map'}
          </Button>
          <Table className="mt-4 text-center">
            <tbody>
              <tr className="bg-danger">
                <td className='py-4'>Red</td>
                <td className='py-4'>{'0% - ' + REPORT_TABLE_PERCENTAGE_LOW + '%'}</td>
              </tr>
              <tr className="bg-warning">
                <td className='py-4'>Orange</td>
                <td className='py-4'>{REPORT_TABLE_PERCENTAGE_LOW + '% - ' + REPORT_TABLE_PERCENTAGE_MEDIUM + '%'}</td>
              </tr>
              <tr className='bg-yellow'>
                <td className='py-4'>Yellow</td>
                <td className='py-4'>{REPORT_TABLE_PERCENTAGE_MEDIUM + '% - ' + REPORT_TABLE_PERCENTAGE_HIGH + '%'}</td>
              </tr>
              <tr className="bg-success">
                <td className='py-4'>Green</td>
                <td className='py-4'>{REPORT_TABLE_PERCENTAGE_HIGH + '% - 100%'}</td>
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
