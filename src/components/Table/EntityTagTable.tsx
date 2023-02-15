import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import moment from 'moment';
import { useState } from 'react';
import { Button, Table } from 'react-bootstrap';
import { useAppSelector } from '../../store/hooks';
import { formatDate } from '../../utils';
import { t } from "i18next";
import { TagUpdateRequest } from '../../features/tagging/providers/types';

interface Props {
  columns: { name: string; sortValue?: string; accessor?: string; key?: string }[];
  data: any[];
  sortHandler?: (sortValue: string, sortDirection: boolean) => void;
  clickHandler?: (identifier: any) => void;
  clickAccessor?: string;
  updateTag: (tag: TagUpdateRequest) => void;
}

const DATE_FORMATS = [
  moment.ISO_8601,
  moment.defaultFormat,
  moment.defaultFormatUtc,
  moment.defaultFormatUtc,
  'lll',
  'LLL',
  'll',
  'LL'
];

const EntityTagTable = ({ columns, data, sortHandler, clickHandler, clickAccessor, updateTag }: Props) => {
  const [sortDirection, setSortDirection] = useState(false);
  const [activeSortField, setActiveSortField] = useState('');
  const isDarkMode = useAppSelector(state => state.darkMode.value);

  return (
    <Table bordered responsive hover variant={isDarkMode ? 'dark' : 'white'}>
      <thead className="border border-2">
        <tr>
          {columns.map((el, index) => (
            <th
              key={index}
              onClick={() => {
                if (el.sortValue && sortHandler) {
                  setSortDirection(!sortDirection);
                  setActiveSortField(el.name);
                  sortHandler(el.sortValue, sortDirection);
                }
              }}
            >
              {t('reportPage.table.' + el.name)}
              {activeSortField === el.name ? (
                sortDirection ? (
                  <FontAwesomeIcon className="ms-2" icon="sort-up" />
                ) : (
                  <FontAwesomeIcon className="ms-2" icon="sort-down" />
                )
              ) : el.sortValue ? (
                <FontAwesomeIcon className="ms-2" icon="sort" />
              ) : null}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((dataEl, index) => {
          return (
            <tr
              key={index}
              onClick={() => {
                if (clickHandler) {
                  //if there is no clickAccessor set return object of the clicked row
                  if (clickAccessor) {
                    clickHandler(dataEl[clickAccessor]);
                  } else {
                    clickHandler(dataEl);
                  }
                }
              }}
            >
              {columns.map((el, index) => {
                if (el.accessor) {
                  if (el.key) {
                    const key = el.key;
                    //check if its and array or just an object
                    if (dataEl[el.accessor].length) {
                      return <td key={index}>{dataEl[el.accessor].map((obj: any) => obj[key]).toString()}</td>;
                    }
                    return <td key={index}>{dataEl[el.accessor][key]}</td>;
                  } else {
                    //check if its a date field and format if so
                    if (moment(dataEl[el.accessor], DATE_FORMATS, true).isValid()) {
                      return <td key={index}>{formatDate(dataEl[el.accessor])}</td>;
                    }
                    if (el.accessor === 'simulationDisplay') {
                      return <td key={index}><Button onClick={() => {
                        if (el.accessor) {
                          dataEl[el.accessor] = !dataEl[el.accessor];
                          updateTag(dataEl);
                        }
                      }}>{dataEl[el.accessor]?.toString()}</Button></td>;
                    } else {
                      return <td key={index}>{dataEl[el.accessor]?.toString()}</td>;
                    }
                  }
                }
                return null;
              })}
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

export default EntityTagTable;
