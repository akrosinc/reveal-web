import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Button, Card, Col, Collapse, Container, Form, ProgressBar, Row, Table } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { Column } from 'react-table';
import { toast } from 'react-toastify';
import MapViewDetail from './mapView/MapViewDetail';
import ReportsTable from '../../../../components/Table/ReportsTable';
import {
  KEY_INDICATOR_LEVELS,
  REPORT_TABLE_PERCENTAGE_HIGH,
  REPORT_TABLE_PERCENTAGE_LOW,
  REPORT_TABLE_PERCENTAGE_MEDIUM,
  REPORTING_PAGE
} from '../../../../constants';
import { useAppSelector } from '../../../../store/hooks';
import { getPlanById } from '../../../plan/api';
import { PlanModel } from '../../../plan/providers/types';
import { getMapReportData, getReportTypeInfo } from '../../api';
import { Feature, FeatureCollection, MultiPolygon, Point, Polygon } from '@turf/turf';
import { AdditionalReportInfo, FoundCoverage, ReportLocationProperties, ReportType } from '../../providers/types';
import ReportModal from './reportModal';
import { useTranslation } from 'react-i18next';
import Select, { SingleValue } from 'react-select';

interface BreadcrumbModel {
  locationName: string;
  locationIdentifier: string;
  locationProperties: ReportLocationProperties | undefined;
}

const REPORT_TYPE = [
  { name: 'treatmentCoverage', label: 'Treatment coverage', value: 'TREATMENT_COVERAGE' },
  { name: 'drugInventoryAdverseReporting', label: 'Drug Inventory / Adverse Reporting', value: 'DRUG_DISTRIBUTION' },
  { name: 'populationCoverage', label: 'Population coverage', value: 'POPULATION_DISTRIBUTION' }
];
const DISEASE_LIST = [
  { label: 'STH', value: 'STH' },
  { label: 'SCH', value: 'SCH' },
  { label: 'Onchocerciasis', value: 'Onchocerciasis' }
];

const getValidDiseaseList = (reportType: any) => {
  if (reportType === ReportType.MDA_LITE_COVERAGE) {
    return [DISEASE_LIST[0], DISEASE_LIST[1]];
  } else {
    return [DISEASE_LIST[2]];
  }
};

const getValidDefaultDisease = (reportType: any) => {
  if (reportType === ReportType.MDA_LITE_COVERAGE) {
    return DISEASE_LIST[0];
  } else {
    return DISEASE_LIST[2];
  }
};

const getReportDetails = (reportType: any) => {
  let report = reportType ? reportType : 'DEFAULT';
  if (KEY_INDICATOR_LEVELS[report] === undefined) {
    return KEY_INDICATOR_LEVELS['DEFAULT'];
  } else {
    return KEY_INDICATOR_LEVELS[report];
  }
};

