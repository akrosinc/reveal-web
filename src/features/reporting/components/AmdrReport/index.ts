import {MapDataReportRequest, ReportLocationProperties} from "../../providers/types";
import {FeatureCollection, MultiPolygon, Point, Polygon} from "@turf/turf";
import {REPORTS} from "../../../../constants";
import api from "../../../../api/axios";
import dashBoardApi from "../../../../api/dashboard-axios";
import {FeatureSetResponse} from "./types";
const prodAPI = process.env.REACT_APP_API_URL === process.env.REACT_APP_DASHBOARD_API_URL ? api : dashBoardApi;

export const getAmdrMapReportData = async (
    parentLocationIdentifier: string|null,
    clickedColumn?:string
): Promise<FeatureSetResponse> => {
  const data = await prodAPI
  .get<any>(
      REPORTS +
      `/amdr/reportData?${
          parentLocationIdentifier !== null ? '&parentIdentifier=' + parentLocationIdentifier : ''
      }${clickedColumn ? '&clickedColumn=' + clickedColumn : ''}`
  )
  .then(response => response.data);
  return data;
};
