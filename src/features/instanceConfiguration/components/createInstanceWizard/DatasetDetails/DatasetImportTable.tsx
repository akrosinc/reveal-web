import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { ChangeEvent, useCallback } from 'react';
import { FormCheck, Table } from 'react-bootstrap';
import { useAppSelector } from '../../../../../store/hooks';
import { Column, Row, useExpanded, useTable } from 'react-table';
import { MetadataFileImportResponse } from '../../../../metaDataImport/type';
import DatasetEntityTagTable from './DatasetEntityTagTable';
import { EntityTagResponse } from '../../../../planSimulation/providers/types';
import { TAG_ACCESS_OVERRIDE } from '../../../../../constants';
import { useKeycloak } from '@react-keycloak/web';

import { useTranslation } from 'react-i18next';

interface Props {
    data: MetadataFileImportResponse[];
    sortHandler?: (sortValue: string, sortDirection: boolean) => void;
    clickHandler?: (identifier: any) => void;
    clickAccessor?: string;
    setMetadataList: (list: MetadataFileImportResponse[]) => void;
    searchTerm?: string;
}

const DatasetImportTable = ({ data, setMetadataList, searchTerm }: Props) => {
    const isDarkMode = useAppSelector((state: any) => state.darkMode.value);
    const { keycloak } = useKeycloak();
    const { t } = useTranslation();
    const columnsForMetadataTables = React.useMemo<Column<EntityTagResponse>[]>(
        () => [
            { Header: '', id: 'selected' },
            { Header: 'tag', accessor: 'tag' },
            { Header: 'isPublic', accessor: 'public' },
            { Header: 'instances', accessor: 'instances' as any },
        ],
        []
    );


    const renderRowSubComponent = React.useCallback(
        (row: Row<MetadataFileImportResponse>) => {
            let original = row.original;
            let entityTagEvents = original.entityTagEvents;
            if (entityTagEvents)
                return (
                    <DatasetEntityTagTable
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
                id: 'expander',
                Cell: ({ row }: { row: any }) =>
                    row.original.entityTagEvents && row.original.entityTagEvents.length > 0 ? (
                        <span
                            {...row.getToggleRowExpandedProps({
                                style: {
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
            { Header: 'datasetName', accessor: 'filename' },
            { Header: 'uploadDate', accessor: 'uploadDatetime' },
            { Header: 'uploadedBy', accessor: 'uploadedBy' },

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
        useExpanded
    );

    // Auto-expand if search term matches a tag
    React.useEffect(() => {
        if (searchTerm) {
            const s = searchTerm.toLowerCase();
            rows.forEach(row => {
                const hasMatchingTag = row.original.entityTagEvents?.some(tagEvent => 
                    (tagEvent.tag || '').toLowerCase().includes(s)
                );
                if (hasMatchingTag && !(row as any).isExpanded) {
                    (row as any).toggleRowExpanded(true);
                }
            });
        }
    }, [rows, searchTerm]);

    const setSelected = useCallback(
        (evt: ChangeEvent<HTMLInputElement>, identifier: string) => {
            let response: MetadataFileImportResponse[] = [];

            data.forEach(value => {
                if (value.identifier === identifier) {
                    value.selected = evt.currentTarget.checked;

                    let entityTags: EntityTagResponse[] = [];
                    value.entityTagEvents?.forEach((entityTag: EntityTagResponse) => {
                        entityTags.push({
                            ...entityTag,
                            selected: evt.currentTarget.checked,
                            children: entityTag.children?.map((child: EntityTagResponse) => ({
                                ...child,
                                selected: evt.currentTarget.checked
                            }))
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
                        {headerGroup.headers.map(column => (
                            <th
                                id={column.id + '-header'}
                                style={{ width: column.id === 'expander' ? '37px' : 'auto' }}
                                {...column.getHeaderProps()}
                            >
                                {column.Header !== undefined && column.Header !== null && column.id !== 'expander'
                                    ? t('metadataImport.table.' + column.Header.toString())
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
                        <React.Fragment key={row.original.identifier}>
                            <tr {...row.getRowProps()}>
                                {row.cells.map(cell => {
                                    if (cell.column.id === 'selected') {
                                        return (
                                            <td {...cell.getCellProps()}>
                                                <FormCheck
                                                    checked={cell.row.original.selected}
                                                    onChange={evt => setSelected(evt, row.original.identifier)}
                                                />
                                            </td>
                                        );
                                    } else if (cell.column.id === 'owner') {
                                        return <td {...cell.getCellProps()}>{cell.row.original.owner ? 'true' : 'false'}</td>;
                                    } else if (cell.column.id === 'owners') {
                                        return (
                                            <td {...cell.getCellProps()}>
                                                {cell.row.original.owners.map(owner => (
                                                    <p key={owner.id}>{owner.username}</p>
                                                ))}
                                            </td>
                                        );
                                    } else {
                                        return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
                                    }
                                })}
                            </tr>

                            {(row as any).isExpanded && (
                                <tr>
                                    <td colSpan={row.cells?.length} style={{ backgroundColor: '#f3f8fc' }}>
                                        {renderRowSubComponent(row)}
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    );
                })}
            </tbody>
        </Table>
    );
};

export default DatasetImportTable;
