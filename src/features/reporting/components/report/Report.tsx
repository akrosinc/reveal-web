import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { Button, Col, Collapse, Container, Form, Row, Table } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { Column } from 'react-table';
import { toast } from 'react-toastify';
import MapViewDetail from './mapView/MapViewDetail';
import ReportsTable from '../../../../components/Table/ReportsTable';
import {
  REPORTING_PAGE,
  REPORT_TABLE_PERCENTAGE_HIGH,
  REPORT_TABLE_PERCENTAGE_LOW,
  REPORT_TABLE_PERCENTAGE_MEDIUM
} from '../../../../constants';
import { useAppSelector } from '../../../../store/hooks';
import { getPlanById } from '../../../plan/api';
import { PlanModel } from '../../../plan/providers/types';
import { getMapReportData, getReportTypeInfo } from '../../api';
import { Feature, FeatureCollection, MultiPolygon, Polygon } from '@turf/turf';
import { useRef } from 'react';
import { AdditionalReportInfo, FoundCoverage, ReportLocationProperties } from '../../providers/types';
import ReportModal from './reportModal';
import { useTranslation } from 'react-i18next';
import Select, { MultiValue } from 'react-select';

interface BreadcrumbModel {
  locationName: string;
  locationIdentifier: string;
  location: FeatureCollection<Polygon | MultiPolygon, ReportLocationProperties>;
}

