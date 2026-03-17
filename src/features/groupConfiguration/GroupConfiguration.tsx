import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Col, Row, Spinner } from 'react-bootstrap';
import { DebounceInput } from 'react-debounce-input';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import DefaultTable from '../../components/Table/DefaultTable';
import Paginator from '../../components/Pagination';
import CreateGroup from './CreateGroup';
import { getGroupList, GroupModel } from './api';
import { PAGINATION_DEFAULT_SIZE } from '../../constants';


const GroupConfiguration: React.FC = () => {
    const { t } = useTranslation();

    // ─── Table / pagination state ───────────────────────────────────────────────
    const [groups, setGroups] = useState<GroupModel[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(PAGINATION_DEFAULT_SIZE);
    const [search, setSearch] = useState('');
    const [currentSortField, setCurrentSortField] = useState('');
    const [currentSortDirection, setCurrentSortDirection] = useState(false);
    const [loading, setLoading] = useState(false);



    // ─── View state ─────────────────────────────────────────────────────────────
    const [showCreate, setShowCreate] = useState(false);
    const [selectedIdentifier, setSelectedIdentifier] = useState<string | null>(null);

    // ─── Data fetch ─────────────────────────────────────────────────────────────
    const loadGroups = useCallback(
        (size: number, page: number, searchTerm: string, sortField: string, sortDirection: boolean) => {
            setLoading(true);
            getGroupList(size, page, searchTerm, sortField, sortDirection)
                .then(res => {
                    setGroups(res?.content ?? []);
                    setTotalElements(res?.totalElements ?? 0);
                    setTotalPages(res?.totalPages ?? 0);
                })
                .catch(() => toast.error('Failed to load groups.'))
                .finally(() => setLoading(false));
        },
        []
    );


    // Load on mount and whenever page/size/search/sort changes
    useEffect(() => {
        loadGroups(pageSize, currentPage, search, currentSortField, currentSortDirection);
    }, [pageSize, currentPage, search, currentSortField, currentSortDirection, loadGroups]);


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

    const paginationHandler = (size: number, page: number) => {
        setPageSize(size);
        setCurrentPage(page);
    };

    // ─── Table columns (only name + type/team) ──────────────────────────────────

    const columns = [
        { name: 'name', sortValue: 'name', accessor: 'name' },
        { name: 'type', sortValue: 'type', accessor: 'type' }
    ];

    const sortedGroups = useMemo(() => {
        return groups ?? [];
    }, [groups]);

    const filteredGroups = useMemo(() => {
        if (!search) return sortedGroups;
        const lowercaseSearch = search.toLowerCase();
        return sortedGroups.filter(
            group => {
                const nameMatch = group.name?.toLowerCase().includes(lowercaseSearch);
                const typeText = group.type === 'TEAM' 
                    ? t('groupConfigurationPage.table.yes').toLowerCase() 
                    : t('groupConfigurationPage.table.no').toLowerCase();
                const typeMatch = typeText.includes(lowercaseSearch);
                return nameMatch || typeMatch;
            }
        );
    }, [sortedGroups, search, t]);


    const tableData = useMemo(
        () =>
            filteredGroups.map(row => ({
                ...row,
                type: (
                    <span style={{ color: row?.organizationType === 'TEAM' ? 'green' : 'red' }}>
                        {row?.organizationType === 'TEAM'
                            ? t('groupConfigurationPage.table.yes')
                            : t('groupConfigurationPage.table.no')}
                    </span>
                )
            })),
        [filteredGroups, t]
    );


    const handleEdit = (identifier: string) => {
        setSelectedIdentifier(identifier);
        setShowCreate(true);
    };


    // ─── After create: refresh list ─────────────────────────────────────────────
    const handleSave = () => {
        setShowCreate(false);
        setSelectedIdentifier(null);
        // Reload with current filters
        loadGroups(pageSize, currentPage, search, currentSortField, currentSortDirection);
    };

    const handleCancel = () => {
        setShowCreate(false);
        setSelectedIdentifier(null);
    };


    // ─── Render ─────────────────────────────────────────────────────────────────
    if (showCreate) {
        return <CreateGroup identifier={selectedIdentifier} onCancel={handleCancel} onSave={handleSave} />;
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
                    clickHandler={handleEdit}
                    clickAccessor="identifier"
                />
            )}

            {!loading && totalElements > 0 && (
                <Paginator
                    totalElements={totalElements}
                    page={currentPage}
                    size={pageSize}
                    totalPages={totalPages}
                    paginationHandler={paginationHandler}
                />
            )}


        </>
    );
};

export default GroupConfiguration;
