import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import moment from 'moment';
import React, { useState } from 'react';
import { Table } from 'react-bootstrap';
import { useAppSelector } from '../../store/hooks';
import { formatDate } from '../../utils';

interface Props {
  columns: { name: string; sortValue?: string; accessor?: string; key?: string }[];
  data: any[];
  sortHandler?: (sortValue: string, sortDirection: boolean) => void;
  clickHandler?: (identifier: any) => void;
  clickAccessor?: string;
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

const ResourcePlanningTable = ({ columns, data, sortHandler, clickHandler, clickAccessor }: Props) => {
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
              {el.name}
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
                    return <td key={index}>{dataEl[el.accessor]?.toString()}</td>;
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

export default ResourcePlanningTable;
