// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { useState } from 'react';
import { Button, Table } from 'react-bootstrap';
import { useAppSelector } from '../../store/hooks';
import { t } from 'i18next';
import { ComplexTagResponse } from '../../features/planSimulation/providers/types';

interface Props {
  columns: { name: string; sortValue?: string; accessor: string; key: string }[];
  data: ComplexTagResponse[] | undefined;
  clickHandler: (identifier: any) => void;
  showAccessPanelHandler: (tag: any) => void;
}

//TODO: Complete sorting
const ComplexTagTable = ({ columns, data, clickHandler, showAccessPanelHandler }: Props) => {
  const isDarkMode = useAppSelector(state => state.darkMode.value);

  return (
    <Table bordered responsive hover variant={isDarkMode ? 'dark' : 'white'}>
      <thead className="border border-2">
        <tr>
          {columns.map((el, index) => (
            <th key={index} onClick={() => {}}>
              {t('entityTags.' + el.name)}
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
                    } else if (el.accessor === 'access') {
                      return (
                        <td key={index}>
                          <Button
                            onClick={() => {
                              if (el.accessor) {
                                showAccessPanelHandler(dataEl);
                              }
                            }}
                          >
                            {'Grant Access'}
                          </Button>
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
