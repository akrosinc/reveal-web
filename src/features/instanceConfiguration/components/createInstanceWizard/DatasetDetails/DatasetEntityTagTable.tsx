import React, { ChangeEvent, useCallback } from 'react';
import { Col, FormCheck, Row, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus } from '@fortawesome/free-solid-svg-icons';
import { useAppSelector } from '../../../../../store/hooks';
import { Column, useTable } from 'react-table';
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

    const flattenedData = React.useMemo(() => {
        // USER Request: "only 1st element hiv_prevalance and covid_prevalance should be shown... sum,max,min etc should not be rendered"
        return data.map(parent => ({ ...parent, isChild: false }));
    }, [data]);

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable<EntityTagResponse & { isChild?: boolean }>(
        {
            columns,
            data: flattenedData,
        }
    );

    const setSelected = useCallback(
        (evt: ChangeEvent<HTMLInputElement>, identifier: string) => {
            let response: MetadataFileImportResponse[] = [];

            metadataList.forEach(value => {
                let entityTags: EntityTagResponse[] = [];
                value.entityTagEvents?.forEach((entityTag: EntityTagResponse) => {
                    let updatedEntityTag = { ...entityTag };

                    // Handle Parent (Aggregated Tag)
                    if (updatedEntityTag.identifier === identifier && updatedEntityTag.children && updatedEntityTag.children.length > 0) {
                        // If user clicks parent, we toggle all children
                        updatedEntityTag.selected = evt.currentTarget.checked;
                        updatedEntityTag.children = updatedEntityTag.children.map(child => ({
                            ...child,
                            selected: evt.currentTarget.checked
                        }));
                    } 
                    // Handle Child (Leaf Tag)
                    else {
                        let childFound = false;
                        if (updatedEntityTag.children) {
                            updatedEntityTag.children = updatedEntityTag.children.map(child => {
                                if (child.identifier === identifier) {
                                    childFound = true;
                                    return { ...child, selected: evt.currentTarget.checked };
                                }
                                return child;
                            });
                        }

                        if (updatedEntityTag.identifier === identifier) {
                            updatedEntityTag.selected = evt.currentTarget.checked;
                        }

                        // Update parent selected status based on children
                        if (childFound && updatedEntityTag.children) {
                            const allSelected = updatedEntityTag.children.every(c => c.selected);
                            updatedEntityTag.selected = allSelected;
                        }
                    }

                    entityTags.push(updatedEntityTag);
                });

                // Update file-level selection if all tags are selected
                const allTagsSelected = entityTags.length > 0 && entityTags.every(tag => tag.selected);
                value.selected = allTagsSelected;
                
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
                                        style={{ width: column.id === 'selected' ? '180px' : 'auto' }}
                                        {...column.getHeaderProps()}
                                    >
                                        {column.id === 'selected' 
                                            ? t('simulationPage.selected') 
                                            : column.Header !== undefined && column.Header !== null && column.id !== 'expander'
                                                ? t('simulationPage.' + column.Header.toString())
                                                : ''}
                                    </th>
                            );
                        })}
                    </tr>
                ))}
            </thead>
            <tbody {...getTableBodyProps()}>
                {rows.map((row) => {
                    prepareRow(row);
                    const cellData = row.original;
                    return (
                        <tr {...row.getRowProps()} style={{ backgroundColor: isDarkMode ? '#212529' : 'white' }}>
                            {row.cells.map(cell => {
                                return cell.column.id === 'selected' ? (
                                    <td {...cell.getCellProps()}>
                                        {/* 
                                            Show checkbox for main parent tags
                                            USER Request: "only 1st element hiv_prevalance and covid_prevalance should be shown... we should be able to select those"
                                        */}
                                        <FormCheck
                                            checked={cellData.selected}
                                            onChange={evt => setSelected(evt, row.original.identifier)}
                                        />
                                    </td>
                                ) : cell.column.id === 'tag' ? (
                                    <td {...cell.getCellProps()}>
                                        {cell.render('Cell')}
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
