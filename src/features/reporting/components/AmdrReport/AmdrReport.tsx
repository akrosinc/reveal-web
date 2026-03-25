import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import React, {ChangeEvent, useCallback, useEffect, useRef, useState} from 'react';
import {Button, Col, Collapse, Container, Form, Row,} from 'react-bootstrap';
import {useNavigate} from 'react-router-dom';
import {Column} from 'react-table';
import {toast} from 'react-toastify';
import ReportsTable from '../../../../components/Table/ReportsTable';
import {useAppSelector} from '../../../../store/hooks';
import {getReportTypeInfo} from '../../api';
import {Feature, FeatureCollection, MultiPolygon, Point, Polygon} from '@turf/turf';
import {FeatureSetResponse, GeneStats, HaploData, HaploGeneMap} from './types';
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
import {Bar, Pie} from "react-chartjs-2";
import {Coords, RibbonData} from "./RibbonPlot";
import AmdrMapViewDetail from "../report/mapView/amdr/AmdrMapViewDetail";
import {getAmdrColumns} from "../../../AmdrImport/api";
import {AmdrColumnType, HeaderName} from "../../../AmdrImport/type";

interface BreadcrumbModel {
  locationName: string;
  locationIdentifier: string;
  locationProperties: ReportLocationProperties | undefined;
}


type OptionType = {
  label: string; value: string
}
type HeaderButton = {
  headerName: HeaderName;
  id: string;
}


const locationOrYearOptions = ['coordsByTypeAndLocation', 'coordsByTypeAndYear'] as const;

