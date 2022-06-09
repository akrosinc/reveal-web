import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useEffect, useState } from 'react';
import { Button, Col, Collapse, Container, Form, Row, Table } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Column } from 'react-table';
import { toast } from 'react-toastify';
import MapViewDetail from './mapView/MapViewDetail';
import ReportsTable from '../../../../components/Table/ReportsTable';
import {
  REPORTING_PAGE,
  REPORT_TABLE_PERCENTAGE_HIGH,
  REPORT_TABLE_PERCENTAGE_LOW,
  REPORT_TABLE_PERCENTAGE_MEDIUM,
  UNEXPECTED_ERROR_STRING
} from '../../../../constants';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { getPlanById } from '../../../plan/api';
import { PlanModel } from '../../../plan/providers/types';
import { showLoader } from '../../../reducers/loader';
import { getMapReportData } from '../../api';
import { Feature, FeatureCollection, MultiPolygon, Polygon } from '@turf/turf';
import { useRef } from 'react';
import { FoundCoverage, ReportLocationProperties } from '../../providers/types';
import ReportModal from './reportModal';
import { useTranslation } from 'react-i18next';

interface BreadcrumbModel {
  locationName: string;
  locationIdentifier: string;
  location: FeatureCollection<Polygon | MultiPolygon, ReportLocationProperties>;
}

const Report = () => {
  const [cols, setCols] = useState<Column[]>([]);
  const [data, setData] = useState<ReportLocationProperties[]>([]);
  const [filterData, setFilterData] = useState<ReportLocationProperties[]>([]);
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
  const searchInput = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const isDarkMode = useAppSelector(state => state.darkMode.value);

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

  const sortDataHandler = (sortDirection: boolean, sortColumnName: string) => {
    if (filterData && filterData.length) {
      //Sort by location name
      if (sortColumnName === 'Location name') {
        setFilterData([
          ...filterData.sort((a, b) => (sortDirection ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)))
        ]);
      }
      // Otherwise check if there is a column in the data
      else if (filterData[0].columnDataMap[sortColumnName]) {
        setFilterData([
          ...filterData.sort((a, b) => {
            // cast to Number and check if its a numeric value
            let rowDataA = Number(a.columnDataMap[sortColumnName].value);
            let rowDataB = Number(b.columnDataMap[sortColumnName].value);
            if (rowDataA >= 0 && rowDataB >= 0) {
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
    }
  };

  const searchHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    if (input.length) {
      setFilterData(data.filter(el => el.name.toLowerCase().includes(input.toLowerCase())));
    } else {
      setFilterData(data);
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
          if (report.features.length) {
            setPlan(plan);
            setFilterData([]);
            setCols(mapColumns(report.features[0].properties.columnDataMap));
            //map location data to show it in a table also
            const tableData = report.features.map(el => el.properties);
            setData(tableData);
            setFilterData(tableData);
            setFeatureSet([report, 'main']);
          } else {
            toast.error('There is no report data found.');
            dispatch(showLoader(false));
          }
        })
        .catch(err => {
          dispatch(showLoader(false));
          toast.error(err.message !== undefined ? err.message : UNEXPECTED_ERROR_STRING);
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
          //reset search input on new load
          if (searchInput.current) searchInput.current.value = '';
          let tableData = res.features.map(el => el.properties);
          if (tableData.length) {
            //first set data to empty array for new columns to render
            setFilterData([]);
            setCols(mapColumns(res.features[0].properties.columnDataMap));
            setData(tableData);
            setFilterData(tableData);
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
    //clear all map data and return to root element on the grid
    if (planId && reportType) {
      //reset search input on new load
      if (searchInput.current) searchInput.current.value = '';
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
          //reset search input on new load
          if (searchInput.current) searchInput.current.value = '';
          setData([]);
          setFilterData([]);
          if (res.features.length) {
            const tableData = res.features.map(el => el.properties);
            setCols(mapColumns(res.features[0].properties.columnDataMap));
            setData(tableData);
            setFilterData(tableData);
          }
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
            <FontAwesomeIcon icon="arrow-left" className="me-2" /> {t('reportPage.title')}
          </Link>
        </Col>
        <Col md={6} className="text-center">
          <h2 className="m-0">
            {t('reportPage.subtitle')} ({plan?.title})
          </h2>
        </Col>
      </Row>
      <hr />
      <Row className={isDarkMode ? 'm-0 p-0 rounded bg-dark' : 'm-0 p-0 rounded bg-light'}>
        <Col xs sm md={10} className="mt-auto">
          <p className="link-primary">
            <FontAwesomeIcon icon="align-left" className="me-3" />
            <span className="me-1" style={{ cursor: 'pointer' }} onClick={() => clearMap()}>
              {plan?.title} /
            </span>
            {path.map((el, index) => {
              return (
                <span
                  style={{
                    cursor: index === path.length - 1 ? 'default' : 'pointer',
                    color: index === path.length - 1 ? 'gray' : ''
                  }}
                  key={el.locationIdentifier}
                  onClick={() => {
                    if (index < path.length - 1) {
                      breadCrumbClickHandler(el, index);
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
        <>
          <Row className="mt-3 mb-2">
            <Col md={4} lg={3}>
              <Form>
                <Form.Group>
                  <Form.Control
                    className={isDarkMode ? 'bg-dark text-white' : ''}
                    ref={searchInput}
                    placeholder={t('reportPage.search')}
                    type="text"
                    onChange={searchHandler}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        return false;
                      }
                    }}
                  />
                </Form.Group>
              </Form>
            </Col>
          </Row>
          <div
            style={{
              maxHeight: '50vh',
              overflow: 'auto'
            }}
          >
            <ReportsTable
              clickHandler={loadChildHandler}
              sortHandler={sortDataHandler}
              columns={columns}
              data={filterData}
            />
          </div>
        </>
      )}
      {filterData.length === 0 && <p className="lead text-center">{t('general.noDataFound')}</p>}
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
            {showMap ? t('reportPage.hideMap') : t('reportPage.showMap')}
          </Button>
          <Table className="mt-4 text-center">
            <tbody>
              <tr className="bg-danger">
                <td className="py-4">{t('reportPage.formattingRuleColors.red')}</td>
                <td className="py-4">{'0% - ' + REPORT_TABLE_PERCENTAGE_LOW + '%'}</td>
              </tr>
              <tr className="bg-warning">
                <td className="py-4">{t('reportPage.formattingRuleColors.orange')}</td>
                <td className="py-4">{REPORT_TABLE_PERCENTAGE_LOW + '% - ' + REPORT_TABLE_PERCENTAGE_MEDIUM + '%'}</td>
              </tr>
              <tr className="bg-yellow">
                <td className="py-4">{t('reportPage.formattingRuleColors.yellow')}</td>
                <td className="py-4">{REPORT_TABLE_PERCENTAGE_MEDIUM + '% - ' + REPORT_TABLE_PERCENTAGE_HIGH + '%'}</td>
              </tr>
              <tr className="bg-success">
                <td className="py-4">{t('reportPage.formattingRuleColors.green')}</td>
                <td className="py-4">{REPORT_TABLE_PERCENTAGE_HIGH + '% - 100%'}</td>
              </tr>
            </tbody>
          </Table>
          <p className="my-2">{t('reportPage.formattingRules')}</p>
        </Col>
      </Row>
      {showModal && currentFeature && <ReportModal showModal={openModalHandler} feature={currentFeature} />}
    </Container>
  );
};

export default Report;
