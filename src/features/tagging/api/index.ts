import api from "../../../api/axios";
import { PageableModel } from "../../../api/providers";
import { Tag } from "../providers/types";

export const getAllTags = (): Promise<PageableModel<Tag>> => {
    const data = api.get<PageableModel<Tag>>('').then(res => res.data);
    return data;
} 