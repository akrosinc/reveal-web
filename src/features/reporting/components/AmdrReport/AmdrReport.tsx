import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import React, {ChangeEvent, useCallback, useEffect, useRef, useState} from 'react';
import {Badge, Button, Col, Collapse, Container, Form, Modal, Row, Stack,} from 'react-bootstrap';
import {useNavigate} from 'react-router-dom';
import {Column} from 'react-table';
import {toast} from 'react-toastify';
import ReportsTable from '../../../../components/Table/ReportsTable';
import {useAppSelector} from '../../../../store/hooks';
import {getReportTypeInfo} from '../../api';
import {Feature, FeatureCollection, MultiPolygon, Point, Polygon} from '@turf/turf';
import {
  AmdrColumnType,
  AmdrDataType,
  AmdrDateModes,
  AmdrDrugYearlyMonthlyLocational,
  AmdrDrugYearlyMonthlyLocationalItem,
  AmdrHaplotypeYearlyMonthlyLocational,
  FeatureSetResponse,
  GeneStats,
  HaploData,
  HaploGeneMap,
  HslColor,
  Option
} from './types';
import {
  AdditionalReportInfo,
  FoundCoverage,
  ReportLocationProperties,
  RowData
} from '../../providers/types';
import {useTranslation} from 'react-i18next';
import Select, {SingleValue} from 'react-select';
import {
  getAmdrColumns,
  getAmdrMapReportData,
  getAmdrMapReportDataDate,
  getAmdrMapReportDataDateLocationDrug,
  getAmdrMapReportDataDateLocationHaplotype,
  getColorMap,
  getLocationTree
} from "./api";
import {ChartData, ChartDataset, ChartOptions, ChartType} from "chart.js";
import {Bar, Line, Pie} from "react-chartjs-2";


import {Coords, RibbonData} from "./RibbonPlot";
import AmdrMapViewDetail from "../report/mapView/amdr/AmdrMapViewDetail";
import {HeaderName, LocationNode} from "../../../AmdrImport/type";
import LocationTree from "./LocationTree";
import ReportsTableForDate from "../../../../components/Table/ReportsTableForDate";

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