const AmdrReport = () => {
  const [cols, setCols] = useState<{ [x: string]: FoundCoverage }>({});
  const [data, setData] = useState<ReportLocationProperties[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [selectedHslColor, setSelectedHslColor] = useState<HslColor | undefined>();

  const [filterData, setFilterData] = useState<ReportLocationProperties[]>([]);
  const [hslColorMap, setHslColorMap] = useState<{ [key:string]:HslColor }>();
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
  const [dashboardView, setDashboardView] = useState<AmdrColumnType.DRUG | AmdrColumnType.HAPLOTYPE>(AmdrColumnType.HAPLOTYPE);
  const [graphData, setGraphData] = useState<ChartData<'line'>>()

  const [graphDataMap, setGraphDataMap] = useState<{ [key: string]: ChartData<'line'> }>()
  const [combinedGraphData, setCombinedGraphData] = useState<ChartData<'line' | 'bar'>>();
  const [combinedPieGraphData, setCombinedPieGraphData] = useState<{[key:string]:ChartData<'pie'>}>();
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
  const [haploData, setHaploData] = useState<HaploData>();
  const [headerButtons, setHeaderButtons] = useState<Record<AmdrColumnType, { [id: string]: HeaderName }>>();
  const [selectedHeaderButtons, setSelectedHeaderButtons] = useState<HeaderButton[]>([]);
  //Using useRef as a workaround for Mapbox issue that onClick event does not see state hooks changes
  const doubleClickHandler = (feature: Feature<Polygon | MultiPolygon, ReportLocationProperties>, dashboardView: AmdrColumnType.DRUG | AmdrColumnType.HAPLOTYPE) => {
    loadChildHandler(
        feature.id as string,
        feature.properties.name,
        dashboardView,
        selectedReportInfo?.value,
        undefined
    );
  };

  const clearMap = useCallback(
      (filter?: string) => {
        //clear all map data and return to root element on the grid

      }, []
  );


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


  const toggleSelectedHeaderButton = useCallback(
      (selectedHeaderButton: HeaderButton) => {
        setSelectedHeaderButtons(prev => {
          const isSelected = prev.some(btn => btn.id === selectedHeaderButton.id);

          // If already selected → remove it
          if (isSelected) {
            return prev.filter(btn => btn.id !== selectedHeaderButton.id);
          }

          // If haplotype → only allow 1 selected
          if (dashboardView === AmdrColumnType.HAPLOTYPE) {
            return [selectedHeaderButton]; // replace with only this button
          }

          // Normal behavior: add to list
          const newList = [...prev, selectedHeaderButton];

          return newList;
        });
      },
      [dashboardView]
  );


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
            display: false,
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

  useEffect(() => {
    const loadColumns = async () => {
      try {
        const cols = await getAmdrColumns();
        setHeaderButtons(cols);
      } catch (err) {
        console.error("Failed to load AMDR columns", err);
      }
    };

    loadColumns();
  }, []);

  useEffect(() => {
    getReportTypeInfo('AMDR').then(res => {
      setColumnClickable(res.columnClickable);
      setShowGraphs(res.showGraphs);
      setShow3dGraphs(res.show3dGraphs);

      if (res.dashboardFilter?.ntd) {
        setReportInfo(res);
      }
    });
  }, []);

  useEffect(() => {
    getAmdrMapReportData(
        parentLocationId ?? null,
        dashboardView
    )
    .then(report => {
      if (!report.features.length) return;

      const tableData = report.features.map(el => el.properties);

      setData(tableData);
      setFeatureSetResponse(report);
      setHaploData(report.markers);

    })
    .catch(err => toast.error(err));

  }, [parentLocationId, dashboardView]);


  useEffect(() => {
    if (featureSetResponse && plotSelector && selectedHslColor) {

      let locIds: Record<string, number> = {};

      featureSetResponse.features.map(feature => {
        let value = feature.properties.columnDataMap[plotSelector].value;
        if (value.split(" ").length > 1){
          locIds[feature.identifier] = value.split(" ")[0]
        } else {
          locIds[feature.identifier] = value
        }

      })
      let values: number[] = []
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

            const color = `hsl(${selectedHslColor.h}, ${locIds[feature.identifier]}%, ${50}%)`;

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

      setFeatureSet([reportCollection, parentLocationId ? parentLocationId : 'main', []]);
    }
  }, [featureSetResponse, selectedColor, parentLocationId, plotSelector, selectedHslColor, path])


  const loadChildHandler = (
      id: string,
      locationName: string,
      dashboardView: AmdrColumnType.DRUG | AmdrColumnType.HAPLOTYPE,
      selectedReportInfo?: string,
      parentData?: ReportLocationProperties
  ) => {
    setPlotSelector(undefined)
    setPlotSelectedOption(null)
    setSelectedHslColor(undefined)
    setSelectedColor(undefined)
    setParentLocationId(id);
    getAmdrMapReportData(
        id,
        dashboardView
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

  };

  const breadCrumbClickHandler = (el: BreadcrumbModel, index: number) => {
    const locationsToDelete = path.splice(index + 1);
    setPath(path);

    setParentLocationId(el.locationIdentifier);
    setClickedColumn(undefined);

    getAmdrMapReportData(
        el.locationIdentifier,
        dashboardView
    )
    .then(res => {

      //reset search input on new load
      if (searchInput.current) searchInput.current.value = '';

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


  function getDistinctHslColor(hslColor?: HslColor): string {
    if (hslColor) {
      return `hsl(${hslColor.h}, ${hslColor.s}%, ${hslColor.l}%)`;
    } else {
      return `hsl(120,60%,45%)`
    }

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
    if (!filterData || !filterData.length || !filterData[0].columnDataMap) return;

    const columnKeys = Object.keys(filterData[0].columnDataMap);
    const xAxisLabels = filterData.map(loc => loc.name);
    const allLineDatasets: ChartData<'line'>['datasets'] = [];


    columnKeys.forEach((colKey, index) => {
      const columnDescription = filterData[0].columnDataMap[colKey].description;
      const hslColor = filterData[0].columnDataMap[colKey].hslColor;
      const yValues = filterData.map(loc => {
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

    setChartType('bar'); // only one X value → bar chart
  }, [
    filterData
  ]);

  useEffect(() => {

    // const columnKeys = Object.keys(filterData[0].columnDataMap);
    // const xAxisLabels = filterData.map(loc => loc.name);

    if (haploData) {
      console.log("haploData", haploData);
      console.log("selectedHeaderButtons", selectedHeaderButtons);


      let combinedChartDataObj:{[key:string]:ChartData<'pie'>} = {};

        if (dashboardView == AmdrColumnType.DRUG){
          selectedHeaderButtons.map(header => {
            let haploDatum:HaploGeneMap = haploData[header.id];
            if (haploDatum){
              let haploDatumElement:GeneStats = haploDatum["total"];
              if (haploDatumElement) {

                let hslColorNormal:HslColor;
                let hslColorLighter:HslColor;
                let hslColorDark:HslColor;
                if (hslColorMap && hslColorMap[header.id]) {
                    hslColorNormal = {
                      h: hslColorMap[header.id].h,
                      s: hslColorMap[header.id].s,
                      l: hslColorMap[header.id].l
                    };
                    hslColorLighter = {
                      h: hslColorMap[header.id].h + 5,
                      s: hslColorMap[header.id].s+ 20,
                      l: hslColorMap[header.id].l - 10
                    };
                  hslColorDark = {
                    h: hslColorMap[header.id].h + 5,
                    s: hslColorMap[header.id].s + 60,
                    l: hslColorMap[header.id].l -30
                  };

                } else {
                    hslColorNormal = {
                      h: 20,
                      s: 20,
                      l: 20
                    };
                  hslColorLighter = {
                    h: 50,
                    s: 50,
                    l: 50
                  };
                  hslColorDark = {
                    h: 80,
                    s: 80,
                    l: 80
                  };
                }

                let distinctHslColorNormal = getDistinctHslColor(hslColorNormal);
                let distinctHslColorLighter = getDistinctHslColor(hslColorLighter);
                let distinctHslColorDark = getDistinctHslColor(hslColorDark);
                combinedChartDataObj[header.id] = {
                  labels: ["mixed","mono","wild"],
                  datasets: [
                    {
                      data: [
                        Number((haploDatumElement.mixed / haploDatumElement.totalRecs * 100).toFixed(2)),
                        Number((haploDatumElement.mono/ haploDatumElement.totalRecs * 100).toFixed(2)),
                            Number((haploDatumElement.wild/ haploDatumElement.totalRecs * 100).toFixed(2))
                      ],
                      backgroundColor: [
                        distinctHslColorNormal, // mixed
                        distinctHslColorLighter, // mono
                        distinctHslColorDark // wild
                      ],
                    }
                  ]
                };

              }
            }

          })
          setCombinedPieGraphData(combinedChartDataObj);
        } else {
          selectedHeaderButtons.map(header => {
          let haploDatum:HaploGeneMap = haploData[header.id];
          Object.keys(haploDatum)
          .filter(key => key != "total")
          .map(key => {

            let hslColorNormal:HslColor;
            let hslColorLighter:HslColor;
            let hslColorDark:HslColor;
            if (hslColorMap && hslColorMap[key]) {
              hslColorNormal = {
                h: hslColorMap[key].h,
                s: hslColorMap[key].s,
                l: hslColorMap[key].l
              };
              hslColorLighter = {
                h: hslColorMap[key].h + 5,
                s: hslColorMap[key].s+ 20,
                l: hslColorMap[key].l - 10
              };
              hslColorDark = {
                h: hslColorMap[key].h + 5,
                s: hslColorMap[key].s + 60,
                l: hslColorMap[key].l -30
              };

            } else {
              hslColorNormal = {
                h: 20,
                s: 20,
                l: 20
              };
              hslColorLighter = {
                h: 50,
                s: 50,
                l: 50
              };
              hslColorDark = {
                h: 80,
                s: 80,
                l: 80
              };
            }
            let distinctHslColorNormal = getDistinctHslColor(hslColorNormal);
            let distinctHslColorLighter = getDistinctHslColor(hslColorLighter);
            let distinctHslColorDark = getDistinctHslColor(hslColorDark);
            let haploDatumElement:GeneStats = haploDatum[key];
            const combinedChartData: ChartData<'pie'> = {
              labels: ["mixed","mono","wild"],
              datasets: [
                {
                  data: [
                    Number((haploDatumElement.mixed / haploDatumElement.totalRecs * 100).toFixed(2)),
                    Number((haploDatumElement.mono / haploDatumElement.totalRecs * 100).toFixed(2)),
                    Number((haploDatumElement.wild / haploDatumElement.totalRecs * 100).toFixed(2))
                  ],
                  backgroundColor: [
                    distinctHslColorNormal, // mixed
                    distinctHslColorLighter, // mono
                    distinctHslColorDark // wild
                  ],
                }
              ]
            };

            combinedChartDataObj[key] = combinedChartData;
          })
          setCombinedPieGraphData(combinedChartDataObj)
          })
        }


    }
  }, [
    selectedHeaderButtons, haploData, dashboardView, hslColorMap
  ]);


  useEffect(() => {
    setPlotSelector(undefined)
    setPlotSelectedOption(null)
  }, [clickedColumn])

  const handleToggle = () => {
    setSelectedHeaderButtons([])
    setCombinedGraphData(undefined)
    setFilterData([])
    setCols({})
    setDashboardView(dashboardView === AmdrColumnType.HAPLOTYPE ? AmdrColumnType.DRUG : AmdrColumnType.HAPLOTYPE);
  };


  useEffect(() => {
    if (!data?.length || !selectedHeaderButtons?.length) return;

    // 1️⃣ Precompute selected IDs
    const selectedIds = new Set(
        selectedHeaderButtons.map(btn => btn.id)
    );

    // 2️⃣ Compute allowed keys ONCE from first row
    const firstRow = data[0];
    const allowedKeys: string[] = [];

    for (const key in firstRow.columnDataMap) {
      const value = firstRow.columnDataMap[key];

      if (
          selectedIds.has(key) ||
          (value?.amdrParent && selectedIds.has(value.amdrParent))
      ) {
        allowedKeys.push(key);
      }
    }

    // 3️⃣ Build newData using direct key access (much faster)
    const newData = data.map(item => {
      const newColumnMap: any = {};

      for (let i = 0; i < allowedKeys.length; i++) {
        const key = allowedKeys[i];
        const value = item.columnDataMap[key];
        if (value !== undefined) {
          newColumnMap[key] = value;
        }
      }

      return {
        ...item,
        columnDataMap: newColumnMap,
      };
    });

    setFilterData(newData);
    setCols(newData[0].columnDataMap);

  }, [data, selectedHeaderButtons]);

  useEffect(() => {

    if (filterData && filterData[0]) {
      let hslColorMap: { [key: string]: HslColor } = {};
      let columnKeys = filterData[0].columnDataMap;

      Object.keys(columnKeys).map(key => {
        if (columnKeys[key] && columnKeys[key].hslColor) {
          hslColorMap[key] = columnKeys[key].hslColor!;
        }
      })
      setHslColorMap(hslColorMap);
    }


  }, [filterData]);

  return (
      <Container fluid className="my-4 px-2">
        <Row className="mt-3 align-items-center">
          <Col md={3}>

          </Col>
          <Col md={6} className="text-center">
            <h2 className="m-0">
              {dashboardView === AmdrColumnType.HAPLOTYPE ? 'Haplotype' : 'Drug'} ({"AMDR"})
            </h2>
          </Col>
          <Col></Col>
          <Col>
            <div
                className="d-inline-flex align-items-center gap-3 px-3 py-2"
                style={{
                  border: "1px solid #dee2e6",
                  borderRadius: 10,
                  background: "#f8f9fa"
                }}
            >
              {/* Left Label */}
              <span
                  className={`fw-bold ${
                      dashboardView !== AmdrColumnType.HAPLOTYPE
                          ? "text-primary"
                          : "text-muted"
                  }`}
              >
              Drug
              </span>

              {/* Switch */}
              <div className="form-check form-switch m-0">
                <input
                    className="form-check-input"
                    type="checkbox"
                    checked={dashboardView === AmdrColumnType.HAPLOTYPE}
                    onChange={handleToggle}
                    style={{
                      cursor: "pointer"
                    }}
                />
              </div>

              {/* Right Label */}
              <span
                  className={`fw-bold ${
                      dashboardView === AmdrColumnType.HAPLOTYPE
                          ? "text-primary"
                          : "text-muted"
                  }`}
              >
                Haplotype
              </span>
            </div>
          </Col>
          <Col>
            <div
                className="d-inline-flex align-items-center gap-3 px-3 py-2"
                style={{
                  border: "1px solid #dee2e6",
                  borderRadius: 10,
                  background: "#f8f9fa"
                }}
            >
              {/* Left Label */}
              <span
                  className={`fw-bold ${
                      dashboardView !== AmdrColumnType.HAPLOTYPE
                          ? "text-primary"
                          : "text-muted"
                  }`}
              >
              Drug
              </span>

              {/* Switch */}
              <div className="form-check form-switch m-0">
                <input
                    className="form-check-input"
                    type="checkbox"
                    checked={dashboardView === AmdrColumnType.HAPLOTYPE}
                    onChange={handleToggle}
                    style={{
                      cursor: "pointer"
                    }}
                />
              </div>

              {/* Right Label */}
              <span
                  className={`fw-bold ${
                      dashboardView === AmdrColumnType.HAPLOTYPE
                          ? "text-primary"
                          : "text-muted"
                  }`}
              >
              Haplotype
              </span>
            </div>
          </Col>
          <Col>
            <div
                className="d-inline-flex align-items-center gap-3 px-3 py-2"
                style={{
                  border: "1px solid #dee2e6",
                  borderRadius: 10,
                  background: "#f8f9fa"
                }}
            >
              {/* Left Label */}
              <span
                  className={`fw-bold ${
                      dashboardView !== AmdrColumnType.HAPLOTYPE
                          ? "text-primary"
                          : "text-muted"
                  }`}
              >
              Drug
              </span>

              {/* Switch */}
              <div className="form-check form-switch m-0">
                <input
                    className="form-check-input"
                    type="checkbox"
                    checked={dashboardView === AmdrColumnType.HAPLOTYPE}
                    onChange={handleToggle}
                    style={{
                      cursor: "pointer"
                    }}
                />
              </div>

              {/* Right Label */}
              <span
                  className={`fw-bold ${
                      dashboardView === AmdrColumnType.HAPLOTYPE
                          ? "text-primary"
                          : "text-muted"
                  }`}
              >
              Haplotype
              </span>
            </div>
          </Col>
        </Row>
        <Row className="mt-3 align-items-center">
          <Col className="d-flex flex-wrap gap-2">
            {Object.entries(headerButtons?.[dashboardView] || {}).map(
                ([id, headerName]) => {
                  const isSelected = selectedHeaderButtons.some(
                      btn => btn.id === id
                  );

                  const color = `hsl(${headerName.color?.h}, ${headerName.color?.s}%, ${headerName.color?.l}%)`;

                  return (
                      <Button
                          key={id}
                          id={id}
                          onClick={() =>
                              toggleSelectedHeaderButton({ id, headerName })
                          }
                          className="d-flex align-items-center"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,

                            height: 34,
                            padding: "0 12px",

                            backgroundColor: isSelected ? "#eef4ff" : "#f8f9fa",
                            color: "#333",

                            border: isSelected
                                ? "1px solid #1976d2"
                                : "1px solid #dee2e6",

                            borderRadius: 8,
                            fontSize: "0.85rem",
                            fontWeight: 500,

                            boxShadow: "none"
                          }}
                      >
                        <span
                            style={{
                              width: 10,
                              height: 10,
                              backgroundColor: color,
                              borderRadius: 2,
                              flexShrink: 0
                            }}
                        />

                        <span
                            style={{
                              whiteSpace: "nowrap",
                              lineHeight: 1
                            }}
                        >
            {headerName.name}
          </span>
                      </Button>
                  );
                }
            )}
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
                      className="my-2 me-2 "
                      onClick={() => {
                        if (path.length) {
                          loadChildHandler(
                              path[path.length - 1].locationIdentifier,
                              path[path.length - 1].locationName,
                              dashboardView,
                              selectedReportInfo?.value,
                              path[path.length - 1].locationProperties
                          );
                        }
                      }}
                  >
                    {t('reportPage.refreshData')}
                  </Button>

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
                            dashboardView,
                            selectedReportInfo?.value,
                            undefined
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
              }} className="mp-2 mx-2">

                {combinedGraphData && chartType === 'bar' && (
                    <Bar data={combinedGraphData as ChartData<'bar'>} options={graphOptions}/>
                )}

                <div className="d-flex flex-wrap gap-2 mb-3">
                  {Object.entries(headerButtons?.[dashboardView] || {}).map(
                      ([id, headerName]) => {
                        const isHaplotype = dashboardView === AmdrColumnType.HAPLOTYPE;

                        const isSelected = selectedHeaderButtons.some(
                            s => s.id === id
                        );

                        const color = `hsl(${headerName.color?.h}, ${headerName.color?.s}%, ${headerName.color?.l}%)`;

                        return (
                            <div key={id}>
                              <input
                                  type={isHaplotype ? "radio" : "checkbox"}
                                  className="btn-check"
                                  name={isHaplotype ? "header-radio-group" : undefined}
                                  id={`check-${id}`}
                                  checked={isSelected}
                                  onChange={() =>
                                      setSelectedHeaderButtons(prev => {
                                        // RADIO BEHAVIOR (single select)
                                        if (isHaplotype) {
                                          return [{id, headerName}];
                                        }

                                        // CHECKBOX BEHAVIOR (multi select)
                                        if (prev.some(s => s.id === id)) {
                                          return prev.filter(s => s.id !== id);
                                        }

                                        return [...prev, {id, headerName}];
                                      })
                                  }
                              />

                              <label
                                  htmlFor={`check-${id}`}
                                  className={`btn ${
                                      isSelected ? "btn-light border-primary" : "btn-light border"
                                  }`}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    borderRadius: 8
                                  }}
                              >
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
                                <span
                                    style={{
                                      whiteSpace: "nowrap",
                                      fontSize: "0.85rem",
                                      lineHeight: 1
                                    }}
                                >
                                  {headerName.name}
                                </span>
                              </label>
                            </div>
                        );
                      }
                  )}
                </div>
              </div>


            </Collapse>
          </Col>
        </Row>
          {Array.isArray(selectedHeaderButtons) && selectedHeaderButtons.length > 0 && (
              <Row>
                <Col>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    {combinedPieGraphData && Object.keys(combinedPieGraphData).map(key => (
                        <div key={key} style={{ width: 180 }}>
                          <div style={{ marginBottom: 6, fontSize: 12, fontWeight: "bold" }}>
                            {key ?? "Untitled"}
                          </div>

                          <div style={{ width: "100%", height: 180 }}>
                            <Pie
                                data={combinedPieGraphData[key]}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  plugins: {
                                    legend: { display: true },
                                  },
                                }}
                            />
                          </div>
                        </div>
                    ))}
                  </div>
                </Col>
              </Row>
          )}
          {/*{show3dGraphs &&*/}
          {/*    <Row>*/}
          {/*      <Col xs sm md={10}*/}
          {/*           className="border pe-3 d-flex justify-content-center align-items-center">*/}
          {/*        {plotSelector && ribbonData ?*/}
          {/*            <RibbonPlot data={ribbonData}/> :*/}
          {/*            <span>Select {dashboardView == AmdrColumnType.HAPLOTYPE ? "Drug" : "Gene"} to view data</span>}*/}

          {/*      </Col>*/}
          {/*      <Col xs sm md={2}>*/}
          {/*        <h5 className="mb-2">Select {dashboardView == AmdrColumnType.HAPLOTYPE ? "Haplotype" : "Drug"}</h5>*/}
          {/*        <Select*/}
          {/*            placeholder={'Select data to display' + '...'}*/}
          {/*            options={Object.keys(data[0].columnDataMap).map(el => {*/}
          {/*              return {*/}
          {/*                label: data[0].columnDataMap[el].description,*/}
          {/*                value: el ?? ''*/}
          {/*              };*/}
          {/*            })}*/}
          {/*            value={plotSelectedOption}*/}
          {/*            onChange={(e: SingleValue<OptionType>) => {*/}
          {/*              setPlotSelectedOption(e)*/}
          {/*              if (e) {*/}
          {/*                setPlotSelector(e?.value);*/}
          {/*              }*/}
          {/*            }}*/}
          {/*        />*/}
          {/*        <Select*/}
          {/*            placeholder={'Select Direction...'}*/}
          {/*            options={locationOrYearOptions.map(el => ({*/}
          {/*              label: el.toString(),*/}
          {/*              value: el*/}
          {/*            }))}*/}
          {/*            value={locationOrYearOptions*/}
          {/*            .map(el => ({*/}
          {/*              label: el.toString(),*/}
          {/*              value: el*/}
          {/*            }))*/}
          {/*            .find(o => o.value === locationOrYear)}*/}
          {/*            onChange={(e: SingleValue<{*/}
          {/*              label: string;*/}
          {/*              value: string;*/}
          {/*            }>) => {*/}
          {/*              if (e?.value) {*/}
          {/*                setLocationOrYear(e.value);*/}
          {/*              }*/}
          {/*            }}*/}
          {/*        />*/}
          {/*      </Col>*/}
          {/*    </Row>}*/}
          {showMap && <Row className="my-3 align-items-center">
            <Col md={showMap ? 10 : 2}>
              <Collapse in={showMap}>
                <div id="expand-table">
                  <AmdrMapViewDetail
                      defaultColumn={defaultDisplayColumn}
                      showModal={openModalHandler}
                      doubleClickEvent={(feature: Feature<Polygon | MultiPolygon, ReportLocationProperties>) =>
                          handleDobuleClickRef.current(feature, dashboardView)
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
                  options={filterData[0].columnDataMap && Object.keys(filterData[0].columnDataMap).map(el => ({
                    value: el ?? "",
                    label: filterData[0].columnDataMap[el].description
                  }))}
                  formatOptionLabel={(option) => {
                    if (!filterData?.[0]?.columnDataMap) return option.label;

                    const column = filterData[0].columnDataMap[option.value];

                    if (!column) {
                      return <span>{option.label}</span>;
                    }

                    const color = `hsl(${column.hslColor?.h}, ${column.hslColor?.s}%, ${column.hslColor?.l}%)`;

                    return (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
                          <span style={{ whiteSpace: "normal" }}>
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
                      const column = filterData[0].columnDataMap[e.value];
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
