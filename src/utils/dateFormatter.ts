import Moment from 'moment';
import { getFromBrowser } from '.';

Moment.locale(getFromBrowser('locale') ?? 'en');

export const formatDate = (date?: Date) => {
  if (date !== undefined) {
    return Moment(date).format('lll');
  } else {
    return null;
  }
};
