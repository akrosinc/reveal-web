import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import moment from 'moment';
import { useState } from 'react';
import { Button, Table } from 'react-bootstrap';
import { useAppSelector } from '../../store/hooks';
import { t } from 'i18next';
import { ComplexTagResponse } from '../../features/tagging/components/ComplexTagging';

interface Props {
  columns: { name: string; sortValue?: string; accessor: string; key: string }[];
  data: ComplexTagResponse[] | undefined;
  clickHandler: (identifier: any) => void;
}

const ComplexTagTable = ({ columns, data, clickHandler }: Props) => {
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
                // if (el.sortValue && sortHandler) {
                //   setSortDirection(!sortDirection);
                //   setActiveSortField(el.name);
                //   sortHandler(el.sortValue, sortDirection);
                // }
              }}
            >
              {t('entityTags.' + el.name)}
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
        {data &&
          data.map((dataEl: any, index) => {
            return (
              <tr key={index}>
                {columns.map((el, index) => {
                  if (el.accessor) {
                    let val = dataEl[el.accessor];

                    if (Array.isArray(val) && val.length) {
                      return (
                        <td key={index}>
                          <Button onClick={() => clickHandler(dataEl)}>{'View Variables'}</Button>
                        </td>
                      );
                    } else {
                      return <td key={index}>{val.toString()}</td>;
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

export default ComplexTagTable;
