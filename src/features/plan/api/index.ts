import api from '../../../api/axios';
import { PageableModel } from '../../../api/providers';
import { PLAN } from '../../../constants';
import { PlanModel } from '../providers/types';

export const getPlanList = async (
    size: number,
    page: number,
    search?: string,
    sortField?: string,
    direction?: boolean
  ): Promise<PageableModel<PlanModel>> => {
    const data = await api
      .get<PageableModel<PlanModel>>(
        PLAN +
          `?search=${search !== undefined ? search : ''}&size=${size}&page=${page}&sort=${
            sortField !== undefined ? sortField : ''
          },${direction ? 'asc' : 'desc'}`
      )
      .then(response => response.data);
    return data;
  };