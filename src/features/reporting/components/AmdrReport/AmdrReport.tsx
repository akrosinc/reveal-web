import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import React, {ChangeEvent, useCallback, useEffect, useRef, useState} from 'react';
import {Button, Col, Collapse, Container, Form, Row,} from 'react-bootstrap';
import {useNavigate} from 'react-router-dom';
import {Column} from 'react-table';
import {toast} from 'react-toastify';

import ReportsTable from '../../../../components/Table/ReportsTable';

import {
  COLOR_BOOTSTRAP_DANGER, COLOR_BOOTSTRAP_SUCCESS, COLOR_YELLOW,
  KEY_INDICATOR_LEVELS
} from '../../../../constants';
import {useAppSelector} from '../../../../store/hooks';
import {getReportTypeInfo} from '../../api';
import {Feature, FeatureCollection, MultiPolygon, Point, Polygon} from '@turf/turf';
import {
  AdditionalReportInfo,
  FoundCoverage,
  ReportLocationProperties,
  ReportType
} from '../../providers/types';
import {useTranslation} from 'react-i18next';
import {SingleValue} from 'react-select';
import {getAmdrMapReportData} from "./index";
import {ChartData, ChartOptions, ChartType, LegendItem, ScatterDataPoint} from "chart.js";
import {Line, Bar} from "react-chartjs-2";

interface BreadcrumbModel {
  locationName: string;
  locationIdentifier: string;
  locationProperties: ReportLocationProperties | undefined;
}

const getReportDetails = () => {
  return KEY_INDICATOR_LEVELS['DEFAULT'];
};