const Report = () => {
  const [cols, setCols] = useState<{ [x: string]: FoundCoverage }>({});
  const [data, setData] = useState<ReportLocationProperties[]>([]);
  const [filterData, setFilterData] = useState<ReportLocationProperties[]>([]);
  const { planId, reportType } = useParams();
  const navigate = useNavigate();
  const [path, setPath] = useState<BreadcrumbModel[]>([]);
  const [plan, setPlan] = useState<PlanModel>();
  const [showMap, setShowMap] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [reportLevel, setReportLevel] = useState<String>();
  const [featureSet, setFeatureSet] =
    useState<
      [
        location: FeatureCollection<Polygon | MultiPolygon | Point, ReportLocationProperties>,
        parentId: string,
        path: string[]
      ]
    >();
  const [showModal, setShowModal] = useState(false);
  const [currentFeature, setCurrentFeature] =
    useState<Feature<Polygon | MultiPolygon | Point, ReportLocationProperties>>();
  const searchInput = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const isDarkMode = useAppSelector(state => state.darkMode.value);
  const [defaultDisplayColumn, setDefaultDisplayColumn] = useState('');
  const [reportInfo, setReportInfo] = useState<AdditionalReportInfo>();
  const [selectedReportInfo, setSelectedReportInfo] = useState<
    SingleValue<{
      label: string;
      value: string;
    }>
  >();
  const [irsOaProgressBar, setIrsOaProgressBar] = useState<{
    completeStructures: number;
    completeStructuresPercent: number;
    notSprayedStructures: number;
    foundCoveragePercent: number;
    sprayCoveragePercent: number;
  }>({
    completeStructures: 0,
    completeStructuresPercent: 0,
    notSprayedStructures: 0,
    foundCoveragePercent: 0,
    sprayCoveragePercent: 0
  });
  const [selectedMdaLiteReport, setSelectedMdaLiteReport] = useState<{ label: string; value: string } | undefined>(
    reportType === (ReportType.MDA_LITE_COVERAGE || ReportType.ONCHOCERCIASIS_SURVEY) ? REPORT_TYPE[0] : undefined
  );
  const selectInputRef = useRef<any>(null);
  const clearButtonRef = useRef<any>(null);

  //Using useRef as a workaround for Mapbox issue that onClick event does not see state hooks changes
  const doubleClickHandler = (feature: Feature<Polygon | MultiPolygon, ReportLocationProperties>) => {
    loadChildHandler(
      feature.id as string,
      feature.properties.name,
      selectedReportInfo?.value,
      undefined,
      selectedMdaLiteReport?.value
    );
  };
  const handleDobuleClickRef = useRef(doubleClickHandler);
  handleDobuleClickRef.current = doubleClickHandler;

  //Dynamic function to map columns depending on server response
  const mapColumns = (rowColumns: { [x: string]: FoundCoverage }): Column[] => {
    return Object.entries(rowColumns)
      .filter(rc => rc[1] && !rc[1].isHidden)
      .map(e => e[0])
      .map(el => {
        return {
          Header: el,
          accessor: (row: any) => {
            return row.columnDataMap[el].value;
          }
        };
      });
  };

  const columns = React.useMemo<Column[]>(() => {
    return [{ Header: 'Name', accessor: 'name', id: 'locationName' }, ...mapColumns(cols)];
  }, [cols]);

  const sortDataHandler = (sortDirection: boolean, sortColumnName: string) => {
    if (filterData && filterData.length) {
      //Sort by location name
      if (sortColumnName === 'Name') {
        setFilterData([
          ...filterData.sort((a, b) => (sortDirection ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)))
        ]);
      } else if (filterData && filterData.length && filterData[0].columnDataMap[sortColumnName]) {
        if (
          filterData[0].columnDataMap[sortColumnName].dataType === 'double' ||
          filterData[0].columnDataMap[sortColumnName].dataType === 'integer'
        ) {
          setFilterData([
            ...filterData.sort((a, b) => {
              try {
                // cast to Number and check if its a numeric value
                let rowDataA = Number(a.columnDataMap[sortColumnName].value);
                let rowDataB = Number(b.columnDataMap[sortColumnName].value);
                return sortDirection ? rowDataB - rowDataA : rowDataA - rowDataB;
              } catch {
                return 0;
              }
            })
          ]);
        } else if (filterData[0].columnDataMap[sortColumnName].dataType === 'string') {
          setFilterData([
            ...filterData.sort((a, b) => {
              try {
                // cast to String and compare values to sort
                const rowDataA = String(a.columnDataMap[sortColumnName].value);
                const rowDataB = String(b.columnDataMap[sortColumnName].value);
                return sortDirection ? rowDataA.localeCompare(rowDataB) : rowDataB.localeCompare(rowDataA);
              } catch {
                return 0;
              }
            })
          ]);
        }
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

  const matchReportBandLevelByValue = useCallback(
    (val: number | undefined) => {
      let reportBandLevels = getReportDetails(reportType);
      for (const i in reportBandLevels) {
        let doesFitInRange =
          ((val ? (val > 0 ? val : 0) : 0) >= reportBandLevels[i].min && (val ? val : 0) < reportBandLevels[i].max) ||
          ((val ? val : 0) >= reportBandLevels[i].max && reportBandLevels[i].highest);
        if (doesFitInRange) {
          return reportBandLevels[i];
        }
      }
    },
    [reportType]
  );

  const loadData = useCallback(
    (selectedReport?: string, type?: string) => {
      if (planId && reportType) {
        getReportTypeInfo(reportType).then(res => {
          if (res.dashboardFilter && res.dashboardFilter.ntd && selectedReport === undefined) {
            setReportInfo(res);
            if (selectedReport === undefined) {
              setSelectedReportInfo({
                label: res.dashboardFilter.ntd,
                value: res.dashboardFilter.ntd
              });
            }
          }
          Promise.all([
            getPlanById(planId),
            getMapReportData(
              {
                parentLocationIdentifier: null,
                reportTypeEnum: reportType,
                planIdentifier: planId
              },
              res.dashboardFilter && res.dashboardFilter.ntd ? selectedReport ?? res.dashboardFilter.ntd : undefined,
              type
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
                    el.properties.evaluatedColor = matchReportBandLevelByValue(el.properties.defaultColumnValue).color;
                  });
                } else {
                  setDefaultDisplayColumn('');
                  report.features.forEach(el => {
                    el.properties.evaluatedColor = matchReportBandLevelByValue(undefined).color;
                  });
                }
                setPlan(plan);
                setFilterData([]);
                setCols(report.features[0].properties.columnDataMap);
                setData(tableData);
                setFilterData(tableData);
                setFeatureSet([report, 'main', []]);
                setReportLevel(report.features[0].properties.reportLevel);
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
    [planId, reportType, goBackHandler, matchReportBandLevelByValue]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadChildHandler = (
    id: string,
    locationName: string,
    selectedReportInfo?: string,
    parentData?: ReportLocationProperties,
    mdaReportType?: string
  ) => {
    if (planId && reportType) {
      getMapReportData(
        {
          parentLocationIdentifier: id,
          reportTypeEnum: reportType,
          planIdentifier: planId
        },
        selectedReportInfo,
        mdaReportType
      )
        .then(res => {
          const parentProperties = filterData.find(el => el.id === id) ?? parentData;
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
                  el.properties.evaluatedColor = matchReportBandLevelByValue(el.properties.defaultColumnValue).color;
                }
              });
            } else {
              setDefaultDisplayColumn('');
              res.features.forEach(el => {
                el.properties.evaluatedColor = matchReportBandLevelByValue(undefined).color;
              });
            }
            setCols(res.features[0].properties.columnDataMap);
            setData(tableData);
            setReportLevel(res.features[0].properties.reportLevel);
            setFilterData(tableData);
            setFeatureSet([res, id, path.map(el => el.locationIdentifier)]);
            if (!path.some(el => el.locationIdentifier === id)) {
              setPath([
                ...path,
                {
                  locationIdentifier: id,
                  locationName: locationName,
                  locationProperties: parentProperties
                }
              ]);
            }
            // in case of irs report type and structure geo level calculate progress bar data
            if (tableData[0].geographicLevel === 'structure' && reportType === ReportType.IRS_FULL_COVERAGE) {
              irsOaProgressBar.completeStructures = tableData.reduce((total, el) => {
                if (el.columnDataMap['Structure Status'].value === 'Complete') {
                  return (total += 1);
                }
                return total;
              }, 0);
              irsOaProgressBar.notSprayedStructures = tableData.reduce((total, el) => {
                if (el.columnDataMap['Structure Status'].value === 'Not Sprayed') {
                  return (total += 1);
                }
                return total;
              }, 0);
              irsOaProgressBar.completeStructuresPercent =
                parentProperties?.columnDataMap['Spray Progress (Sprayed/Targeted)'].value ?? 0;
              irsOaProgressBar.foundCoveragePercent =
                parentProperties?.columnDataMap['Found Coverage (Found/Target)'].value ?? 0;
              irsOaProgressBar.sprayCoveragePercent =
                parentProperties?.columnDataMap['Spray Coverage of Found(Sprayed/Found)'].value ?? 0;
              setIrsOaProgressBar({ ...irsOaProgressBar });
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

  const clearMap = useCallback(
    (filter?: string) => {
      //clear all map data and return to root element on the grid
      if (planId && reportType) {
        //reset search input on new load
        if (searchInput.current) searchInput.current.value = '';
        setFeatureSet(undefined);
        setPath(path => {
          path.splice(0, path.length);
          return path;
        });
        setSelectedMdaLiteReport(state => {
          loadData(selectedReportInfo?.value, state?.value);
          return state;
        });
      }
    },
    [planId, reportType, loadData, selectedReportInfo]
  );

  const breadCrumbClickHandler = (el: BreadcrumbModel, index: number) => {
    if (planId && reportType) {
      const locationsToDelete = path.splice(index + 1);
      setPath(path);
      getMapReportData(
        {
          parentLocationIdentifier: el.locationIdentifier,
          reportTypeEnum: reportType,
          planIdentifier: planId
        },
        selectedReportInfo?.value,
        selectedMdaLiteReport?.value
      )
        .then(res => {
          //reset search input on new load
          if (searchInput.current) searchInput.current.value = '';
          setData([]);
          setFilterData([]);
          setReportLevel('');
          if (res.features.length) {
            const tableData = res.features.map(el => el.properties);
            const defaultDisplayColumn: string | undefined = (res as any).defaultDisplayColumn;
            if (defaultDisplayColumn) {
              setDefaultDisplayColumn(defaultDisplayColumn);
              res.features.forEach(el => {
                el.properties.defaultColumnValue = el.properties.columnDataMap[defaultDisplayColumn].value;
                el.properties.evaluatedColor = matchReportBandLevelByValue(el.properties.defaultColumnValue).color;
              });
            } else {
              setDefaultDisplayColumn('');
              res.features.forEach(el => {
                el.properties.evaluatedColor = matchReportBandLevelByValue(undefined).color;
              });
            }
            setCols(res.features[0].properties.columnDataMap);
            setData(tableData);
            setFilterData(tableData);
            setReportLevel(res.features[0].properties.reportLevel);
            //if its the same object as before we need to make a new copy of an object otherwise rerender won't happen
            //its enough to spread the object so rerender will be triggered
            setFeatureSet([{ ...res }, el.locationIdentifier, locationsToDelete.map(loc => loc.locationIdentifier)]);
          }
        })
        .catch(err => {
          toast.error(err);
        });
    }
  };

  const mapNotSprayed = () => {
    const newMap = new Map();
    newMap.set('locked', 0);
    newMap.set('funeral', 0);
    newMap.set('sick', 0);
    newMap.set('refused', 0);

    filterData.forEach(el => {
      if (el.columnDataMap['Not Sprayed Reason'].value === 'funeral') {
        newMap.set('funeral', newMap.get('funeral') + 1);
      }
      if (el.columnDataMap['Not Sprayed Reason'].value === 'locked') {
        newMap.set('locked', newMap.get('locked') + 1);
      }
      if (el.columnDataMap['Not Sprayed Reason'].value === 'sick') {
        newMap.set('sick', newMap.get('sick') + 1);
      }
      if (el.columnDataMap['Not Sprayed Reason'].value === 'refused') {
        newMap.set('refused', newMap.get('refused') + 1);
      }
    });
    return newMap;
  };

  const showStatusColor = (percentage: number) => {
    if (percentage >= REPORT_TABLE_PERCENTAGE_HIGH) {
      return 'success';
    }
    if (percentage >= REPORT_TABLE_PERCENTAGE_MEDIUM && percentage < REPORT_TABLE_PERCENTAGE_HIGH) {
      return 'yellow';
    }
    if (percentage >= REPORT_TABLE_PERCENTAGE_LOW && percentage < REPORT_TABLE_PERCENTAGE_MEDIUM) {
      return 'warning';
    }
    if (percentage >= 0 && percentage < REPORT_TABLE_PERCENTAGE_LOW) {
      return 'danger';
    }
  };

  return (
    <Container fluid className="my-4 px-2">
      <Row className="mt-3 align-items-center">
        <Col md={3}>
          <Button id="back-button" onClick={goBackHandler} className="btn btn-primary mb-3 mb-md-0">
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
              onClick={() => {
                clearButtonRef.current.click();
              }}
            >
              {plan?.title} /
            </span>
            {path.map((el, index) => {
              return (
                <span
                  role="button"
                  className={index === path.length - 1 ? 'me-1 text-secondary pe-auto' : 'me-1 link-primary'}
                  key={el.locationIdentifier}
                  onClick={() => {
                    if (index < path.length - 1) {
                      breadCrumbClickHandler(el, index);
                    }
                  }}
                  title={el.locationProperties?.geographicLevel}
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
          <Row className="mt-3 mb-2 align-items-center">
            <Col md={reportInfo && reportInfo.dashboardFilter !== null && reportInfo.dashboardFilter.ntd ? 3 : 6}>
              <Form.Control
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
            </Col>
            {reportInfo && reportInfo.dashboardFilter !== null && reportInfo.dashboardFilter.ntd && (
              <>
                <Col md={3} className="my-2">
                  <Select
                    placeholder="Filter by disease"
                    className="custom-react-select-container w-100"
                    classNamePrefix="custom-react-select"
                    id="team-assign-select"
                    defaultValue={getValidDefaultDisease(reportType)}
                    options={getValidDiseaseList(reportType)}
                    ref={selectInputRef}
                    onChange={newValue => {
                      if (newValue) {
                        // const mappedValues = newValue;
                        setSelectedReportInfo(newValue);
                        if (path.length) {
                          loadChildHandler(
                            path[path.length - 1].locationIdentifier,
                            path[path.length - 1].locationName,
                            newValue?.value,
                            undefined,
                            selectedMdaLiteReport?.value
                          );
                        } else {
                          setSelectedMdaLiteReport(state => {
                            loadData(newValue ? newValue.value : selectedReportInfo?.value, state?.value);
                            return state;
                          });
                        }
                      }
                    }}
                  />
                </Col>
                <Col md={3} className="my-2"></Col>
              </>
            )}
            <Col
              md={reportInfo && reportInfo.dashboardFilter !== null && reportInfo.dashboardFilter.ntd !== null}
              className="text-end"
            >
              <Button
                className="my-2 me-2"
                onClick={() => {
                  if (path.length) {
                    loadChildHandler(
                      path[path.length - 1].locationIdentifier,
                      path[path.length - 1].locationName,
                      selectedReportInfo?.value,
                      path[path.length - 1].locationProperties,
                      selectedMdaLiteReport?.value
                    );
                  } else {
                    setSelectedMdaLiteReport(state => {
                      loadData(selectedReportInfo?.value, state?.value);
                      return state;
                    });
                  }
                }}
              >
                {t('reportPage.refreshData')}
              </Button>
              <Button
                className="my-2"
                onClick={() => setShowMap(!showMap)}
                aria-controls="expand-table"
                aria-expanded={showMap}
              >
                {showMap ? t('reportPage.hideMap') : t('reportPage.showMap')}
              </Button>
            </Col>
          </Row>
          {(reportType === ReportType.MDA_LITE_COVERAGE ||
            (reportType === ReportType.ONCHOCERCIASIS_SURVEY && reportLevel !== 'Structure')) && (
            <Row className="justify-content-center">
              <Col md={8} className="my-2 text-center">
                <label className="me-2">Report type: </label>
                {REPORT_TYPE.map(el => {
                  if (
                    (reportType === ReportType.MDA_LITE_COVERAGE &&
                      !(el.value === 'POPULATION_DISTRIBUTION') &&
                      selectedReportInfo?.value === 'SCH') ||
                    reportType === ReportType.ONCHOCERCIASIS_SURVEY
                  ) {
                    return (
                      <Form.Check
                        key={el.value}
                        defaultChecked={el.value === REPORT_TYPE[0].value}
                        onChange={_ => {
                          setSelectedMdaLiteReport(el);
                          setSelectedReportInfo(selectedReportInfo);
                          clearButtonRef.current.click();
                        }}
                        name="report-group"
                        inline
                        label={t('reportPage.' + el.name)}
                        type="radio"
                      />
                    );
                  }
                  return undefined;
                })}
              </Col>
            </Row>
          )}
          <div
            style={{
              maxHeight: showMap ? '50vh' : '90vh',
              overflow: 'auto'
            }}
          >
            <ReportsTable
              clickHandler={(locationId, locationName) =>
                loadChildHandler(
                  locationId,
                  locationName,
                  selectedReportInfo?.value,
                  undefined,
                  selectedMdaLiteReport?.value
                )
              }
              sortHandler={sortDataHandler}
              columns={columns}
              data={filterData}
              rangeDeterminer={matchReportBandLevelByValue}
            />
          </div>
        </>
      )}
      {filterData.length === 0 && <p className="lead text-center">{t('general.noDataFound')}</p>}
      <Row className="my-3 align-items-center">
        <Col md={showMap ? 10 : 2}>
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
                ref={clearButtonRef}
              />
            </div>
          </Collapse>
        </Col>
        <Col
          md={showMap ? 2 : 8}
          className="text-center"
          style={{ maxHeight: showMap ? '80vh' : 'auto', overflowY: 'auto' }}
        >
          {reportType === ReportType.IRS_FULL_COVERAGE &&
          filterData.length &&
          filterData[0].geographicLevel === 'structure' ? (
            <Card className="text-start p-3">
              <p className="mb-0 mt-3">
                <b>Spray coverage (Effectiveness)</b>
              </p>
              <small>
                Percent of structures sprayed over total - {irsOaProgressBar.completeStructuresPercent.toFixed(2)}%
              </small>
              <ProgressBar
                variant={showStatusColor(irsOaProgressBar.completeStructuresPercent)}
                max={100}
                now={irsOaProgressBar?.completeStructuresPercent}
              />
              <p className="mb-0 mt-3">
                <b>Found coverage (Found/Target)</b>
              </p>
              <small>
                Percent of structures found over total - {irsOaProgressBar.foundCoveragePercent.toFixed(2)}%
              </small>
              <ProgressBar
                variant={showStatusColor(irsOaProgressBar.foundCoveragePercent)}
                max={100}
                now={irsOaProgressBar?.foundCoveragePercent}
              />
              <p className="mb-0 mt-3">
                <b>Spray Coverage of Found(Sprayed/Found)</b>
              </p>
              <small>
                Percent of Spray Coverage of Found(Sprayed/Found) - {irsOaProgressBar.sprayCoveragePercent.toFixed(2)}%
              </small>
              <ProgressBar
                variant={showStatusColor(irsOaProgressBar.sprayCoveragePercent)}
                max={100}
                now={irsOaProgressBar?.sprayCoveragePercent}
              />
              <p className="mt-3 mb-0">
                <b>Reasons for not sprayed structures</b>
              </p>
              <p className="mb-0">{filterData.length} structures total</p>
              <p className="mb-1">
                {irsOaProgressBar?.notSprayedStructures} of {filterData.length} structures not sprayed
              </p>
              <ul className="list-group list-group-flush mt-2">
                {Array.from(mapNotSprayed()).map(key => {
                  return (
                    <li className="list-group-item mx-0 px-0" key={key[0]}>
                      {key[0] + ' - ' + key[1]}
                    </li>
                  );
                })}
              </ul>
            </Card>
          ) : (
            <>
              <Table className="text-center">
                <tbody>
                  {Object.keys(getReportDetails(reportType)).map(key => {
                    let obj = getReportDetails(reportType)[key];
                    return (
                      <tr className={obj.class}>
                        <td className="py-4">{t('reportPage.formattingRuleColors.' + obj.colorName)}</td>
                        <td className="py-4">{obj.min + '% - ' + obj.max + '%'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
              <p className="my-2">{t('reportPage.formattingRules')}</p>
            </>
          )}
        </Col>
      </Row>
      {showModal && currentFeature && <ReportModal showModal={openModalHandler} feature={currentFeature} />}
    </Container>
  );
};

export default Report;
