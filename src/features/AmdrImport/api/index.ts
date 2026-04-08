import api from "../../../api/axios";
import {PageableModel} from "../../../api/providers";
import {MetadataFileImportResponse} from "../../metaDataImport/type";
import {EntityTagMap} from "../../planSimulation/providers/types";
import {LocationNode,  AmdrImportResponse, AmdrImportResultsResponse, HeaderName} from "../type";
import dashBoardApi from "../../../api/dashboard-axios";

export const downloadAmdrImportTemplate = async (): Promise<BlobPart> => {
  const data = api
  .get<BlobPart>(`amdr/downloadAmdrImportTemplate`, {
    responseType: 'arraybuffer'
  })
  .then(res => res.data);
  return data;
};

export const getAmdrKeys = async (): Promise<string[]> => {
  const data = api
  .get<string[]>(`amdr/amdrKeys`)
  .then(res => res.data);
  return data;
};


export const uploadAmdrData = async (file: FormData): Promise<any> => {
  try {
    const response = await api.post('amdr/upload', file);
    return response.data;
  } catch (err) {
    console.error("uploadAmdrData error:", err);
    throw err; // Re-throw so the caller's `.catch()` can receive it
  }
};

export const uploadAmdrRawData = async (file: FormData): Promise<any> => {
  try {
    const response = await api.post('amdr/uploadRaw', file);
    return response.data;
  } catch (err) {
    console.error("uploadAmdrData error:", err);
    throw err; // Re-throw so the caller's `.catch()` can receive it
  }
};


export const getAmdrImportList = async (
    size: number,
    page: number,
    sortField?: string,
    direction?: boolean
): Promise<PageableModel<AmdrImportResponse>> => {
  const data = await api
  .get<PageableModel<AmdrImportResponse>>(
      `amdr/amdrImport?size=${size}&page=${page}&_summary=FALSE&root=true&sort=${sortField !== undefined ? sortField : ''},${
          direction ? 'asc' : 'desc'
      }`
  )
  .then(res => res.data);
  return data;
};
export const getAmdrImportResults = async (importId?: string): Promise<AmdrImportResultsResponse> => {
  console.log("importId",importId)
  const data = await api
  .get<AmdrImportResultsResponse>(
      "amdr/importResults" + (importId === undefined? "" : "?importId=" +importId)
  )
  .then(res => res.data);
  return data;
};


