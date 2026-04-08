import {REPORTS} from "../../../../../constants";
import api from "../../../../../api/axios";
import dashBoardApi from "../../../../../api/dashboard-axios";
import {
  AmdrColumnType,
  AmdrDateModes, AmdrDrugYearlyMonthlyLocational,
  AmdrHaplotypeYearlyMonthlyLocational,
  AmdrLandPageResponse,
  FeatureSetResponse, HslColorMap
} from "../types";
import {HeaderName, LocationNode, LocationNodeDetails} from "../../../../AmdrImport/type";
// import {AmdrColumnType, HeaderName, LocationNode} from "../../../../AmdrImport/type";

const prodAPI = process.env.REACT_APP_API_URL === process.env.REACT_APP_DASHBOARD_API_URL ? api : dashBoardApi;

export const getLocationTree = async (): Promise<LocationNodeDetails> => {
  const data = dashBoardApi
  .get<LocationNodeDetails>(`/dashboard/amdr/locationTree`)
  .then(res => res.data);
  return data;
}


export const getAmdrColumns = async (): Promise<Record<AmdrColumnType, {[key:string]: HeaderName}>> => {
  const data = dashBoardApi
  .get<Record<AmdrColumnType, {[key:string]: HeaderName}>>(`/dashboard/amdr/reportHeadings`)
  .then(res => res.data);
  return data;
};

export const getAmdrMapReportData = async (
    parentLocationIdentifier: string|null,
    dashboardView:AmdrColumnType.DRUG|AmdrColumnType.HAPLOTYPE
): Promise<FeatureSetResponse> => {
  console.log("calling with dashboardViewapi", dashboardView)
  let url = REPORTS +
      `/amdr/reportData?${
          (parentLocationIdentifier !== null ? '&parentIdentifier=' +
               parentLocationIdentifier  : '') + '&dashboardView=' + dashboardView }`;
  const data = await prodAPI
  .get<any>(
      url
  )
  .then(response => response.data);
  return data;
};

export const getColorMap = async (): Promise<HslColorMap> => {
  const data = await prodAPI
  .get<any>(
      REPORTS +
      `/amdr/colorMap`
  )
  .then(response => response.data);
  return data;
};

export const getAmdrMapReportDataDate = async (
    parentLocationIdentifier: string|null,
    dashboardView:AmdrColumnType,
    locationList:string[],
    amdrDateModes:AmdrDateModes
): Promise<FeatureSetResponse> => {
  console.log("calling with dashboardViewapi", dashboardView)
  const data = await prodAPI
  .post<any>(
      REPORTS +
      `/amdr/reportData/date?${
        '&dashboardView=' + dashboardView + "&amdrDateModes="+amdrDateModes}`,
      locationList
  )
  .then(response => response.data);
  return data;
};

export const getAmdrMapReportDataDateLocationDrug = async (
    locationList:string[],
    amdrDateModes:AmdrDateModes
): Promise<AmdrDrugYearlyMonthlyLocational[]> => {

  const data = await prodAPI
  .post<any>(
      REPORTS +
      `/amdr/reportData/date/location/drug?${
           "&amdrDateModes="+amdrDateModes}`,
      locationList
  )
  .then(response => response.data);
  return data;
};

export const getAmdrMapReportDataDateLocationHaplotype = async (
    locationList:string[],
    amdrDateModes:AmdrDateModes
): Promise<AmdrHaplotypeYearlyMonthlyLocational[]> => {

  const data = await prodAPI
  .post<any>(
      REPORTS +
      `/amdr/reportData/date/location/haplotype?${
          "&amdrDateModes="+amdrDateModes}`,
      locationList
  )
  .then(response => response.data);
  return data;
};

export const getLandingPageResponse = async (): Promise<AmdrLandPageResponse> => {
  const data = await prodAPI
  .get<AmdrLandPageResponse>(REPORTS +`/amdr/landingPageData`)
  .then(response => response.data);
  return data;
};