const AmdrReport = () => {
  const [cols, setCols] = useState<{ [x: string]: FoundCoverage }>({});
  const [data, setData] = useState<ReportLocationProperties[]>([]);

  const [selectedHslColor, setSelectedHslColor] = useState<HslColor | undefined>();

  const [filterData, setFilterData] = useState<ReportLocationProperties[]>([]);
  const [filterDataDate, setFilterDataDate] = useState<RowData[]>([]);
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
  const [dashboardView, setDashboardView] = useState<AmdrColumnType.DRUG | AmdrColumnType.HAPLOTYPE>(AmdrColumnType.DRUG);
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
  const [geographyOrDate, setGeographyOrDate] = useState<AmdrDataType>(AmdrDataType.GEOGRAPHY)
  const [dateModes, setDateModes] = useState<AmdrDateModes>(AmdrDateModes.MONTHLY)

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
  const [defaultHeaderButtons, setDefaultHeaderButtons] = useState<HeaderButton[]>([]);
  const [selectedLocationsApi, setSelectedLocationsApi] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationTree, setLocationTree] = useState<LocationNode[]>([]);
  const [geoLevels, setGeoLevels] = useState<Option[]>([]);
  const [geoLevel, setGeoLevel] = useState<Option | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [locationMap, setLocationMap] = useState<Record<string, string>>({});
  const [haplotypeYearlyMonthlyLocationList,setHaplotypeYearlyMonthlyLocationList] = useState<AmdrHaplotypeYearlyMonthlyLocational[]>([])
  const [drugYearlyMonthlyLocationList,setDrugYearlyMonthlyLocationList] = useState<AmdrDrugYearlyMonthlyLocational[]>([])

  const [haplotypeYearlyMonthlyLocationLineData,setHaplotypeYearlyMonthlyLocationLineData] = useState<ChartData<'line'>>()
  const [drugYearlyMonthlyLocationLineData,setDrugYearlyMonthlyLocationLineData] = useState<ChartData<'line'>>()

  const locations = ["USA", "Canada", "Germany", "Japan"];
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

  useEffect(()=>{
    if (headerButtons && Object.entries(headerButtons).length > 0){
      let entries:{[p: string]: HeaderName} = headerButtons[dashboardView]?? Object.entries(headerButtons[dashboardView])[0];
      let innerEntries: [string, HeaderName] = Object.entries(entries)[0];
      let headerNames:HeaderName = innerEntries[1];
      let headerButton :HeaderButton = {
        headerName:headerNames,
        id: innerEntries[0]
      }
      setDefaultHeaderButtons([headerButton])
      setSelectedHeaderButtons([headerButton])
    }
  },[headerButtons, dashboardView])


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
        scales: {
          y: {
            min: 0,
          }
        },

        maintainAspectRatio: false
      };
      setGraphOptions(graphOptions)
    }
  }, [showGraphs])

  useEffect(()=>{
    getLocationTree().then(data => {
      const formatted = data.geoLevels.map((val: string) => ({
        value: val,
        label: val.charAt(0).toUpperCase() + val.slice(1)
      }));

      setGeoLevels(formatted);
      setLocationTree(data.nodes);
    })
  },[])


  useEffect(() => {
    if (locationTree.length === 0) return;

    const map: Record<string, string> = {};

    const buildMap = (nodes: LocationNode[]) => {
      nodes.forEach((node) => {
        map[node.id] = node.name;
        if (node.children) buildMap(node.children);
      });
    };

    buildMap(locationTree);
    setLocationMap(map);
    setSelectedLocations([locationTree?.[0]?.id])
  }, [locationTree]);

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

        const sortedCols: typeof cols = {} as any;

        for (const columnType in cols) {
          const headerMap = cols[columnType as AmdrColumnType];

          sortedCols[columnType as AmdrColumnType] = Object.fromEntries(
              Object.entries(headerMap).sort(([, a], [, b]) => {
                return a.order - b.order;
              })
          );
        }

        setHeaderButtons(sortedCols);
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
    setCombinedPieGraphData(undefined)
    setHaploData(undefined)
    setFilterData([])

    getColorMap()
    .then( colorMap => {

      setHslColorMap(colorMap)

      if (geographyOrDate === AmdrDataType.GEOGRAPHY){
        getAmdrMapReportData(
            parentLocationId ?? null,
            dashboardView
        )
        .then(report => {
          if (!report || report.toString() === "" || !report.features || report.features.length === 0) {
            setData([]);
            return;
          }

          const tableData = report.features.map(el => el.properties);

          setData(tableData);
          setFeatureSetResponse(report);
          setHaploData(report.markers);

        })
        .catch(err => toast.error(err));
      } else {
        getAmdrMapReportDataDate(
            parentLocationId ?? null,
            dashboardView,
            selectedLocationsApi,
            dateModes,

        )
        .then(report => {
          if (!report || report.toString() === "" || !report.features || report.features.length === 0) {
            setData([]);
            return;
          }


          const tableData =  report.rows;

          if (tableData) {
            setData(tableData);
          }

          setFeatureSetResponse(report);
          if (report.markers){
            setHaploData(report.markers);
          }

          setHaplotypeYearlyMonthlyLocationList([])
          setDrugYearlyMonthlyLocationList([])
          if (dashboardView === AmdrColumnType.DRUG){
            getAmdrMapReportDataDateLocationDrug(selectedLocationsApi,dateModes)
            .then(locationDrugData => {

              setDrugYearlyMonthlyLocationList(locationDrugData)
            })
          } else {
            getAmdrMapReportDataDateLocationHaplotype(selectedLocationsApi,dateModes)
            .then(locationHaplotypeData => {

              setHaplotypeYearlyMonthlyLocationList(locationHaplotypeData)
            })
          }
        })
        .catch(err => toast.error(err));
      }
        })


  }, [parentLocationId, dashboardView, geographyOrDate, dateModes, selectedLocationsApi]);

  useEffect(() => {
    const labelSet = new Set(
        haplotypeYearlyMonthlyLocationList.flatMap(location =>
            location.items.map(
                item => `${item.collectionYear}${dateModes === AmdrDateModes.MONTHLY ? "-".concat(String(item.collectionMonth).padStart(2, '0')):""}`
            )
        )
    );

    const labelList = Array.from(labelSet).sort();

    const datasets: ChartDataset<'line'>[] = [];

    // Helper to generate a consistent color from a string

    haplotypeYearlyMonthlyLocationList.forEach(location => {
      // Collect all gene keys across all items for selected haplotypes
      const allGeneKeysPerHaplo: Record<string, Set<string>> = {};
      location.items.forEach(item => {
        Object.keys(item.data).forEach(haploKey => {
          if (!selectedHeaderButtons.some(btn => btn.id === haploKey)) return;
          if (!allGeneKeysPerHaplo[haploKey]) allGeneKeysPerHaplo[haploKey] = new Set();
          Object.keys(item.data[haploKey]).forEach(geneKey => {
            allGeneKeysPerHaplo[haploKey].add(geneKey);
          });
        });
      });

      // Build datasets per haplotype × gene
      Object.entries(allGeneKeysPerHaplo).forEach(([haploKey, geneKeysSet]) => {
        Array.from(geneKeysSet).forEach(geneKey => {
          const dataPoints = labelList.map(label => {
            // Align data points with global labels
            const item = location.items.find(
                i => `${i.collectionYear}${dateModes === AmdrDateModes.MONTHLY ? "-".concat(String(i.collectionMonth).padStart(2, '0')):""}` === label
            );
            const geneStats = item?.data?.[haploKey]?.[geneKey];
            if (!geneStats) return 0;
            return geneStats.rec > 0 ? geneStats.val / geneStats.rec * 100 : 0;
          });

          const lineLabel = `${locationMap?.[location.locationIdentifier]} (${geneKey})`;
          datasets.push({
            label: lineLabel,
            data: dataPoints,
            tension: 0,
            borderColor: getDistinctHslColor(hslColorMap?.[geneKey]),
            backgroundColor: getDistinctHslColor(hslColorMap?.[geneKey]), // semi-transparent fill if needed
            fill: false, // set to true if you want area under line
          });
        });
      });
    });

    const result: ChartData<'line'> = {
      labels: labelList,
      datasets: datasets,
    };

    setHaplotypeYearlyMonthlyLocationLineData(result);
  }, [haplotypeYearlyMonthlyLocationList, selectedHeaderButtons, dateModes]);

  const graphDateOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'left' as const,
      },
    },
    scales: {
      y: {
        min: 0,
      },
    },
  }
  const formatLabel = (item: AmdrDrugYearlyMonthlyLocationalItem) =>
      `${item.collectionYear}${
          dateModes === AmdrDateModes.MONTHLY
              ? "-" + String(item.collectionMonth).padStart(2, "0")
              : ""
      }`;