const Report = () => {
  const [cols, setCols] = useState<Column[]>([]);
  const [data, setData] = useState<ReportLocationProperties[]>([]);
  const [filterData, setFilterData] = useState<ReportLocationProperties[]>([]);
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
  const [defaultDisplayColumn, setDefaultDisplayColumn] = useState('');
  const [reportInfo, setReportInfo] = useState<AdditionalReportInfo>();
  const [selectedReportInfo, setSelectedReportInfo] = useState<
    MultiValue<{
      label: string;
      value: string;
    }>
  >();

  //Using useRef as a workaround for Mapbox issue that onClick event does not see state hooks changes
  const doubleClickHandler = (feature: Feature<Polygon | MultiPolygon, ReportLocationProperties>) => {
    loadChildHandler(
      feature.id as string,
      feature.properties.name,
      selectedReportInfo?.map(el => el.value)
    );
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

  const searchHandler = (e: ChangeEvent<HTMLInputElement>) => {
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

  const goBackHandler = useCallback(() => {
    navigate(REPORTING_PAGE, {
      state: {
        reportType: reportType
      }
    });
  }, [navigate, reportType]);

  const loadData = useCallback(
    (selectedReport?: string[]) => {
      if (planId && reportType) {
        getReportTypeInfo(reportType).then(res => {
          setReportInfo(res);
          if (res.dashboardFilter && res.dashboardFilter.drug && !!!selectedReport) {
            setSelectedReportInfo(
              res.dashboardFilter.drug.map(el => {
                return {
                  label: el,
                  value: el
                };
              })
            );
          }
          Promise.all([
            getPlanById(planId),
            getMapReportData(
              {
                parentLocationIdentifier: null,
                reportTypeEnum: reportType,
                planIdentifier: planId
              },
              res.dashboardFilter && res.dashboardFilter.drug ? selectedReport ?? res.dashboardFilter.drug : undefined
            )
          ])
            .then(async ([plan, report]) => {
              if (report.features.length) {
                //map location data to show it in a table also
                const tableData = report.features.map(el => el.properties);
                //check if there is a default column set
                //casting to any because using custom geoJSON object
                const defaultDisplayColumn: string | undefined = (report as any).defaultDisplayColumn;
                if (defaultDisplayColumn) {
                  setDefaultDisplayColumn(defaultDisplayColumn);
                  report.features.forEach(el => {
                    el.properties.defaultColumnValue = el.properties.columnDataMap[defaultDisplayColumn].value;
                  });
                } else {
                  setDefaultDisplayColumn('');
                }
                setPlan(plan);
                setFilterData([]);
                setCols(mapColumns(report.features[0].properties.columnDataMap));
                setData(tableData);
                setFilterData(tableData);
                setFeatureSet([report, 'main']);
              } else {
                toast.error('There is no report data found.');
              }
            })
            .catch(err => {
              toast.error(err);
              goBackHandler();
            });
        });
      } else {
        goBackHandler();
      }
    },
    [planId, reportType, goBackHandler]
  );

  const columns = React.useMemo<Column[]>(
    () => [{ Header: 'Name', accessor: 'name', id: 'locationName' }, ...cols],
    [cols]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadChildHandler = (id: string, locationName: string, selectedReportInfo?: string[]) => {
    if (planId && reportType) {
      getMapReportData(
        {
          parentLocationIdentifier: id,
          reportTypeEnum: reportType,
          planIdentifier: planId
        },
        selectedReportInfo
      )
        .then(res => {
          //reset search input on new load
          if (searchInput.current) searchInput.current.value = '';
          //mapping location properties to data usable for table view
          const tableData = res.features.map(el => el.properties);
          //casting to any because of using custom geoJSON object
          const defaultDisplayColumn: string | undefined = (res as any).defaultDisplayColumn;
          if (tableData.length) {
            //first set data to empty array for new columns to render
            setFilterData([]);
            //check if there is a default column set and add default column property
            if (defaultDisplayColumn) {
              setDefaultDisplayColumn(defaultDisplayColumn);
              res.features.forEach(el => {
                if (el.properties.columnDataMap[defaultDisplayColumn]) {
                  el.properties.defaultColumnValue = el.properties.columnDataMap[defaultDisplayColumn].value;
                }
              });
            } else {
              setDefaultDisplayColumn('');
            }
            setCols(mapColumns(res.features[0].properties.columnDataMap));
            setData(tableData);
            setFilterData(tableData);
            setFeatureSet([res, id]);
            if (!path.some(el => el.locationIdentifier === id)) {
              setPath([...path, { locationIdentifier: id, locationName: locationName, location: res }]);
            }
          } else {
            toast.info(`${locationName} has no child locations.`);
          }
        })
        .catch(err => {
          toast.error(err);
        });
    } else {
      toast.info(`There was an error loading ${locationName}.`);
    }
  };

  const clearMap = (filter?: string[]) => {
    //clear all map data and return to root element on the grid
    if (planId && reportType) {
      //reset search input on new load
      if (searchInput.current) searchInput.current.value = '';
      setFeatureSet(undefined);
      path.splice(0, path.length);
      setPath(path);
      loadData(filter);
    }
  };

  const breadCrumbClickHandler = (el: BreadcrumbModel, index: number) => {
    if (planId && reportType) {
      path.splice(index + 1, path.length - index);
      setPath(path);
      getMapReportData(
        {
          parentLocationIdentifier: el.locationIdentifier,
          reportTypeEnum: reportType,
          planIdentifier: planId
        },
        selectedReportInfo?.map(el => el.value)
      )
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
          }
        })
        .catch(err => {
          toast.error(err);
        });
    }
  };

  return (
    <Container fluid className="my-4 px-2">
      <Row className="mt-3 align-items-center">
        <Col md={3}>
          <Button id="back-button" onClick={goBackHandler} className="btn btn-primary">
            <FontAwesomeIcon icon="arrow-left" className="me-2" /> {t('reportPage.title')}
          </Button>
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
          <p>
            <FontAwesomeIcon
              icon="align-left"
              className={path.length ? 'me-3 link-primary pe-none' : 'me-3 text-secondary pe-none'}
            />
            <span
              role="button"
              className={path.length ? 'me-1 link-primary' : 'me-1 text-secondary pe-none'}
              onClick={() => clearMap(selectedReportInfo?.map(el => el.value))}
            >
              {plan?.title} /
            </span>
            {path.map((el, index) => {
              return (
                <span
                  role="button"
                  className={index === path.length - 1 ? 'me-1 text-secondary pe-none' : 'me-1 link-primary'}
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
              <Form.Control
                ref={searchInput}
                className="h-100"
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
            </Col>
            {reportInfo && reportInfo.dashboardFilter !== null && reportInfo.dashboardFilter.drug.length && (
              <Col md={6}>
                <Select
                  placeholder="Select Drug Type"
                  className="custom-react-select-container w-50"
                  classNamePrefix="custom-react-select"
                  id="team-assign-select"
                  isClearable
                  value={selectedReportInfo}
                  isMulti
                  options={reportInfo.dashboardFilter.drug.map(el => {
                    return { value: el, label: el };
                  })}
                  onChange={newValue => {
                    setSelectedReportInfo(newValue);
                    if (path.length) {
                      loadChildHandler(
                        path[path.length - 1].locationIdentifier,
                        path[path.length - 1].locationName,
                        newValue.map(el => el.value)
                      );
                    } else {
                      loadData(newValue.map(el => el.value));
                    }
                  }}
                />
              </Col>
            )}
          </Row>
          <div
            style={{
              maxHeight: '50vh',
              overflow: 'auto'
            }}
          >
            <ReportsTable
              clickHandler={(locationId, locationName) =>
                loadChildHandler(
                  locationId,
                  locationName,
                  selectedReportInfo?.map(el => el.value)
                )
              }
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
                defaultColumn={defaultDisplayColumn}
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
