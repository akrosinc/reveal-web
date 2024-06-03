import React, { ChangeEvent, useCallback } from 'react';
import { Col, FormCheck, Row, Table } from 'react-bootstrap';
import { useAppSelector } from '../../store/hooks';
import { t } from 'i18next';
import { Column, useExpanded, useTable } from 'react-table';
import { MetadataFileImportResponse } from '../../features/metaDataImport/type';
import { BaseTag, EntityTagResponse } from '../../features/planSimulation/providers/types';

interface Props {
  data: BaseTag[];
  setMetadataList: (list: MetadataFileImportResponse[]) => void;
  metadataList: MetadataFileImportResponse[];
  columns: Column<BaseTag>[];
}

const MetadataEntityTagTable2 = ({ data, setMetadataList, metadataList, columns }: Props) => {
  const isDarkMode = useAppSelector(state => state.darkMode.value);

  const mapRows = useCallback((row: BaseTag): EntityTagResponse[] => {
    if (row instanceof EntityTagResponse) {
      if (row.children) {
        return row.children;
      }
    }
    return [];
  }, []);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable<BaseTag>(
    {
      columns,
      data,
      getSubRows: (row: BaseTag) => mapRows(row)
    },
    useExpanded // Use the useExpanded plugin hook
  );

  const setSelected = useCallback(
    (evt: ChangeEvent<HTMLInputElement>, identifier: string) => {
      let response: MetadataFileImportResponse[] = [];

      metadataList.forEach(value => {
        let entityTags: EntityTagResponse[] = [];
        value.entityTagEvents?.forEach(entityTag => {
          let selectedBool: boolean | undefined = entityTag.selected;
          if (entityTag.identifier === identifier) {
            selectedBool = evt.currentTarget.checked;
            if (!selectedBool) {
              value.selected = false;
            }
          }

          entityTags.push({
            tag: entityTag.tag,
            identifier: entityTag.identifier,
            selected: selectedBool,
            aggregate: entityTag.aggregate,
            valueType: entityTag.valueType,
            referencedTag: entityTag.referencedTag,
            metadataImportId: entityTag.metadataImportId,
            definition: entityTag.definition,
            created: entityTag.created,
            tagAccGrantsUser: entityTag.tagAccGrantsUser,
            tagAccGrantsOrganization: entityTag.tagAccGrantsOrganization,
            public: entityTag.public,
            children: entityTag.children?.map(child => {
              return {
                tag: child.tag,
                identifier: child.identifier,
                selected: selectedBool,
                aggregate: child.aggregate,
                valueType: child.valueType,
                children: child.children,
                referencedTag: child.referencedTag,
                metadataImportId: child.metadataImportId,
                definition: child.definition,
                created: child.created,
                tagAccGrantsUser: child.tagAccGrantsUser,
                tagAccGrantsOrganization: child.tagAccGrantsOrganization,
                public: child.public
              };
            })
          });
        });
        if (entityTags.filter(entityTag => !entityTag.selected).length === 0 && entityTags.length > 0) {
          value.selected = true;
        }
        value.entityTagEvents = entityTags;
        response.push(value);
      });

      setMetadataList(response);
    },

    [metadataList, setMetadataList]
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
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => {
                const cellData = cell.row.original;
                return cell.column.id === 'selected' ? (
                  <td {...cell.getCellProps()}>
                    {' '}
                    <FormCheck
                      checked={cellData.selected}
                      disabled={cellData instanceof EntityTagResponse && (cellData as EntityTagResponse).aggregate}
                      onChange={evt => setSelected(evt, row.original.identifier)}
                    />
                  </td>
                ) : cell.column.id === 'orgGrants' ? (
                  <td {...cell.getCellProps()}>
                    {cellData.tagAccGrantsOrganization?.map(org => (
                      <Row>
                        <Col>
                          <div>{org.name}</div>
                        </Col>
                      </Row>
                    ))}
                  </td>
                ) : cell.column.id === 'userGrants' ? (
                  <td {...cell.getCellProps()}>
                    {cellData.tagAccGrantsUser?.map(org => (
                      <Row>
                        <Col>
                          <div>{org.username}</div>
                        </Col>
                      </Row>
                    ))}
                  </td>
                ) : cell.column.id === 'resultingOrgGrants' ? (
                  <td {...cell.getCellProps()}>
                    {cellData.resultingOrgs?.map(org => (
                      <Row>
                        <Col>
                          <div>{org.name}</div>
                        </Col>
                      </Row>
                    ))}
                  </td>
                ) : cell.column.id === 'resultingUserGrants' ? (
                  <td {...cell.getCellProps()}>
                    {cellData.resultingUsers?.map(org => (
                      <Row>
                        <Col>
                          <div>{org.username}</div>
                        </Col>
                      </Row>
                    ))}
                  </td>
                ) : cell.column.id === 'public' ? (
                  <td {...cell.getCellProps()}>{cellData.public ? 'true' : 'false'}</td>
                ) : cell.column.id === 'aggregate' ? (
                  <td {...cell.getCellProps()}>
                    {cellData instanceof EntityTagResponse && (cellData as EntityTagResponse).aggregate
                      ? 'true'
                      : 'false'}
                  </td>
                ) : (
                  <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

export default MetadataEntityTagTable2;
