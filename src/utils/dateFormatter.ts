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

// converts date object to plain UTC timezone string
export const toUtcString = (date: Date) => {
  let momentDate = Moment(date);
  return Moment(date).utc().add(momentDate.utcOffset(), 'm').format('yyyy-MM-DD');
}
