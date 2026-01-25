import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import React, {ChangeEvent, useCallback, useEffect, useRef, useState} from 'react';
import {Button, Col, Collapse, Container, Form, Row,} from 'react-bootstrap';
import {useNavigate} from 'react-router-dom';
import {Column} from 'react-table';
import {toast} from 'react-toastify';
import ReportsTable from '../../../../components/Table/ReportsTable';

import {
  COLOR_BOOTSTRAP_DANGER,
  COLOR_BOOTSTRAP_SUCCESS,
  COLOR_YELLOW,
  KEY_INDICATOR_LEVELS
} from '../../../../constants';
import {useAppSelector} from '../../../../store/hooks';
import {getReportTypeInfo} from '../../api';
import {Coord, Feature, FeatureCollection, MultiPolygon, Point, Polygon} from '@turf/turf';
import {
  Coord as ThreeCoord,
  CoordsByYearOrLocation,
  CoordsByYearOrLocationWithTicks, FeatureSetResponse
} from './types';
import {
  AdditionalReportInfo,
  FoundCoverage,
  HslColor,
  ReportLocationProperties
} from '../../providers/types';
import {useTranslation} from 'react-i18next';
import Select, {SingleValue} from 'react-select';
import {getAmdrMapReportData} from "./index";
import {ChartData, ChartOptions, ChartType} from "chart.js";
import {Bar, Line} from "react-chartjs-2";
import RibbonPlot, {Coords, LayoutObj, RibbonData} from "./RibbonPlot";
import MapViewDetail from "../report/mapView/MapViewDetail";
import AmdrMapViewDetail from "../report/mapView/amdr/AmdrMapViewDetail";


interface BreadcrumbModel {
  locationName: string;
  locationIdentifier: string;
  locationProperties: ReportLocationProperties | undefined;
}


type OptionType = {
  label: string; value: string
}

const locationOrYearOptions = ['coordsByTypeAndLocation', 'coordsByTypeAndYear'] as const;

