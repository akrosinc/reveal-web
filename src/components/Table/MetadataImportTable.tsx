import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { ChangeEvent, useCallback } from 'react';
import { FormCheck, Table } from 'react-bootstrap';
import { useAppSelector } from '../../store/hooks';
import { t } from 'i18next';
import { Column, Row, useExpanded, useTable } from 'react-table';
import { MetadataFileImportResponse } from '../../features/metaDataImport/type';
import MetadataEntityTagTable from './MetadataEntityTagTable';
import { EntityTagResponse } from '../../features/planSimulation/providers/types';
import { TAG_ACCESS_OVERRIDE } from '../../constants';
import { useKeycloak } from '@react-keycloak/web';

interface Props {
  data: MetadataFileImportResponse[];
  sortHandler?: (sortValue: string, sortDirection: boolean) => void;
  clickHandler?: (identifier: any) => void;
  clickAccessor?: string;
  setMetadataList: (list: MetadataFileImportResponse[]) => void;
}

const MetadataImportTable = ({ data, setMetadataList }: Props) => {
  const isDarkMode = useAppSelector(state => state.darkMode.value);
  const { keycloak } = useKeycloak();
  const columnsForMetadataTables = React.useMemo<Column<EntityTagResponse>[]>(
    () => [
      {
        // Build our expander column
        id: 'expander', // Make sure it has an ID
        Cell: ({ row }: { row: any }) =>
          // Use the row.canExpand and row.getToggleRowExpandedProps prop getter
          // to build the toggle for expanding a row
          {
            return row.canExpand ? (
              <span
                {...row.getToggleRowExpandedProps({
                  style: {
                    // Use the row.depth property
                    // and paddingLeft to indicate the depth
                    // of the row
                    paddingLeft: `${row.depth}rem`,
                    paddingTop: '15px',
                    paddingBottom: '15px',
                    paddingRight: '15px'
                  }
                })}
              >
                {row.isExpanded ? (
                  <FontAwesomeIcon className="ms-1" icon="chevron-down" />
                ) : (
                  <FontAwesomeIcon className="ms-1" icon="chevron-right" />
                )}
              </span>
            ) : null;
          }
      },
      { Header: 'tag', accessor: 'tag' },
      { Header: 'type', accessor: 'valueType' },
      { Header: 'aggregate', accessor: 'aggregate' },
      { Header: 'owner', accessor: 'owner' },
      { Header: 'owners', accessor: 'owners' },
      { Header: 'isPublic', accessor: 'public' },
      { Header: 'orgGrants' },
      { Header: 'userGrants' },
      { Header: 'selected', accessor: 'selected' }
    ],
    []
  );

  const renderRowSubComponent = React.useCallback(
    (row: Row<MetadataFileImportResponse>) => {
      let original = row.original;
      let entityTagEvents = original.entityTagEvents;
      if (entityTagEvents)
        return (
          <MetadataEntityTagTable
            data={entityTagEvents}
            setMetadataList={setMetadataList}
            metadataList={data}
            columns={columnsForMetadataTables}
          />
        );
    },
    [data, setMetadataList, columnsForMetadataTables]
  );

  const columns = React.useMemo<Column<MetadataFileImportResponse>[]>(
    () => [
      {
        // Build our expander column
        id: 'expander', // Make sure it has an ID
        Cell: ({ row }: { row: any }) =>
          // Use the row.canExpand and row.getToggleRowExpandedProps prop getter
          // to build the toggle for expanding a row
          row.original.entityTagEvents && row.original.entityTagEvents.length > 0 ? (
            <span
              {...row.getToggleRowExpandedProps({
                style: {
                  // Use the row.depth property
                  // and paddingLeft to indicate the depth
                  // of the row
                  paddingLeft: `${row.depth}rem`,
                  paddingTop: '15px',
                  paddingBottom: '15px',
                  paddingRight: '15px'
                }
              })}
            >
              {row.isExpanded ? (
                <FontAwesomeIcon className="ms-1" icon="chevron-down" />
              ) : (
                <FontAwesomeIcon className="ms-1" icon="chevron-right" />
              )}
            </span>
          ) : null
      },
      { Header: 'fileName', accessor: 'filename' },
      { Header: 'uploadDate', accessor: 'uploadDatetime' },
      { Header: 'status', accessor: 'status' },
      { Header: 'uploadedBy', accessor: 'uploadedBy' },
      { Header: 'owner', accessor: 'owner' },
      { Header: 'owners', accessor: 'owners' },
      { Header: 'selected', accessor: 'selected' }
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable<MetadataFileImportResponse>(
    {
      columns,
      data,
      autoResetExpanded: false,
      manualExpandedKey: 'id'
    },
    useExpanded // Use the useExpanded plugin hook
  );

  const setSelected = useCallback(
    (evt: ChangeEvent<HTMLInputElement>, identifier: string) => {
      let response: MetadataFileImportResponse[] = [];

      data.forEach(value => {
        if (value.identifier === identifier) {
          value.selected = evt.currentTarget.checked;

          let entityTags: EntityTagResponse[] = [];
          value.entityTagEvents?.forEach(entityTag => {
            entityTags.push({
              tag: entityTag.tag,
              identifier: entityTag.identifier,
              selected: evt.currentTarget.checked,
              aggregate: entityTag.aggregate,
              valueType: entityTag.valueType,
              referencedTag: entityTag.referencedTag,
              metadataImportId: entityTag.metadataImportId,
              definition: entityTag.definition,
              created: entityTag.created,
              tagAccGrantsUser: entityTag.tagAccGrantsUser,
              tagAccGrantsOrganization: entityTag.tagAccGrantsOrganization,
              public: entityTag.public,
              owners: entityTag.owners,
              owner: entityTag.owner,
              children: entityTag.children?.map(child => {
                return {
                  tag: child.tag,
                  identifier: child.identifier,
                  selected: evt.currentTarget.checked,
                  aggregate: child.aggregate,
                  valueType: child.valueType,
                  children: child.children,
                  referencedTag: child.referencedTag,
                  metadataImportId: child.metadataImportId,
                  definition: child.definition,
                  created: child.created,
                  tagAccGrantsUser: child.tagAccGrantsUser,
                  tagAccGrantsOrganization: child.tagAccGrantsOrganization,
                  public: child.public,
                  owners: child.owners,
                  owner: child.owner
                };
              })
            });
          });

          value.entityTagEvents = entityTags;
        }
        response.push(value);
      });

      setMetadataList(response);
    },
    [data, setMetadataList]
  );

  return (
    <Table bordered responsive hover {...getTableProps()} variant={isDarkMode ? 'dark' : 'white'}>
      <thead className="border border-2">
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => {
              return (
                <th
                  id={column.id + '-header'}
                  style={{ width: column.id === 'expander' ? '37px' : 'auto' }}
                  {...column.getHeaderProps()}
                >
                  {column.Header !== undefined && column.Header !== null && column.id !== 'expander'
                    ? t('simulationPage.' + column.Header.toString())
                    : ''}
                </th>
              );
            })}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map(row => {
          prepareRow(row);
          return (
            <>
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => {
                  if (cell.column.id === 'selected') {
                    return (
                      <td {...cell.getCellProps()}>
                        {cell.row.original.owner || keycloak.hasRealmRole(TAG_ACCESS_OVERRIDE) ? (
                          <FormCheck
                            checked={cell.row.original.selected}
                            onChange={evt => setSelected(evt, row.original.identifier)}
                          />
                        ) : (
                          ''
                        )}
                      </td>
                    );
                  } else if (cell.column.id === 'owner') {
                    return <td {...cell.getCellProps()}>{cell.row.original.owner ? 'true' : 'false'}</td>;
                  } else if (cell.column.id === 'owners') {
                    return (
                      <td {...cell.getCellProps()}>
                        {cell.row.original.owners.map(owner => (
                          <p>{owner.username}</p>
                        ))}
                      </td>
                    );
                  } else {
                    return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
                  }
                })}
              </tr>

              {(row as any).isExpanded ? (
                <tr>
                  <td colSpan={row.cells?.length} style={{ backgroundColor: '#f3f8fc' }}>
                    {renderRowSubComponent(row)}
                  </td>
                </tr>
              ) : (
                ''
              )}
            </>
          );
        })}
      </tbody>
    </Table>
  );
};

export default MetadataImportTable;