// Helper to generate a consistent color from a string
  const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();
    return "#" + "000000".substring(0, 6 - c.length) + c;
  };

  useEffect(() => {

    const formatLabel = (item: AmdrDrugYearlyMonthlyLocationalItem) =>
        `${item.collectionYear}${
            dateModes === AmdrDateModes.MONTHLY
                ? "-" + String(item.collectionMonth).padStart(2, "0")
                : ""
        }`;

    // Build global label set
    const labelSet = new Set(
        drugYearlyMonthlyLocationList.flatMap(location =>
            location.items.map(formatLabel)
        )
    );
    const labelList = Array.from(labelSet).sort((a, b) => a.localeCompare(b));

    const datasets: ChartDataset<'line'>[] = [];

    // Stable hash → consistent index per location
    const getIndexFromKey = (key: string) => {
      let hash = 0;
      for (let i = 0; i < key.length; i++) {
        hash = key.charCodeAt(i) + ((hash << 5) - hash);
      }
      return Math.abs(hash);
    };

    // Precompute all locations per gene
    const geneLocationMap: Record<string, string[]> = {};
    drugYearlyMonthlyLocationList.forEach(location => {
      location.items.forEach(item => {
        Object.keys(item.data).forEach(geneKey => {
          if (!selectedHeaderButtons.some(btn => btn.id === geneKey)) return;
          if (!geneLocationMap[geneKey]) geneLocationMap[geneKey] = [];
          if (!geneLocationMap[geneKey].includes(location.locationIdentifier))
            geneLocationMap[geneKey].push(location.locationIdentifier);
        });
      });
    });

    // Generate color for each (geneKey, location)
    const getLineColor = (geneKey: string, locationId: string) => {
      const baseHsl = getDistinctHslColor(hslColorMap?.[geneKey]) || 'hsl(200, 70%, 50%)';
      const match = baseHsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
      if (!match) return baseHsl;

      let [_, baseH, s, l] = match.map(Number);

      const locations = geneLocationMap[geneKey];
      const index = locations.indexOf(locationId);
      const total = locations.length;

      // Wider hue spread ±40°
      const spread = 15;
      let newH = (baseH - spread + (index / Math.max(1, total - 1)) * 2 * spread + 360) % 360;

      newH = baseH;
      // Slight lightness variation
      const lightnessSteps = [25, 45, 65, 75];
      const newL = lightnessSteps[index % lightnessSteps.length];

      // Optional: slight saturation tweak for extra separation
      const saturationSteps = [35, 70, 95];
      const newS = saturationSteps[index % saturationSteps.length];

      return `hsl(${newH}, ${newS}%, ${newL}%)`;
    };

    // Build datasets
    drugYearlyMonthlyLocationList.forEach(location => {
      const allGeneKeys = new Set<string>();

      location.items.forEach(item => {
        Object.keys(item.data).forEach(geneKey => {
          if (!selectedHeaderButtons.some(btn => btn.id === geneKey)) return;
          allGeneKeys.add(geneKey);
        });
      });

      const itemMap = new Map(location.items.map(i => [formatLabel(i), i]));

      Array.from(allGeneKeys).forEach(geneKey => {
        const dataPoints = labelList.map(label => {
          const item = itemMap.get(label);
          const geneStats = item?.data?.[geneKey];
          if (!geneStats) return 0;
          return geneStats.rec > 0 ? (geneStats.val / geneStats.rec) * 100 : 0;
        });

        const color = getLineColor(geneKey, location.locationIdentifier);
        const locationName =
            locationMap?.[location.locationIdentifier] ?? location.locationIdentifier;

        datasets.push({
          label: `${locationName} (${geneKey})`,
          data: dataPoints,
          tension: 0,
          borderColor: color,
          backgroundColor: color ,
          fill: false,
          borderWidth: 2,
          pointRadius: 3,
        });
      });
    });

    setDrugYearlyMonthlyLocationLineData({
      labels: labelList,
      datasets,
    });

  }, [
    drugYearlyMonthlyLocationList,
    selectedHeaderButtons,
    dateModes,
    hslColorMap,
    locationMap
  ]);

  useEffect(() => {
    if (featureSetResponse && plotSelector && selectedHslColor) {

      let locIds: Record<string, number> = {};

      featureSetResponse.features.map(feature => {
        if (feature.properties.columnDataMap && feature.properties.columnDataMap[plotSelector]){
          let value = feature.properties.columnDataMap[plotSelector].value;
          if (value.split(" ").length > 1){
            locIds[feature.identifier] = value.split(" ")[0]
          } else {
            locIds[feature.identifier] = value
          }
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
  }, [featureSetResponse, parentLocationId, plotSelector, selectedHslColor, path])


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
    if (!filterData || !filterData.length || !filterData[0].columnDataMap) {
      setCombinedGraphData(undefined)
      return;
    }

    const columnKeys = Object.keys(filterData[0].columnDataMap);
    const xAxisLabels = filterData.map(loc => loc.name);
    const allLineDatasets: ChartData<'line'>['datasets'] = [];


    columnKeys.forEach((colKey, index) => {
      const columnDescription = filterData[0].columnDataMap[colKey].description;

      const hslColor = hslColorMap?.[colKey];
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

    if (geographyOrDate === AmdrDataType.GEOGRAPHY || filterData.length === 1){
      setChartType('bar'); // only one X value → bar chart
    } else {
      setChartType('line');
    }

  }, [
    filterData,
    geographyOrDate,
      hslColorMap
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
                      h: 0,
                      s: 0,
                      l: 93
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
                    h: 0,
                    s: 0,
                    l: 93
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
                  labels: ["Het","Hom","Wild/Sensitive"],
                  datasets: [
                    {
                      data: [
                        Number((haploDatumElement.mixed / haploDatumElement.totalRecs * 100).toFixed(2)),
                        Number((haploDatumElement.mono/ haploDatumElement.totalRecs * 100).toFixed(2)),
                            Number((haploDatumElement.wild/ haploDatumElement.totalRecs * 100).toFixed(2))
                      ],
                      backgroundColor: [
                        distinctHslColorNormal, // mixed
                        distinctHslColorDark,
                        distinctHslColorLighter, // mono
                         // wild
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
                h: 0,
                s: 0,
                l: 93
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
                h: 0,
                s: 0,
                l: 93
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
              labels: ["Het","Hom","Wild/Sensitive"],
              datasets: [
                {
                  data: [
                    Number((haploDatumElement.mixed / haploDatumElement.totalRecs * 100).toFixed(2)),
                    Number((haploDatumElement.mono / haploDatumElement.totalRecs * 100).toFixed(2)),
                    Number((haploDatumElement.wild / haploDatumElement.totalRecs * 100).toFixed(2))
                  ],
                  backgroundColor: [
                    distinctHslColorNormal,
                    distinctHslColorDark,// mixed
                    distinctHslColorLighter, // mono
                     // wild
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

  const handleDrugOrGeneToggle = () => {
    setSelectedHeaderButtons(defaultHeaderButtons)
    setCombinedGraphData(undefined)
    setFilterData([])
    setCols({})
    setDashboardView(dashboardView === AmdrColumnType.HAPLOTYPE ? AmdrColumnType.DRUG : AmdrColumnType.HAPLOTYPE);
  };

  const handleGeographyOrDateToggle = (locationTree:LocationNode[]) => {
    setSelectedHeaderButtons(defaultHeaderButtons)
    setCombinedGraphData(undefined)
    setFilterData([])
    setCols({})
    setSelectedLocations([locationTree?.[0]?.id])
    setGeographyOrDate(geographyOrDate === AmdrDataType.GEOGRAPHY ? AmdrDataType.DATE : AmdrDataType.GEOGRAPHY);
  };

  const handleDateModesToggle = () => {
    setSelectedHeaderButtons(defaultHeaderButtons)
    setCombinedGraphData(undefined)
    setFilterData([])
    setCols({})
    setDateModes(dateModes === AmdrDateModes.MONTHLY ? AmdrDateModes.YEARLY : AmdrDateModes.MONTHLY);
  };

  const getOrderedKeys = (columnType: AmdrColumnType) => {
    const headers = headerButtons?.[columnType] ?? {};

    return Object.entries(headers)
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([key]) => key);
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

    // 3️⃣ Apply ordering from headerButtons
    const headersForType = headerButtons?.[dashboardView===AmdrColumnType.HAPLOTYPE?AmdrColumnType.GENE:dashboardView] ?? {};

    allowedKeys.sort((a, b) => {
      const orderA = headersForType[a]?.order ?? Infinity;
      const orderB = headersForType[b]?.order ?? Infinity;
      return orderA - orderB;
    });

    // 4️⃣ Build newData using ordered keys
    const newData = data.map(item => {
      const newColumnMap: Record<string, any> = {};

      for (let i = 0; i < allowedKeys.length; i++) {
        const key = allowedKeys[i];
        const value = item.columnDataMap[key];

        if (value !== undefined) {
          newColumnMap[key] = value;
        }
      }

      return {
        ...item,
        columnDataMap: newColumnMap
      };
    });

    // 5️⃣ Update state
    setFilterData(newData);
    setCols(newData[0]?.columnDataMap);

  }, [data, selectedHeaderButtons, headerButtons, dashboardView]);
  // useEffect(() => {
  //   if (!data?.length || !selectedHeaderButtons?.length) return;
  //
  //   // 1️⃣ Precompute selected IDs
  //   const selectedIds = new Set(
  //       selectedHeaderButtons.map(btn => btn.id)
  //   );
  //
  //   // 2️⃣ Compute allowed keys ONCE from first row
  //   const firstRow = data[0];
  //   const allowedKeys: string[] = [];
  //
  //   for (const key in firstRow.columnDataMap) {
  //     const value = firstRow.columnDataMap[key];
  //
  //     if (
  //         selectedIds.has(key) ||
  //         (value?.amdrParent && selectedIds.has(value.amdrParent))
  //     ) {
  //       allowedKeys.push(key);
  //     }
  //   }
  //
  //   // 3️⃣ Build newData using direct key access (much faster)
  //   const newData = data.map(item => {
  //     const newColumnMap: any = {};
  //
  //     for (let i = 0; i < allowedKeys.length; i++) {
  //       const key = allowedKeys[i];
  //       const value = item.columnDataMap[key];
  //       if (value !== undefined) {
  //         newColumnMap[key] = value;
  //       }
  //     }
  //
  //     return {
  //       ...item,
  //       columnDataMap: newColumnMap
  //     };
  //   });
  //
  //   setFilterData(newData);
  //   setCols(newData[0].columnDataMap);
  //
  // }, [data, selectedHeaderButtons,headerButtons,dashboardView]);

  // useEffect(() => {
  //
  //   if (filterData && filterData[0]) {
  //     let hslColorMap: { [key: string]: HslColor } = {};
  //     let columnKeys = filterData[0].columnDataMap;
  //
  //     Object.keys(columnKeys).map(key => {
  //       if (columnKeys[key] && columnKeys[key].hslColor) {
  //         hslColorMap[key] = columnKeys[key].hslColor!;
  //       }
  //     })
  //     setHslColorMap(hslColorMap);
  //   }
  //
  //
  // }, [filterData]);

  const toggleLocationModal = () => {
    setGeoLevel(null)
    setShowLocationModal(!showLocationModal);
    setSelectedLocationsApi(selectedLocations);
  }

  const getAllChildIds = (node: LocationNode): string[] => {
    if (!node.children || node.children.length === 0) return [];
    return node.children.flatMap((child) => [child.id, ...getAllChildIds(child)]);
  };

  const findNodeById = (nodes: LocationNode[], id: string): LocationNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };
  const findParentId = (nodes: LocationNode[], childId: string): string | null => {
    for (const node of nodes) {
      if (node.children?.some((c) => c.id === childId)) return node.id;
      if (node.children) {
        const found = findParentId(node.children, childId);
        if (found) return found;
      }
    }
    return null;
  };
  const getAllAncestorIds = (nodes: LocationNode[], childId: string): string[] => {
    const parentId = findParentId(nodes, childId);
    if (!parentId) return [];
    return [parentId, ...getAllAncestorIds(nodes, parentId)];
  };


  const handleLocationChange = (id: string) => {
    const node = findNodeById(locationTree, id);
    if (!node) return;

    if (!selectedLocations.includes(id)) {
      // Selecting a node

      // 1️⃣ If it's a parent → deselect all children
      const childIds = getAllChildIds(node);
      let updated = [...selectedLocations.filter((x) => !childIds.includes(x)), id];

      // 2️⃣ If it's a child → deselect all ancestors recursively
      const ancestorIds = getAllAncestorIds(locationTree, id);
      updated = updated.filter((x) => !ancestorIds.includes(x));

      setSelectedLocations(updated);
    } else {
      // Deselecting a node → remove it
      setSelectedLocations((prev) => prev.filter((x) => x !== id));
    }
  };


  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // const formatLabel = (item: AmdrDrugYearlyMonthlyLocationalItem) =>
  //     `${item.collectionYear}${
  //         dateModes === AmdrDateModes.MONTHLY
  //             ? "-" + String(item.collectionMonth).padStart(2, "0")
  //             : ""
  //     }`;



  // const { chartMatrixData, xLabels, yLabels } = useMemo(() => {
  //   const rawData: { x: string; y: string; v: number }[] = [];
  //   const xLabelSet = new Set<string>();
  //   const yLabelSet = new Set<string>();
  //
  //   // Collect raw data and unique labels
  //   drugYearlyMonthlyLocationList.forEach(location => {
  //     const locationName =
  //         locationMap?.[location.locationIdentifier] ?? location.locationIdentifier;
  //
  //     location.items.forEach(item => {
  //       const x = formatLabel(item);
  //       xLabelSet.add(x);
  //
  //       Object.entries(item.data).forEach(([geneKey, stats]) => {
  //         if (!selectedHeaderButtons.some(btn => btn.id === geneKey)) return;
  //
  //         const y = `${geneKey} | ${locationName}`;
  //         yLabelSet.add(y);
  //
  //         const value = stats.rec > 0 ? (stats.val / stats.rec) * 100 : 0;
  //
  //         rawData.push({ x, y, v: value });
  //       });
  //     });
  //   });
  //
  //   // Sort labels
  //   const xLabels = Array.from(xLabelSet).sort((a, b) => a.localeCompare(b));
  //   const yLabels = Array.from(yLabelSet).sort();
  //
  //   // Map string labels to numeric indices for Chart.js
  //   const mappedData = rawData.map(d => ({
  //     x: xLabels.indexOf(d.x), // numeric index
  //     y: yLabels.indexOf(d.y), // numeric index
  //     v: d.v
  //   }));
  //
  //   // Build chartData
  //   const chartMatrixData = {
  //     labels: xLabels, // x-axis labels
  //     datasets: [
  //       {
  //         label: "Heatmap",
  //         data: mappedData, // must be { x: number, y: number, v: number }[]
  //         backgroundColor: (ctx: any) => {
  //           if (!ctx.raw || ctx.raw.v === undefined) return "#eee"; // fallback
  //           const v = ctx.raw.v;
  //           const h = 120;
  //           const s = 70;
  //           const l = 95 - v * 0.7;
  //           return `hsl(${h}, ${s}%, ${l}%)`;
  //         },
  //         borderColor: "#ccc",
  //         borderWidth: 1,
  //       },
  //     ],
  //   };
  //
  //   return { chartMatrixData, xLabels, yLabels };
  // }, [
  //   drugYearlyMonthlyLocationList,
  //   selectedHeaderButtons,
  //   dateModes,
  //   locationMap
  // ]);


  // const optionsMatrix: ChartOptions<'matrix'> = {
  //   responsive: true,
  //       maintainAspectRatio: false,
  //       scales: {
  //     x: { type: 'category' as const, labels: xLabels, ticks: { autoSkip: false } },
  //     y: { type: 'category' as const, labels: yLabels, ticks: { autoSkip: false, font: { size: 10 } } },
  //   },
  //   plugins: {
  //     tooltip: {
  //       callbacks: {
  //         label: (ctx: any) => {
  //           const d = ctx.raw;
  //           return `${xLabels[d.x]} / ${yLabels[d.y]} : ${d.v.toFixed(1)}%`;
  //         },
  //       },
  //     },
  //     legend: { display: false },
  //   },
  // };

  function getBreadCrumbRow() {
    return <>
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
    </>;
  }

  function getSearchBarRow() {
    return <>
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
        {/*<Button*/}
        {/*    className="my-2 me-2 "*/}
        {/*    onClick={() => {*/}
        {/*      if (path.length) {*/}
        {/*        loadChildHandler(*/}
        {/*            path[path.length - 1].locationIdentifier,*/}
        {/*            path[path.length - 1].locationName,*/}
        {/*            dashboardView,*/}
        {/*            selectedReportInfo?.value,*/}
        {/*            path[path.length - 1].locationProperties*/}
        {/*        );*/}
        {/*      }*/}
        {/*    }}*/}
        {/*>*/}
        {/*  {t('reportPage.refreshData')}*/}
        {/*</Button>*/}

      </Col>
    </>;
  }

  function getTable() {
    return <div
        style={{
          maxHeight: showMap ? '50vh' : '90vh',
          overflow: 'auto'
        }}
    >

      {geographyOrDate === AmdrDataType.GEOGRAPHY ?
          (<ReportsTable
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
          />) : (
              <ReportsTableForDate
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
          )}
    </div>;
  }

  function getHeaderRow() {
    return <Col className="text-center">
      <h2 className="m-0">
        {dashboardView === AmdrColumnType.HAPLOTYPE ? "Haplotype" : "Drug"} (AMDR)
      </h2>
    </Col>;
  }

  function getSwitchesRow() {
    return <Col>
      {/* Controls (now LEFT aligned) */}
      <div className="d-flex align-items-center gap-3 flex-wrap">

        {/* Drug / Haplotype */}
        <div
            className="d-inline-flex align-items-center gap-2 px-3 py-2 border rounded bg-light">
          <Form.Label
              className={`fw-bold m-0 ${
                  dashboardView !== AmdrColumnType.HAPLOTYPE ? "text-primary" : "text-muted"
              }`}
          >
            Drug
          </Form.Label>

          <Form.Check
              type="switch"
              className="m-0"
              checked={dashboardView === AmdrColumnType.HAPLOTYPE}
              onChange={handleDrugOrGeneToggle}
          />

          <Form.Label
              className={`fw-bold m-0 ${
                  dashboardView === AmdrColumnType.HAPLOTYPE ? "text-primary" : "text-muted"
              }`}
          >
            Haplotype
          </Form.Label>
        </div>

        {/* Geography / Date */}
        <div
            className="d-inline-flex align-items-center gap-2 px-3 py-2 border rounded bg-light">
          <Form.Label
              className={`fw-bold m-0 ${
                  geographyOrDate === AmdrDataType.GEOGRAPHY ? "text-primary" : "text-muted"
              }`}
          >
            Geography
          </Form.Label>

          <Form.Check
              type="switch"
              className="m-0"
              checked={geographyOrDate !== AmdrDataType.GEOGRAPHY}
              onChange={() => handleGeographyOrDateToggle(locationTree)}
          />

          <Form.Label
              className={`fw-bold m-0 ${
                  geographyOrDate !== AmdrDataType.GEOGRAPHY ? "text-primary" : "text-muted"
              }`}
          >
            Date
          </Form.Label>
        </div>

        {/* Monthly / Yearly */}
        {geographyOrDate === AmdrDataType.DATE
            && (
                <>
                  <div
                      className="d-inline-flex align-items-center gap-2 px-3 py-2 border rounded bg-light">
                    <Form.Label
                        className={`fw-bold m-0 ${
                            dateModes === AmdrDateModes.MONTHLY ? "text-primary" : "text-muted"
                        }`}
                    >
                      Monthly
                    </Form.Label>

                    <Form.Check
                        type="switch"
                        className="m-0"
                        checked={dateModes !== AmdrDateModes.MONTHLY}
                        onChange={handleDateModesToggle}
                    />

                    <Form.Label
                        className={`fw-bold m-0 ${
                            dateModes === AmdrDateModes.YEARLY ? "text-primary" : "text-muted"
                        }`}
                    >
                      Yearly
                    </Form.Label>
                  </div>


                  <Stack direction="horizontal" gap={2}
                         className="flex-wrap align-items-center">

                    <Button variant="outline-primary" size="sm" onClick={toggleLocationModal}>
                      Select Locations
                    </Button>

                    <Stack direction="horizontal" gap={2} className="flex-wrap">
                      {selectedLocations.map((id) => (
                          <Badge key={id} bg="primary" pill>
                            {locationMap[id] || id}
                          </Badge>
                      ))}
                    </Stack>

                  </Stack>
                </>
            )}

      </div>
    </Col>;
  }

  function getLocationsModal() {
    return <Modal show={showLocationModal} onHide={() => {
      setShowLocationModal(false)
    }}>
      <Modal.Header closeButton>
        <Modal.Title>Select Locations</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{maxHeight: "60vh", overflowY: "auto"}}>
        <LocationTree
            nodes={locationTree}
            selectedLocations={selectedLocations}
            onToggle={handleLocationChange}
            expandedNodes={expandedNodes}
            toggleNode={toggleNode}
            geoLevels={geoLevels}
            geoLevel={geoLevel}
        />
      </Modal.Body>
      <Modal.Footer>
        <Row className="w-100 align-items-end">

          <Col md={8}>
            <Form.Group>
              <Form.Label>Lowest Geographic Level</Form.Label>
              <Select
                  options={geoLevels}
                  value={geoLevel}
                  onChange={(selected) => setGeoLevel(selected)}
                  placeholder="Select geographic level..."
              />
            </Form.Group>
          </Col>

          <Col md={4} className="d-flex justify-content-end">
            <Button variant="secondary" onClick={toggleLocationModal}>
              Update
            </Button>

          </Col>

        </Row>
      </Modal.Footer>
    </Modal>;
  }

  function getHeaderButtonRow() {
    return <Col className="d-flex flex-wrap gap-2">
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
                        toggleSelectedHeaderButton({id, headerName})
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
    </Col>;
  }

  function getLineAndBarChartRow() {
    return <Col md={showMap ? 10 : 2}>
      <Collapse in={showMap}>
        <div style={{
          display: 'flex',
          gap: '16px',            // optional spacing between charts
          padding: '16px',        // optional padding
          height: "400px", width: "100%"
        }} className="mp-2 mx-2">
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
          <Bar style={{display: chartType === 'bar' ? 'block' : 'none'}}
               data={combinedGraphData as ChartData<'bar'>}
               options={graphOptions}
          />

          <Line style={{display: chartType === 'line' ? 'block' : 'none'}}
                data={combinedGraphData as ChartData<'line'>}
                options={graphOptions}
          />
        </div>


      </Collapse>
    </Col>;
  }

  function getHeaderButtonListForGraph() {
    return <div className="d-flex flex-wrap gap-2 mb-3 justify-content-center">
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

                  <label htmlFor={`check-${id}`} className={`btn ${isSelected ? "btn-light border-primary" : "btn-light border"}`}
                      style={{display: "flex", alignItems: "center", gap: 8, borderRadius: 8}}>
                    <span style={{width: 10, height: 10, backgroundColor: color, display: "inline-block", borderRadius: 2, flexShrink: 0}}/>
                    <span style={{whiteSpace: "nowrap", fontSize: "0.85rem", lineHeight: 1}}>
                      {headerName.name}
                    </span>
                  </label>
                </div>
            );
          }
      )}
    </div>;
  }

  function getLineAndBarChartRowCombined() {
    return (
        <>
          {/*{chartType === 'line' &&  <Row>*/}
          {/*  <hr/>*/}
          {/*  {getHeaderButtonListForGraph()}*/}
          {/*  <hr/>*/}
          {/*  /!*<Chart type="matrix" data={chartMatrixData} options={optionsMatrix} />*!/*/}
          {/*</Row>}*/}
          {chartType === 'bar' && <Row className="my-3 align-items-center">
        <Col md={showMap ? 10 : 2}>

        <div style={{
          display: 'flex',
          gap: '16px',            // optional spacing between charts
          padding: '16px',        // optional padding
          height: "400px", width: "100%"
        }} className="mp-2 mx-2">
          {getHeaderButtonListForGraph()}
          <Bar style={{display: chartType === 'bar' ? 'block' : 'none',width:'100%'}}
               data={combinedGraphData as ChartData<'bar'>}
               options={{ responsive: true,
                 plugins: {
                   title:{
                     display:true,
                     position: 'top',
                     text: 'Percentage of drug resistance by geography'
                   },
                   legend: {

                     display: false,
                     position: 'right',
                     labels: {
                       boxWidth: 10,
                       boxHeight: 2
                     },
                   },
                 },
                 scales: {
                   x: {
                     title: {
                       display: false,       // ✅ shows the title
                       text: 'Location'
                     },
                   },
                   y: {
                     title: {
                       display: true,       // ✅ shows the title
                       text: '% Resistant'
                     },
                     min: 0,
                     max: 100
                   }
                 },
                 maintainAspectRatio: false
               }
               }
          />
        </div>
        </Col>
      </Row>}
          {chartType === 'line' && <>
            <Row>
              <Col md={"1"} className={"d-flex"} >
                  {getHeaderButtonListForGraph()}
              </Col>
              <Col md={"11"}>
                <Row>
                  <Col md={"6"}>
                    <Line style={{display: chartType === 'line' ? 'block' : 'none'}}
                          data={combinedGraphData as ChartData<'line'>}
                          options={{
                            responsive: true,
                            plugins: {

                              title:{
                                display:true,
                                position: 'top',
                                text: 'Percentage Resistance by ' + (dateModes === AmdrDateModes.MONTHLY?"month":"year")
                              },
                              legend: {
                                display: true,
                                position: 'bottom',
                                labels: {
                                  boxWidth: 10,
                                  boxHeight: 10
                                },
                              },
                            },
                            scales: {
                              x: {
                                title: {
                                  display: true,       // ✅ shows the title
                                  text: (dateModes === AmdrDateModes.MONTHLY?"Month":"Year")
                                },
                              },
                              y: {
                                title: {
                                  display: true,       // ✅ shows the title
                                  text: '% Resistant'
                                },
                                min: 0,
                                max: 100
                              }
                            },
                          }}
                    />

                  </Col>
                  {chartType === 'line' && <Col md="6">
                    {dashboardView === AmdrColumnType.HAPLOTYPE && chartType === 'line' && haplotypeYearlyMonthlyLocationLineData && (

                        <Line
                            data={haplotypeYearlyMonthlyLocationLineData}
                            options={{
                              responsive: true,

                              plugins: {
                                title:{
                                  display:true,
                                  position: 'top',
                                  text: 'Percentage Resistance by ' + (dateModes === AmdrDateModes.MONTHLY?"month":"year")
                                },
                                legend: {
                                  position: 'bottom' as const,
                                  labels: {
                                    boxWidth: 10,
                                    boxHeight: 10
                                  },
                                },
                              },

                              scales: {
                                x: {
                                  title: {
                                    display: true,       // ✅ shows the title
                                    text: (dateModes === AmdrDateModes.MONTHLY?"Month":"Year")
                                  },
                                },
                                y: {
                                  title: {
                                    display: true,       // ✅ shows the title
                                    text: '% Resistant'
                                  },
                                  min: 0,
                                  max: 100
                                },
                              }
                            }}
                        />

                    )}
                    {dashboardView === AmdrColumnType.DRUG && chartType === 'line' && drugYearlyMonthlyLocationLineData && (
                        <Line
                            data={drugYearlyMonthlyLocationLineData}
                            options={{
                              responsive: true,

                              plugins: {
                                title:{
                                  display:true,
                                  position: 'top',
                                  text: 'Percentage Resistance by ' + (dateModes === AmdrDateModes.MONTHLY?"month":"year") +" by location"
                                },
                                legend: {
                                  position: 'bottom' as const,
                                },
                              },
                              scales: {
                                x: {
                                  title: {
                                    display: true,       // ✅ shows the title
                                    text: (dateModes === AmdrDateModes.MONTHLY?"Month":"Year")
                                  },
                                },
                                y: {
                                  min: 0,
                                  max: 100
                                },
                              }
                            }}
                        />
                    )}
                  </Col>}
                </Row>
              </Col>
            </Row>

          </>
          }
    </>);
  }

  function getDatedLineChartRow() {
    return <Col>
      {dashboardView === AmdrColumnType.HAPLOTYPE && chartType === 'line' && haplotypeYearlyMonthlyLocationLineData && (
          <div style={{width: '100%', height: '500px'}}> {/* fixed reasonable height */}
            <Line
                data={haplotypeYearlyMonthlyLocationLineData}
                options={{
                  ...graphDateOptions,
                  responsive: true,
                  maintainAspectRatio: false, // let it fill the div
                }}
            />
          </div>
      )}
      {dashboardView === AmdrColumnType.DRUG && chartType === 'line' && drugYearlyMonthlyLocationLineData && (
          <div style={{width: '100%', height: '500px'}}> {/* fixed reasonable height */}
            <Line
                data={drugYearlyMonthlyLocationLineData}
                options={{
                  ...graphDateOptions,
                  responsive: true,
                  maintainAspectRatio: false, // let it fill the div
                }}
            />
            {/*<Chart type="matrix" data={chartMatrixData} options={optionsMatrix} />*/}
          </div>
      )}
    </Col>;
  }

  function getPieChartRow() {
    return <Col>
      <div style={{display: "flex", gap: 16, flexWrap: "wrap"}}>
        {combinedPieGraphData && Object.keys(combinedPieGraphData).map(key => (
            <div key={key} style={{width: 180}}>
              <div style={{marginBottom: 6, fontSize: 12, fontWeight: "bold"}}>
                {headerButtons?.[dashboardView===AmdrColumnType.DRUG?dashboardView:AmdrColumnType.GENE]?.[key]?.name}
              </div>

              <div style={{width: "100%", height: 180}}>
                <Pie
                    data={combinedPieGraphData[key]}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {display: true},
                      },
                    }}
                />
              </div>
            </div>
        ))}
      </div>
    </Col>;
  }

  function getMapViewRow() {
    return <>
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
        {filterData && filterData[0] && filterData[0].columnDataMap &&
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

                  const color = `hsl(${hslColorMap?.[option.value].h}, ${hslColorMap?.[option.value].s}%, ${hslColorMap?.[option.value].l}%)`;

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
                    setSelectedHslColor(hslColorMap?.[e.value])
                    setPlotSelector(e.value);
                  }
                }}
            />}
      </Col>
    </>;
  }

  return (
      <Container fluid className="my-4 px-2">
        <Row className="mt-3 align-items-center">
          {getHeaderRow()}
        </Row>
        <Row className="mt-5 align-items-center">
          {getSwitchesRow()}
        </Row>
        {getLocationsModal()}
        <Row className="mt-3 align-items-center">
          {getHeaderButtonRow()}
        </Row>
        <hr/>
        {geographyOrDate === AmdrDataType.GEOGRAPHY &&
            <>
              <Row className={isDarkMode ? 'm-0 p-0 rounded bg-dark' : 'm-0 p-0 rounded bg-light'}>
                {getBreadCrumbRow()}
              </Row>
            </>
        }
        {showGrid && (
            <>
              {/*<Row className="mt-3 mb-2 align-items-center">*/}
              {/*  {getSearchBarRow()}*/}
              {/*</Row>*/}
              {getTable()}
            </>
        )}
        {filterData.length === 0 && <p className="lead text-center">{t('general.noDataFound')}</p>}
        {showGraphs && combinedGraphData ? <>
          <Row className="my-3 align-items-center">
            {getLineAndBarChartRowCombined()}
          </Row>
          <Row>
            {/*{getDatedLineChartRow()}*/}
          </Row>
          {Array.isArray(selectedHeaderButtons) && selectedHeaderButtons.length > 0 && (
              <Row>
                {getPieChartRow()}
              </Row>
          )}
          {geographyOrDate === AmdrDataType.GEOGRAPHY && showMap &&
              <Row className="my-3 align-items-center">
                {getMapViewRow()}
              </Row>}
        </> : ""}
      </Container>
  );
};

export default AmdrReport;