const AmdrReport = () => {
  const [cols, setCols] = useState<{ [x: string]: FoundCoverage }>({});
  const [data, setData] = useState<ReportLocationProperties[]>([]);
  const [filterData, setFilterData] = useState<ReportLocationProperties[]>([]);
  const navigate = useNavigate();
  const [path, setPath] = useState<BreadcrumbModel[]>([]);

  const [showMap, setShowMap] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [columnClickable, setColumnClickable] = useState<boolean>();
  const searchInput = useRef<HTMLInputElement>(null);
  const {t} = useTranslation();
  const isDarkMode = useAppSelector(state => state.darkMode.value);
  const [reportInfo, setReportInfo] = useState<AdditionalReportInfo>();
  const [parentLocationId, setParentLocationId] = useState<string>();
  const [selectedReportInfo, setSelectedReportInfo] = useState<SingleValue<{
    label: string;
    value: string;
  }>>();
  const clearButtonRef = useRef<any>(null);
  const [clickedColumn, setClickedColumn] = useState<string>();
  const [dashboardView, setDashboardView] = useState<'haplotype'|'gene'>('haplotype');
  const [graphData, setGraphData] = useState<ChartData<'line'>>()

  const [graphDataMap, setGraphDataMap] = useState<{[key:string]:ChartData<'line'>}>()
  const [combinedGraphData, setCombinedGraphData] = useState<ChartData<'line' | 'bar'>>();
  const [chartType, setChartType] = useState<ChartType>('line');

  const [graphOptions, setGraphOptions] = useState<ChartOptions<'line' | 'bar'>>()
  const [showGraphs, setShowGraphs] = useState<boolean>(false);
  //Using useRef as a workaround for Mapbox issue that onClick event does not see state hooks changes
  const doubleClickHandler = (feature: Feature<Polygon | MultiPolygon, ReportLocationProperties>, clickedColumn?: string) => {
    loadChildHandler(
        feature.id as string,
        feature.properties.name,
        selectedReportInfo?.value,
        undefined,
        clickedColumn
    );
  };
  const KEY_INDICATOR_LEVELS: {}=
    //Add new entry here for customization
     {
      DANGER: {
        colorName: 'red',
        min: 0,
        max: 65,
        class: 'bg-danger',
        color: COLOR_BOOTSTRAP_DANGER,
        highest: false
      },
      GOOD: {
        colorName: 'yellow',
        min: 65,
        max: 80,
        class: 'bg-yellow',
        color: COLOR_YELLOW,
        highest: false
      },
      EXCELLENT: {
        colorName: 'green',
        min: 80,
        max: 100,
        class: 'bg-success',
        color: COLOR_BOOTSTRAP_SUCCESS,
        highest: true
      }
    };

  const handleDobuleClickRef = useRef(doubleClickHandler);
  handleDobuleClickRef.current = doubleClickHandler;

  //Dynamic function to map columns depending on server response
  const mapColumns = (rowColumns: { [x: string]: FoundCoverage }): Column[] => {
    return Object.entries(rowColumns)
    .filter(rc => rc[1] && !rc[1].isHidden)
    // .map(e => e[0])
    .map(e=> {
      return {
        Header: e[0],
        desc:e[1].description,
        accessor: (row: any) => {
          return row.columnDataMap[e[0]].value;
        }
      };
    });
  };

  const columns = React.useMemo<Column[]>(() => {
    return [{Header: 'Name', accessor: 'name', id: 'locationName'}
      , ...mapColumns(cols)];


  }, [cols]);

  useEffect(() => {
    if (showGraphs) {
      let graphOptions: ChartOptions<'line'> = {
        responsive: true,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              // filter: (legendItem: LegendItem, chart: ChartData<'line'>) => {
              //
              //   return legendItem.datasetIndex < 2;
              // },
              boxWidth: 10,
              boxHeight: 2
            },

          },

        },

        maintainAspectRatio: false
      };
      setGraphOptions(graphOptions)
    }
  }, [showGraphs])

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

  const loadData = useCallback(
      (selectedReport?: string, type?: string) => {
        getReportTypeInfo('AMDR').then(res => {
          setColumnClickable(res.columnClickable);
          setShowGraphs(res.showGraphs);
          if (res.dashboardFilter && res.dashboardFilter.ntd && selectedReport === undefined) {
            setReportInfo(res);
            if (selectedReport === undefined) {
              setSelectedReportInfo({
                label: res.dashboardFilter.ntd,
                value: res.dashboardFilter.ntd
              });
            }
          }


            getAmdrMapReportData(
                parentLocationId ? parentLocationId : null,
                clickedColumn
            )
          .then(async (report) => {
            if (report.features.length) {
              //map location data to show it in a table also
              const tableData = report.features.map(el => el.properties);
              //check if there is a default column set
              //casting to any because using custom geoJSON object
              const defaultDisplayColumn: string | undefined = (report as any).defaultDisplayColumn;
              if (defaultDisplayColumn) {
                report.features.forEach(el => {
                  el.properties.defaultColumnValue = el.properties.columnDataMap[defaultDisplayColumn].value;
                });
              }

              setFilterData([]);
              setCols(report.features[0].properties.columnDataMap);
              setData(tableData);
              setFilterData(tableData);

            }
            else if (report.noLocationData){
              toast.info('no location data found.');
            } else if (report.noDashboardData){
              toast.info('no data for selected location.')
            }
            else {
              toast.error('There is no report data found.');
            }
          })
          .catch(err => {
            toast.error(err);
          });
        });

      },
      [ parentLocationId, clickedColumn]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadChildHandler = (
      id: string,
      locationName: string,
      selectedReportInfo?: string,
      parentData?: ReportLocationProperties,
      clickedColumn?: string
  ) => {
    // setParentLocationId(id);
    // setClickedColumn(undefined);

    getAmdrMapReportData(
        id,
        clickedColumn
    )
    .then(res => {
      const parentProperties = filterData.find(el => el.id === id) ?? parentData;
      //reset search input on new load
      if (searchInput.current) searchInput.current.value = '';
      //mapping location properties to data usable for table view
      if (res.features && res.features.length > 0){
        const tableData = res.features
        .filter(
            (feature: any) =>
                feature != null &&
                feature.properties != null &&
                feature.properties.businessStatus !== null &&
                feature.properties.businessStatus !== 'No State'
        )
        .map(el => el.properties);
        //casting to any because of using custom geoJSON object
        const defaultDisplayColumn: string | undefined = res.defaultDisplayColumn;

        // if (res.features && tableData.length) {
          //first set data to empty array for new columns to render
          setFilterData([]);
          //check if there is a default column set and add default column property
          if (defaultDisplayColumn) {
            res.features.forEach(el => {
              if (el.properties.columnDataMap[defaultDisplayColumn]) {
                el.properties.defaultColumnValue = el.properties.columnDataMap[defaultDisplayColumn].value;
              }
            });
          }
          setCols(res.features[0].properties.columnDataMap);
          setData(tableData);

          setFilterData(tableData);
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
      // }

        // in case of irs report type and structure geo level calculate progress bar data
      } else if (res.noLocationData) {
        toast.info(`${locationName} has no child locations.`);
      } else  if (res.noDashboardData){
        toast.info('no data for selected location.')
      }
      else {
        toast.error('There is no report data found.');
      }
    })
    // .catch(err => {
    //   toast.error(err.toString());
    // });

  };

  const breadCrumbClickHandler = (el: BreadcrumbModel, index: number) => {

    setPath(path);
    setParentLocationId(el.locationIdentifier);
    setClickedColumn(undefined);


    getAmdrMapReportData(
        el.locationIdentifier,
        clickedColumn
    )
    .then(res => {
      //reset search input on new load
      if (searchInput.current) searchInput.current.value = '';
      setData([]);
      setFilterData([]);

      if (res.features.length) {
        const tableData = res.features.map(el => el.properties);
        const defaultDisplayColumn: string | undefined = (res as any).defaultDisplayColumn;
        if (defaultDisplayColumn) {
          res.features.forEach(el => {
            el.properties.defaultColumnValue = el.properties.columnDataMap[defaultDisplayColumn].value;
          });
        }
        setCols(res.features[0].properties.columnDataMap);
        setData(tableData);
        setFilterData(tableData);
        //if its the same object as before we need to make a new copy of an object otherwise rerender won't happen
        //its enough to spread the object so rerender will be triggered
      }
    })
    .catch(err => {
      toast.error(err);
    });

  };

  const columnClickHandler = useCallback((clickedColumn?: string) => {
    setClickedColumn(clickedColumn);
  }, []);

  // useEffect(()=>{
  //
  //   let graphDataMap:{[key:string]:ChartData<'line'>} = {}
  //
  //   let lineCharts:{[theKey:string ]:{x:string; y:(number|ScatterDataPoint|null)}[]}= {};
  //
  //   if (data[0] && data[0].columnDataMap) {
  //     Object.keys(data[0].columnDataMap).map(key => {
  //       lineCharts[data[0].columnDataMap[key].description] = data.map(location => {
  //         return {
  //           x: location.name,
  //           y: +location.columnDataMap[key].value
  //         }
  //       })
  //
  //       console.log("lineCharts[key]: ",lineCharts[key])
  //       let graphData:ChartData<'line'> = {
  //         labels: lineCharts[data[0].columnDataMap[key].description].map(xy=>xy.x),
  //         datasets: [{
  //              label: data[0].columnDataMap[key].description,
  //             data: lineCharts[data[0].columnDataMap[key].description].map(xy=>xy.y), // Y-axis data
  //             fill: true,
  //             pointStyle: 'dash',
  //             borderColor: 'rgb(75, 192, 192)',
  //             tension: 0,
  //           }]}
  //       graphDataMap[data[0].columnDataMap[key].description] = graphData
  //     })
  //
  //   }
  //   setGraphDataMap(graphDataMap);
  //   console.log("lineCharts",graphDataMap)
  // },[data])
  function getDistinctColor(index: number, total: number): string {
    const hue = Math.floor((360 / total) * index);
    return `hsl(${hue}, 70%, 50%)`;
  }
  function getLineColor(label: string): string {
    const chars = Array.from(label); // safe for any string
    const hash = chars.reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 50%)`;
  }

  useEffect(() => {
    if (!data || !data.length || !data[0].columnDataMap) return;

    const columnKeys = Object.keys(data[0].columnDataMap);
    const xAxisLabels = data.map(loc => loc.name);
    const allLineDatasets: ChartData<'line'>['datasets'] = [];

    columnKeys.forEach((colKey, index) => {
      const columnDescription = data[0].columnDataMap[colKey].description;
      const yValues = data.map(loc => Number(loc.columnDataMap[colKey].value));

      allLineDatasets.push({
        label: columnDescription,
        data: yValues,
        fill: false,
        borderColor: getDistinctColor(index, columnKeys.length),
        backgroundColor: getDistinctColor(index, columnKeys.length), // for bar chart
        tension: 0
      });
    });

    const combinedChartData: ChartData<'line' | 'bar'> = {
      labels: xAxisLabels,
      datasets: allLineDatasets
    };

    setCombinedGraphData(combinedChartData);

    // Decide chart type
    if (xAxisLabels.length === 1) {
      setChartType('bar'); // only one X value → bar chart
    } else {
      setChartType('line');
    }

  }, [data]);

  useEffect(()=>{
    if (clickedColumn){
      setDashboardView('gene')
    }
    loadData();
  },[clickedColumn])

  return (
      <Container fluid className="my-4 px-2">
        <Row className="mt-3 align-items-center">
          <Col md={3}>

          </Col>
          <Col md={6} className="text-center">
            <h2 className="m-0">
              {dashboardView==='haplotype'?'Haplotype View':'Gene View'} ({"AMDR"})
            </h2>
          </Col>
        </Row>
        <hr/>
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
               /
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
              {showGrid ? <FontAwesomeIcon icon="chevron-up"/> :
                  <FontAwesomeIcon icon="chevron-down"/>}
            </Button>
          </Col>
        </Row>
        {showGrid && (
            <>
              <Row className="mt-3 mb-2 align-items-center">
                <Col
                    md={reportInfo && reportInfo.dashboardFilter !== null && reportInfo.dashboardFilter.ntd ? 3 : 6}>
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
                              clickedColumn
                          );
                        }
                      }}
                  >
                    {t('reportPage.refreshData')}
                  </Button>

                  {dashboardView === 'gene' && <Button
                      className="my-2"
                      onClick={() => {
                        setDashboardView('haplotype')
                        setClickedColumn(undefined)
                      }}
                  >
                    {'Back to Haplotype View'}
                  </Button>}

                </Col>
              </Row>

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
                            clickedColumn
                        )
                    }
                    sortHandler={sortDataHandler}
                    columns={columns}
                    data={filterData}
                    rangeDeterminer={(_)=>{return {class:''}}}
                    columnClickable={columnClickable}
                    columnClickHandler={columnClickHandler}
                />
              </div>
            </>
        )}
        {filterData.length === 0 && <p className="lead text-center">{t('general.noDataFound')}</p>}
        {showGraphs && combinedGraphData ? <Row className="my-3 align-items-center">
          <Col md={showMap ? 10 : 2}>
            <Collapse in={showMap}>
              <div style={{
                display: 'flex',
                gap: '16px',            // optional spacing between charts
                padding: '16px',        // optional padding
                height: "400px", width: "100%"
              }}
                   className="mp-2 mx-2">
                {combinedGraphData && chartType === 'line' && (
                    <Line data={combinedGraphData as ChartData<'line'>} options={graphOptions} />
                )}

                {combinedGraphData && chartType === 'bar' && (
                    <Bar data={combinedGraphData as ChartData<'bar'>} options={graphOptions} />
                )}
              </div>
            </Collapse>
          </Col>
        </Row> : ""}
      </Container>
  );
};

export default AmdrReport;
