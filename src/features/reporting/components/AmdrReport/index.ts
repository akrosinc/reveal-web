import {REPORTS} from "../../../../constants";
import api from "../../../../api/axios";
import dashBoardApi from "../../../../api/dashboard-axios";
import {AmdrLandPageResponse, FeatureSetResponse} from "./types";
import {AmdrColumnType} from "../../../AmdrImport/type";

const prodAPI = process.env.REACT_APP_API_URL === process.env.REACT_APP_DASHBOARD_API_URL ? api : dashBoardApi;

export const getAmdrMapReportData = async (
    parentLocationIdentifier: string|null,
    dashboardView:AmdrColumnType.DRUG|AmdrColumnType.HAPLOTYPE
): Promise<FeatureSetResponse> => {
  console.log("calling with dashboardViewapi", dashboardView)
  const data = await prodAPI
  .get<any>(
      REPORTS +
      `/amdr/reportData?${
          parentLocationIdentifier !== null ? '&parentIdentifier=' + parentLocationIdentifier : ''
      }${dashboardView === AmdrColumnType.HAPLOTYPE ? '&clickedColumn=' + dashboardView : ''}`
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
