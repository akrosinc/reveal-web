import React, { ChangeEvent, useCallback } from 'react';
import { Col, FormCheck, Row, Table } from 'react-bootstrap';
import { useAppSelector } from '../../../../../store/hooks';
import { Column, useExpanded, useTable } from 'react-table';
import { MetadataFileImportResponse } from '../../../../metaDataImport/type';
import { EntityTagResponse } from '../../../../planSimulation/providers/types';
import { useTranslation } from 'react-i18next';

interface Props {
    data: EntityTagResponse[];
    setMetadataList: (list: MetadataFileImportResponse[]) => void;
    metadataList: MetadataFileImportResponse[];
    columns: Column<EntityTagResponse>[];
}

const DatasetEntityTagTable = ({ data, setMetadataList, metadataList, columns }: Props) => {
    const isDarkMode = useAppSelector((state: any) => state.darkMode.value);
    const { t } = useTranslation();

    const mapRows = useCallback((row: EntityTagResponse): EntityTagResponse[] => {
        if (row.children) {
            return row.children;
        }
        return [];
    }, []);

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable<EntityTagResponse>(
        {
            columns,
            data,
            getSubRows: (row: EntityTagResponse) => mapRows(row)
        },
        useExpanded
    );

    const setSelected = useCallback(
        (evt: ChangeEvent<HTMLInputElement>, identifier: string) => {
            let response: MetadataFileImportResponse[] = [];

            metadataList.forEach(value => {
                let entityTags: EntityTagResponse[] = [];
                value.entityTagEvents?.forEach((entityTag: EntityTagResponse) => {
                    let selectedBool: boolean | undefined = entityTag.selected;
                    if (entityTag.identifier === identifier) {
                        selectedBool = evt.currentTarget.checked;
                        if (!selectedBool) {
                            value.selected = false;
                        }
                    }

                    entityTags.push({
                        ...entityTag,
                        selected: selectedBool,
                        children: entityTag.children?.map((child: EntityTagResponse) => ({
                            ...child,
                            selected: selectedBool
                        }))
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
        <Table bordered responsive hover {...getTableProps()} variant={isDarkMode ? 'dark' : 'white'} className="m-0">
            <thead className="border border-2">
                {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()} style={{ backgroundColor: '#edf4fc' }}>
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
                        <tr {...row.getRowProps()} style={{ backgroundColor: '#edf4fc' }}>
                            {row.cells.map(cell => {
                                const cellData = cell.row.original;
                                return cell.column.id === 'selected' ? (
                                    <td {...cell.getCellProps()}>
                                        {cellData.owner ? (
                                            <FormCheck
                                                checked={cellData.selected}
                                                disabled={cellData.aggregate}
                                                onChange={evt => setSelected(evt, row.original.identifier)}
                                            />
                                        ) : null}
                                    </td>
                                ) : cell.column.id === 'orgGrants' ? (
                                    <td {...cell.getCellProps()}>
                                        {cellData.tagAccGrantsOrganization?.map(org => (
                                            <Row key={org.id}>
                                                <Col>
                                                    <div>{org.name}</div>
                                                </Col>
                                            </Row>
                                        ))}
                                    </td>
                                ) : cell.column.id === 'userGrants' ? (
                                    <td {...cell.getCellProps()}>
                                        {cellData.tagAccGrantsUser?.map(user => (
                                            <Row key={user.id}>
                                                <Col>
                                                    <div>{user.username}</div>
                                                </Col>
                                            </Row>
                                        ))}
                                    </td>
                                ) : cell.column.id === 'resultingOrgGrants' ? (
                                    <td {...cell.getCellProps()}>
                                        {cellData.resultingOrgs?.map(org => (
                                            <Row key={org.id}>
                                                <Col>
                                                    <div>{org.name}</div>
                                                </Col>
                                            </Row>
                                        ))}
                                    </td>
                                ) : cell.column.id === 'resultingUserGrants' ? (
                                    <td {...cell.getCellProps()}>
                                        {cellData.resultingUsers?.map(user => (
                                            <Row key={user.id}>
                                                <Col>
                                                    <div>{user.username}</div>
                                                </Col>
                                            </Row>
                                        ))}
                                    </td>
                                ) : cell.column.id === 'public' || cell.column.id === 'isPublic' ? (
                                    <td {...cell.getCellProps()}>{cellData.public ? 'true' : 'false'}</td>
                                ) : cell.column.id === 'aggregate' ? (
                                    <td {...cell.getCellProps()}>{cellData.aggregate ? 'true' : 'false'}</td>
                                ) : cell.column.id === 'owner' ? (
                                    <td {...cell.getCellProps()}>{cellData.owner ? 'true' : 'false'}</td>
                                ) : cell.column.id === 'owners' ? (
                                    <td {...cell.getCellProps()}>
                                        {cellData.owners?.map(owner => (
                                            <p key={owner.id}>{owner.username}</p>
                                        ))}
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

export default DatasetEntityTagTable;
