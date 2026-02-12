import React, { ChangeEvent, useCallback } from 'react';
import { Col, FormCheck, Row, Table } from 'react-bootstrap';
import { useAppSelector } from '../../../../../store/hooks';
import { Column, useTable } from 'react-table';
import { MetadataFileImportResponse } from '../../../../metaDataImport/type';
import { EntityTagResponse } from '../../../../planSimulation/providers/types';

interface Props {
    data: EntityTagResponse[];
    setMetadataList: (list: MetadataFileImportResponse[]) => void;
    metadataList: MetadataFileImportResponse[];
    columns: Column<EntityTagResponse>[];
}

const DatasetEntityTagTable = ({ data, setMetadataList, metadataList, columns }: Props) => {
    const isDarkMode = useAppSelector((state: any) => state.darkMode.value);

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable<EntityTagResponse>(
        {
            columns,
            data
        }
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
                        {headerGroup.headers.map(column => (
                            <th
                                id={column.id + '-header'}
                                style={{ width: column.id === 'expander' ? '37px' : 'auto' }}
                                {...column.getHeaderProps()}
                            >
                                {column.Header !== undefined && column.Header !== null && column.id !== 'expander'
                                    ? column.Header.toString()
                                    : ''}
                            </th>
                        ))}
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
                                if (cell.column.id === 'Selection') {
                                    return (
                                        <td {...cell.getCellProps()}>
                                            <FormCheck
                                                checked={cellData.selected}
                                                disabled={cellData.aggregate}
                                                onChange={evt => setSelected(evt, row.original.identifier)}
                                            />
                                        </td>
                                    );
                                } else if (cell.column.id === 'orgGrants') {
                                    return (
                                        <td {...cell.getCellProps()}>
                                            {cellData.tagAccGrantsOrganization?.map((org: any) => (
                                                <Row key={org.id}><Col><div>{org.name}</div></Col></Row>
                                            ))}
                                        </td>
                                    );
                                } else if (cell.column.id === 'userGrants') {
                                    return (
                                        <td {...cell.getCellProps()}>
                                            {cellData.tagAccGrantsUser?.map((user: any) => (
                                                <Row key={user.id}><Col><div>{user.username}</div></Col></Row>
                                            ))}
                                        </td>
                                    );
                                } else if (cell.column.id === 'Is Public') {
                                    return <td {...cell.getCellProps()}>{cellData.public ? 'true' : 'false'}</td>;
                                } else {
                                    return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
                                }
                            })}
                        </tr>
                    );
                })}
            </tbody>
        </Table>
    );
};

export default DatasetEntityTagTable;
