import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Col, Row, Spinner } from 'react-bootstrap';
import { DebounceInput } from 'react-debounce-input';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import DefaultTable from '../../components/Table/DefaultTable';
import CreateGroup from './CreateGroup';
import { getGroupList, GroupModel } from './api';
import { PAGINATION_DEFAULT_SIZE } from '../../constants';

const GroupConfiguration: React.FC = () => {
    const { t } = useTranslation();

    // ─── Table / pagination state ───────────────────────────────────────────────
    const [groups, setGroups] = useState<GroupModel[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [search, setSearch] = useState('');
    const [currentSortField, setCurrentSortField] = useState('');
    const [currentSortDirection, setCurrentSortDirection] = useState(false);
    const [loading, setLoading] = useState(false);

    // ─── View state ─────────────────────────────────────────────────────────────
    const [showCreate, setShowCreate] = useState(false);

    // ─── Data fetch ─────────────────────────────────────────────────────────────
    const loadGroups = useCallback(
        (page: number, searchTerm: string, sortField: string, sortDirection: boolean) => {
            setLoading(true);
            getGroupList(PAGINATION_DEFAULT_SIZE, page, searchTerm, sortField, sortDirection)
                .then(res => {
                    setGroups(res?.content ?? []);
                    setTotalElements(res?.totalElements ?? 0);
                })
                .catch(() => toast.error('Failed to load groups.'))
                .finally(() => setLoading(false));
        },
        []
    );

    // Load on mount and whenever page/search/sort changes
    useEffect(() => {
        loadGroups(currentPage, search, currentSortField, currentSortDirection);
    }, [currentPage, search, currentSortField, currentSortDirection, loadGroups]);

    // ─── Handlers ───────────────────────────────────────────────────────────────
    const filterData = (e: ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setCurrentPage(0); // reset to first page on new search
    };

    const sortHandler = (field: string, sortDirection: boolean) => {
        setCurrentSortField(field);
        setCurrentSortDirection(sortDirection);
        setCurrentPage(0);
    };

    // ─── Table columns (only name + type/team) ──────────────────────────────────
    const columns = [
        { name: 'name', sortValue: 'name', accessor: 'name' },
        { name: 'type', sortValue: 'type', accessor: 'type' }
    ];

    const tableData = useMemo(
        () =>
            (groups ?? []).map(row => ({
                ...row,
                type: (
                    <span style={{ color: row.type === 'TEAM' ? 'green' : '#555' }}>
                        {row.type === 'TEAM'
                            ? t('groupConfigurationPage.table.yes')
                            : row.type || t('groupConfigurationPage.table.no')}
                    </span>
                )
            })),
        [groups, t]
    );

    // ─── After create: refresh list ─────────────────────────────────────────────
    const handleSave = () => {
        setShowCreate(false);
        // Reload with current filters
        loadGroups(currentPage, search, currentSortField, currentSortDirection);
    };

    // ─── Render ─────────────────────────────────────────────────────────────────
    if (showCreate) {
        return <CreateGroup onCancel={() => setShowCreate(false)} onSave={handleSave} />;
    }

    return (
        <>
            <h2 className="mb-4">{t('groupConfigurationPage.title')}</h2>

            <Row className="my-4 align-items-center">
                <Col md={4}>
                    <DebounceInput
                        className="form-control"
                        placeholder={t('groupConfigurationPage.search')}
                        debounceTimeout={500}
                        onChange={filterData}
                    />
                </Col>

                <Col md={8}>
                    <Button className="btn btn-primary float-end" onClick={() => setShowCreate(true)}>
                        {t('buttons.create')}
                    </Button>
                </Col>
            </Row>

            <hr className="my-3" />

            {loading ? (
                <div className="d-flex justify-content-center align-items-center py-5">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : (
                <DefaultTable
                    pageKey="groupConfigurationPage.table."
                    columns={columns}
                    data={tableData}
                    sortHandler={sortHandler}
                />
            )}

            {/* Simple pagination info */}
            {!loading && totalElements > 0 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                    <small className="text-muted">
                        Showing {groups.length} of {totalElements} groups
                    </small>
                    <div className="d-flex gap-2">
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            disabled={currentPage === 0}
                            onClick={() => setCurrentPage(p => p - 1)}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            disabled={(currentPage + 1) * PAGINATION_DEFAULT_SIZE >= totalElements}
                            onClick={() => setCurrentPage(p => p + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
};

export default GroupConfiguration;
