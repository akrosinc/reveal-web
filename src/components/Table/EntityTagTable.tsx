import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import moment from 'moment';
import { useState } from 'react';
import { Button, Table } from 'react-bootstrap';
import { useAppSelector } from '../../store/hooks';
import { formatDate } from '../../utils';
import { t } from 'i18next';
import { TagUpdateRequest } from '../../features/tagging/providers/types';
import { TagToDelete } from '../../features/tagging/components/ComplexTagging';
import { TAG_ACCESS_OVERRIDE } from '../../constants';
import { useKeycloak } from '@react-keycloak/web';
import { EntityTagResponse } from '../../features/planSimulation/providers/types';

interface Props {
  columns: { name: string; sortValue?: string; accessor?: string; key?: string }[];
  data: any[];
  sortHandler?: (sortValue: string, sortDirection: boolean) => void;
  clickHandler?: (identifier: any) => void;
  clickAccessor?: string;
  updateTag: (tag: TagUpdateRequest) => void;
  showAccessPanelHandler: (tag: EntityTagResponse) => void;
  showRemoveAccessPanelHandler: (tag: any) => void;
  setShowDeleteTagPanel: (show: boolean) => void;
  setSelectedTagToDelete: (tag: TagToDelete) => void;
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

const EntityTagTable = ({
  columns,
  data,
  sortHandler,
  clickHandler,
  clickAccessor,
  updateTag,
  showAccessPanelHandler,
  setShowDeleteTagPanel,
  setSelectedTagToDelete,
  showRemoveAccessPanelHandler
}: Props) => {
  const [sortDirection, setSortDirection] = useState(false);
  const [activeSortField, setActiveSortField] = useState('');
  const isDarkMode = useAppSelector(state => state.darkMode.value);
  const { keycloak } = useKeycloak();

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
                      return (
                        <td key={index}>
                          <Button
                            onClick={() => {
                              if (el.accessor) {
                                dataEl[el.accessor] = !dataEl[el.accessor];
                                updateTag(dataEl);
                              }
                            }}
                          >
                            {dataEl[el.accessor]?.toString()}
                          </Button>
                        </td>
                      );
                    } else if (el.name === 'access') {
                      return dataEl['owner'] || keycloak.hasRealmRole(TAG_ACCESS_OVERRIDE) ? (
                        <td key={index}>
                          <Button
                            onClick={() => {
                              if (el.accessor) {
                                console.log(dataEl);
                                let entityTag = dataEl as EntityTagResponse;

                                let entitYobj = new EntityTagResponse(
                                  entityTag.identifier,
                                  entityTag.tag,
                                  entityTag.owner,
                                  entityTag.owners,
                                  entityTag.definition,
                                  entityTag.valueType,
                                  entityTag.aggregate,
                                  entityTag.created,
                                  entityTag.metadataImportId,
                                  entityTag.referencedTag,
                                  entityTag.tagAccGrantsOrganization,
                                  entityTag.tagAccGrantsUser,
                                  entityTag.public,
                                  entityTag.children,
                                  entityTag.selected,
                                  entityTag.resultingOrgs,
                                  entityTag.resultingUsers
                                );

                                console.log('is it?', entitYobj instanceof EntityTagResponse);
                                showAccessPanelHandler(entitYobj);
                              }
                            }}
                          >
                            {'Grant Access'}
                          </Button>
                        </td>
                      ) : null;
                    } else if (el.name === 'removeAccess') {
                      return dataEl['owner'] || keycloak.hasRealmRole(TAG_ACCESS_OVERRIDE) ? (
                        <td key={index}>
                          <Button
                            variant={'outline-primary'}
                            onClick={() => {
                              if (el.accessor) {
                                console.log(dataEl);
                                let entityTag = dataEl as EntityTagResponse;

                                let entitYobj = new EntityTagResponse(
                                  entityTag.identifier,
                                  entityTag.tag,
                                  entityTag.owner,
                                  entityTag.owners,
                                  entityTag.definition,
                                  entityTag.valueType,
                                  entityTag.aggregate,
                                  entityTag.created,
                                  entityTag.metadataImportId,
                                  entityTag.referencedTag,
                                  entityTag.tagAccGrantsOrganization,
                                  entityTag.tagAccGrantsUser,
                                  entityTag.public,
                                  entityTag.children,
                                  entityTag.selected,
                                  entityTag.resultingOrgs,
                                  entityTag.resultingUsers
                                );

                                showRemoveAccessPanelHandler(entitYobj);
                              }
                            }}
                          >
                            {'Remove Access'}
                          </Button>
                        </td>
                      ) : null;
                    } else if (el.name === 'owners') {
                      return (
                        <td key={index}>
                          {dataEl['owners'].map((owner: any) => (
                            <p>{owner.username}</p>
                          ))}
                        </td>
                      );
                    } else if (el.accessor === 'delete') {
                      return (
                        <td key={index}>
                          {(dataEl['owner'] || keycloak.hasRealmRole(TAG_ACCESS_OVERRIDE)) && !dataEl['aggregate'] ? (
                            <Button
                              disabled={dataEl['deleting']}
                              onClick={() => {
                                if (el.accessor) {
                                  console.log('dataEl', dataEl);

                                  setSelectedTagToDelete({
                                    id: dataEl['identifier'] as string,
                                    type: 'SimpleTag',
                                    tag: dataEl['tag'] as string,
                                    children: (dataEl['children'] as EntityTagResponse[]).map(tag => {
                                      return {
                                        id: tag['identifier'] as string,
                                        type: 'SimpleTag',
                                        tag: tag['tag'] as string
                                      };
                                    })
                                  });
                                  setShowDeleteTagPanel(true);
                                }
                              }}
                            >
                              {dataEl['deleting'] ? 'Deleting Tag' : 'Delete Tag'}
                            </Button>
                          ) : null}
                        </td>
                      );
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
