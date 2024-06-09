// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { useState } from 'react';
import { Button, Table } from 'react-bootstrap';
import { useAppSelector } from '../../store/hooks';
import { t } from 'i18next';
import { ComplexTagResponse } from '../../features/planSimulation/providers/types';
import { TagToDelete } from '../../features/tagging/components/ComplexTagging';
import { useKeycloak } from '@react-keycloak/web';
import { TAG_ACCESS_OVERRIDE } from '../../constants';

interface Props {
  columns: { name: string; sortValue?: string; accessor: string; key: string }[];
  data: ComplexTagResponse[] | undefined;
  clickHandler: (identifier: any) => void;
  showAccessPanelHandler: (tag: any) => void;
  showRemoveAccessPanelHandler: (tag: any) => void;
  setShowDeleteTagPanel: (show: boolean) => void;
  setSelectedTagToDelete: (tag: TagToDelete) => void;
}

//TODO: Complete sorting
const ComplexTagTable = ({
  columns,
  data,
  clickHandler,
  showAccessPanelHandler,
  setShowDeleteTagPanel,
  setSelectedTagToDelete,
  showRemoveAccessPanelHandler
}: Props) => {
  const { keycloak } = useKeycloak();
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

                    if (el.accessor === 'complexTagVariables') {
                      return (
                        <td key={index}>
                          <Button onClick={() => clickHandler(dataEl)}>{'View Variables'}</Button>
                        </td>
                      );
                    } else if (el.accessor === 'access') {
                      return (
                        <td key={index}>
                          {dataEl['owner'] || keycloak.hasRealmRole(TAG_ACCESS_OVERRIDE) ? (
                            <Button
                              onClick={() => {
                                if (el.accessor) {
                                  showAccessPanelHandler(dataEl);
                                }
                              }}
                            >
                              {'Grant Access'}
                            </Button>
                          ) : null}
                        </td>
                      );
                    } else if (el.accessor === 'removeAccess') {
                      return (
                        <td key={index}>
                          {dataEl['owner'] || keycloak.hasRealmRole(TAG_ACCESS_OVERRIDE) ? (
                            <Button
                              variant={'outline-primary'}
                              onClick={() => {
                                if (el.accessor) {
                                  showRemoveAccessPanelHandler(dataEl);
                                }
                              }}
                            >
                              {'Remove Access'}
                            </Button>
                          ) : null}
                        </td>
                      );
                    } else if (el.accessor === 'delete') {
                      return (
                        <td key={index}>
                          {dataEl['owner'] || keycloak.hasRealmRole(TAG_ACCESS_OVERRIDE) ? (
                            <Button
                              onClick={() => {
                                if (el.accessor) {
                                  console.log('dataEl', dataEl);
                                  setSelectedTagToDelete({
                                    id: dataEl['id'] as string,
                                    type: 'ComplexTag',
                                    tag: dataEl['tagName'] as string
                                  });
                                  setShowDeleteTagPanel(true);
                                }
                              }}
                            >
                              {'Delete Tag'}
                            </Button>
                          ) : null}
                        </td>
                      );
                    }
                    if (el.accessor === 'owners') {
                      return (
                        <td key={index}>
                          {dataEl['owners'].map((owner: any) => (
                            <p>{owner.username}</p>
                          ))}
                        </td>
                      );
                    } else {
                      return <td key={index}>{val?.toString()}</td>;
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