const AmdrReport = () => {
  const [cols, setCols] = useState<{ [x: string]: FoundCoverage }>({});
  const [data, setData] = useState<ReportLocationProperties[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [selectedHslColor, setSelectedHslColor] = useState<HslColor | undefined>();
  const [three, setThree] = useState<CoordsByYearOrLocationWithTicks>();

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
  const [dashboardView, setDashboardView] = useState<'haplotype' | 'gene'>('haplotype');
  const [graphData, setGraphData] = useState<ChartData<'line'>>()

  const [graphDataMap, setGraphDataMap] = useState<{ [key: string]: ChartData<'line'> }>()
  const [combinedGraphData, setCombinedGraphData] = useState<ChartData<'line' | 'bar'>>();
  // const [columnDescriptions, setColumnDescriptions] = useState<{key: string, value:string}[]>([]);

  const [chartType, setChartType] = useState<ChartType>('line');

  const [graphOptions, setGraphOptions] = useState<ChartOptions<'line' | 'bar'>>()
  const [showGraphs, setShowGraphs] = useState<boolean>(false);
  const [show3dGraphs, setShow3dGraphs] = useState<boolean>(false);
  const [coords, setCoords] = useState<Coords[]>([]);
  const [ribbonData, setRibbonData] = useState<RibbonData>();
  const [plotSelector, setPlotSelector] = useState<string>();
  const [plotSelectedOption, setPlotSelectedOption] = useState<OptionType | null>(null);
  const [locationOrYear, setLocationOrYear] = useState<string>('coordsByTypeAndLocation')

  const [defaultDisplayColumn, setDefaultDisplayColumn] = useState('');
  const [currentFeature, setCurrentFeature] =
      useState<Feature<Polygon | MultiPolygon | Point, ReportLocationProperties>>();
  const [showModal, setShowModal] = useState(false);
  const [featureSet, setFeatureSet] =
      useState<[
        location: FeatureCollection<Polygon | MultiPolygon | Point, ReportLocationProperties>,
        parentId: string,
        path: string[]
      ]>();
  const [featureSetResponse, setFeatureSetResponse] = useState<FeatureSetResponse>();

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

  const clearMap = useCallback(
      (filter?: string) => {
        //clear all map data and return to root element on the grid

      }, []
  );

  const KEY_INDICATOR_LEVELS: {} =
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
    .map(e => {
      return {
        Header: e[0],
        desc: e[1].description,
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

  const openModalHandler = (show: boolean, feature?: Feature<Polygon | MultiPolygon, ReportLocationProperties>) => {
    if (feature) setCurrentFeature(feature);
    setShowModal(show);
  };


  useEffect(() => {
    if (showGraphs) {
      let graphOptions: ChartOptions<'line'> = {
        responsive: true,
        plugins: {
          legend: {
            position: 'right',
            labels: {

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
          setShow3dGraphs(res.show3dGraphs);
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
              setThree(report.coords);

              setFeatureSetResponse(report);


            } else if (report.noLocationData) {
              toast.info('no location data found.');
            } else if (report.noDashboardData) {
              toast.info('no data for selected location.')
            } else {
              toast.error('There is no report data found.');
            }
          })
          .catch(err => {
            toast.error(err);
          });
        });

      },
      [parentLocationId, clickedColumn]
  );

  useEffect(()=>{
    if (featureSetResponse && plotSelector && selectedHslColor){

      let locIds: Record<string, number> = {};

      featureSetResponse.features.map(feature => {
        let value = feature.properties.columnDataMap[plotSelector].value;
        locIds[feature.identifier] = value
      })
      let values:number[] = []
      Object.keys(locIds).map(locId => {
        values.push(Number(locIds[locId]))
      })
      const minValue = Math.min(...values);
      const maxValue = Math.max(...values);

      const locPercentages: Record<string, number> = {};
      Object.keys(locIds).forEach((locId, index) => {
        if (maxValue === minValue) {
          locPercentages[locId] = 100;
        } else {
          locPercentages[locId] = ((Number(locIds[locId]) - minValue) / (maxValue - minValue)) * 100;
        }
      });


      const features: Feature<Polygon | MultiPolygon | Point, ReportLocationProperties>[] =
          featureSetResponse.features.map(feature => {

            const color = `hsl(${selectedHslColor.h}, ${ locIds[feature.identifier] }%, ${50}%)`;

            const properties: ReportLocationProperties = {
              ...feature.properties,            // new object
              evaluatedColor: color ?? feature.properties.evaluatedColor
            };

            return {
              type: "Feature",
              id: feature.id,
              properties,
              geometry: feature.geometry ?? null
            };
          });

      const reportCollection: FeatureCollection<Polygon | MultiPolygon | Point, ReportLocationProperties> = {
        type: "FeatureCollection",
        features // already a new array
      };

      setFeatureSet([reportCollection, parentLocationId?parentLocationId:'main', []]);
    }
  },[featureSetResponse, selectedColor, parentLocationId, plotSelector, selectedHslColor])

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    console.log("three", three)

    if (three && three.coordsByYearOrLocation && three.coordsByYearOrLocation[locationOrYear] && plotSelector) {
      if (plotSelector && three.coordsByYearOrLocation[locationOrYear][plotSelector]) {

        let locationMap = three.coordsByYearOrLocation[locationOrYear][plotSelector];

        let coords: Coords[] = Object.keys(locationMap).map(location => {
          let xAxis = locationMap[location].x;
          let yAxis = locationMap[location].y;
          let zAxis = locationMap[location].z;

          let coord: Coords = {x: xAxis, y: yAxis, z: zAxis, name: locationMap[location].name};
          return coord
        })


        let lineWidth: number | undefined;

        let isVertical = false;
        if (data.length == 1) {
          lineWidth = 10;
          isVertical = true;
        }

        setCoords(coords)

        let ticks = coords[0];
        let xTickValues = ticks.x.map((year, yearNum) => {
          return yearNum
        })

        let xTickNames = ticks.x.map((year, yearNum) => {
          return year.toString();
        })

        let yTickValues = ticks.y.map((year, yearNum) => {
          return yearNum
        })

        let yTickNames = ticks.y.map((year, yearNum) => {
          return year.toString();
        })

        let layout: LayoutObj = {
          xTickvals: three.xtickValues,
          xTickNames: three.xtickNames,
          yTickvals: three.ytickValues,
          yTickNames: three.ytickNames,
          lineWidth: lineWidth,
          isVertical: isVertical
        }

        let ribbonData: RibbonData = {coords: coords, layout: layout, title: 'som'}

        setRibbonData(ribbonData)
      }
    }

  }, [three, plotSelector, locationOrYear])

  const loadChildHandler = (
      id: string,
      locationName: string,
      selectedReportInfo?: string,
      parentData?: ReportLocationProperties,
      clickedColumn?: string
  ) => {
    setPlotSelector(undefined)
    setPlotSelectedOption(null)
    setSelectedHslColor(undefined)
    setSelectedColor(undefined)
    setParentLocationId(id);
    getAmdrMapReportData(
        id,
        clickedColumn
    )
    .then(res => {
      const parentProperties = filterData.find(el => el.id === id) ?? parentData;
      //reset search input on new load
      if (searchInput.current) searchInput.current.value = '';
      //mapping location properties to data usable for table view
      if (res.features && res.features.length > 0) {
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
          setDefaultDisplayColumn(defaultDisplayColumn);
          res.features.forEach(el => {
            if (el.properties.columnDataMap[defaultDisplayColumn]) {
              el.properties.defaultColumnValue = el.properties.columnDataMap[defaultDisplayColumn].value;
            }
          });
        } else {
          setDefaultDisplayColumn('');
        }
        setCols(res.features[0].properties.columnDataMap);
        setData(tableData);

        const features: Feature<Polygon | MultiPolygon | Point,
            ReportLocationProperties>[] = res.features.map(feature => ({
          type: "Feature",
          id: feature.id,
          properties: feature.properties,
          geometry: feature.geometry ?? null   // 👈 must never be undefined
        }));

        const reportCollection: FeatureCollection<Polygon | MultiPolygon | Point,
            ReportLocationProperties> = {
          type: "FeatureCollection",
          features
        };


        setFeatureSet([reportCollection, id, path.map(el => el.locationIdentifier)]);
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
      } else if (res.noDashboardData) {
        toast.info('no data for selected location.')
      } else {
        toast.error('There is no report data found.');
      }
    })
    // .catch(err => {
    //   toast.error(err.toString());
    // });

  };

  const breadCrumbClickHandler = (el: BreadcrumbModel, index: number) => {
    const locationsToDelete = path.splice(index + 1);
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
      setFilterData([]);

      if (res.features.length) {
        const tableData = res.features.map(el => el.properties);

        const defaultDisplayColumn: string | undefined = res.defaultDisplayColumn;
        if (defaultDisplayColumn) {
          res.features.forEach(el => {
            el.properties.defaultColumnValue = el.properties.columnDataMap[defaultDisplayColumn].value;
          });
          setDefaultDisplayColumn(defaultDisplayColumn);
        } else {
          setDefaultDisplayColumn('');
        }

        setCols(res.features[0].properties.columnDataMap);
        setData(tableData);
        setFilterData(tableData);
        const features: Feature<Polygon | MultiPolygon | Point,
            ReportLocationProperties>[] = res.features.map(feature => ({
          type: "Feature",
          id: feature.id,
          properties: feature.properties,
          geometry: feature.geometry ?? null   // 👈 must never be undefined
        }));

        const reportCollection: FeatureCollection<Polygon | MultiPolygon | Point,
            ReportLocationProperties> = {
          type: "FeatureCollection",
          features
        };


        setFeatureSet([{...reportCollection}, el.locationIdentifier, locationsToDelete.map(loc => loc.locationIdentifier)]);
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


  function getDistinctColor(index: number, total: number): string {
    const hue = Math.floor((360 / total) * index);
    return `hsl(${hue}, 70%, 50%)`;
  }


  function getDistinctHslColor(hslColor?: HslColor): string {
    if (hslColor) {
      return `hsl(${hslColor.h}, ${hslColor.s}%, ${hslColor.l}%)`;
    } else {
      return `hst(120,60%,45%)`
    }

  }


  function getLineColor(label: string): string {
    const chars = Array.from(label); // safe for any string
    const hash = chars.reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 50%)`;
  }


  const checkAndRemoveAndAddPerc = (str: string) => {
    if (str.includes("%")) {
      str = str.replaceAll("%", "")
      return Number(str)
    } else {
      return Number(str)
    }
  }

  useEffect(() => {
    if (!data || !data.length || !data[0].columnDataMap) return;

    const columnKeys = Object.keys(data[0].columnDataMap);
    const xAxisLabels = data.map(loc => loc.name);
    const allLineDatasets: ChartData<'line'>['datasets'] = [];


    columnKeys.forEach((colKey, index) => {
      const columnDescription = data[0].columnDataMap[colKey].description;
      const hslColor = data[0].columnDataMap[colKey].hslColor;
      const yValues = data.map(loc => {
        return loc.columnDataMap[colKey].value.toString().split(" ").length > 1 ?
            checkAndRemoveAndAddPerc(loc.columnDataMap[colKey].value.split(" ")[0]) : Number(loc.columnDataMap[colKey].value)
      });

      allLineDatasets.push({
        label: columnDescription,
        data: yValues,
        fill: false,
        borderColor: getDistinctHslColor(hslColor),
        backgroundColor: getDistinctHslColor(hslColor), // for bar chart
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

  }, [
    data
  ]);

  useEffect(() => {
    if (clickedColumn) {
      setDashboardView('gene')
    }
    loadData();
  }, [clickedColumn])

  // useEffect(() => {
  //   if (!plotSelector || !data) return;
  //
  //   setFeatureSet(prev => {
  //     if (!prev) return prev; // now legal
  //
  //     const [collection, parentId, path] = prev;
  //
  //     const updatedFeatures = collection.features.map(feature => {
  //       const columnData =
  //           feature.properties.columnDataMap?.[plotSelector];
  //
  //       const evaluatedColor =
  //           columnData?.hslColor ??
  //           feature.properties.statusColor ??
  //           feature.properties.evaluatedColor;
  //
  //       return {
  //         ...feature,
  //         properties: {
  //           ...feature.properties,
  //           evaluatedColor
  //         }
  //       };
  //     });
  //
  //     return [
  //       {
  //         ...collection,
  //         features: updatedFeatures
  //       },
  //       parentId,
  //       path
  //     ];
  //   });
  // }, [plotSelector, data]);

  useEffect(() => {
    setPlotSelector(undefined)
    setPlotSelectedOption(null)
  }, [clickedColumn])


  return (
      <Container fluid className="my-4 px-2">
        <Row className="mt-3 align-items-center">
          <Col md={3}>

          </Col>
          <Col md={6} className="text-center">
            <h2 className="m-0">
              {dashboardView === 'haplotype' ? 'Drug View' : 'Gene View'} ({"AMDR"})
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
                    {'Back to Drug View'}
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
                    rangeDeterminer={(_) => {
                      return {class: ''}
                    }}
                    columnClickable={columnClickable}
                    columnClickHandler={columnClickHandler}
                />
              </div>
            </>
        )}
        {filterData.length === 0 && <p className="lead text-center">{t('general.noDataFound')}</p>}
        {showGraphs && combinedGraphData ? <><Row className="my-3 align-items-center">
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
                    <Line data={combinedGraphData as ChartData<'line'>} options={graphOptions}/>
                )}

                {combinedGraphData && chartType === 'bar' && (
                    <Bar data={combinedGraphData as ChartData<'bar'>} options={graphOptions}/>
                )}
              </div>

            </Collapse>
          </Col>
        </Row>
          {show3dGraphs &&
              <Row>
                <Col xs sm md={10}
                     className="border pe-3 d-flex justify-content-center align-items-center">
                  {plotSelector && ribbonData ?
                      <RibbonPlot data={ribbonData}/> :
                      <span>Select {dashboardView == "haplotype" ? "Drug" : "Gene"} to view data</span>}

                </Col>
                <Col xs sm md={2}>
                  <h5 className="mb-2">Select {dashboardView == "haplotype" ? "Drug" : "Gene"}</h5>
                  <Select
                      placeholder={'Select data to display' + '...'}
                      options={Object.keys(data[0].columnDataMap).map(el => {
                        return {
                          label: data[0].columnDataMap[el].description,
                          value: el ?? ''
                        };
                      })}
                      value={plotSelectedOption}
                      onChange={(e: SingleValue<OptionType>) => {
                        setPlotSelectedOption(e)
                        if (e) {
                          setPlotSelector(e?.value);
                        }
                      }}
                  />
                  <Select
                      placeholder={'Select Direction...'}
                      options={locationOrYearOptions.map(el => ({
                        label: el.toString(),
                        value: el
                      }))}
                      value={locationOrYearOptions
                      .map(el => ({
                        label: el.toString(),
                        value: el
                      }))
                      .find(o => o.value === locationOrYear)}
                      onChange={(e: SingleValue<{
                        label: string;
                        value: string;
                      }>) => {
                        if (e?.value) {
                          setLocationOrYear(e.value);
                        }
                      }}
                  />
                </Col>
              </Row>}
          {showMap && <Row className="my-3 align-items-center">
            <Col md={showMap ? 10 : 2}>
              <Collapse in={showMap}>
                <div id="expand-table">
                  <AmdrMapViewDetail
                      defaultColumn={defaultDisplayColumn}
                      showModal={openModalHandler}
                      doubleClickEvent={(feature: Feature<Polygon | MultiPolygon, ReportLocationProperties>) =>
                          handleDobuleClickRef.current(feature)
                      }
                      featureSet={featureSet}
                      clearMap={clearMap}
                      ref={clearButtonRef}
                  /></div>
              </Collapse>
            </Col>
            <Col>
              <Select
                  placeholder="Select data to display..."
                  options={Object.keys(data[0].columnDataMap).map(el => ({
                    value: el ?? "",
                    label: data[0].columnDataMap[el].description
                  }))}
                  formatOptionLabel={(option) => {
                    const column = data[0].columnDataMap[option.value];
                    const color = `hsl(${column.hslColor?.h}, ${column.hslColor?.s}%, ${column.hslColor?.l}%)`;

                    return (
                        <div style={{display: "flex", alignItems: "center", gap: 8}}>
                            <span
                                style={{
                                  width: 10,
                                  height: 10,
                                  backgroundColor: color,
                                  display: "inline-block",
                                  borderRadius: 2,
                                  flexShrink: 0
                                }}
                            />
                             <span style={{whiteSpace: "normal"}}>
                              {option.label}
                            </span>
                        </div>
                    );
                  }}
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: 48,          // ⬆️ taller select
                      height: "auto"
                    }),
                    valueContainer: (base) => ({
                      ...base,
                      paddingTop: 6,
                      paddingBottom: 6
                    }),
                    singleValue: (base) => ({
                      ...base,
                      whiteSpace: "normal",   // ⬅️ allow wrapping
                      overflow: "visible"
                    }),
                    option: (base) => ({
                      ...base,
                      whiteSpace: "normal"    // ⬅️ wrap in dropdown too
                    })
                  }}
                  value={plotSelectedOption}
                  onChange={(e: SingleValue<OptionType>) => {

                    if (e) {
                      setPlotSelectedOption(e);
                      const column = data[0].columnDataMap[e.value];
                      const color = `hsl(${column.hslColor?.h}, ${column.hslColor?.s}%, ${column.hslColor?.l}%)`;
                      setSelectedColor(color);
                      setSelectedHslColor(column.hslColor)
                      setPlotSelector(e.value);
                    }
                  }}
              />
            </Col>
          </Row>}


        </> : ""}


      </Container>
  );
};

export default AmdrReport;
