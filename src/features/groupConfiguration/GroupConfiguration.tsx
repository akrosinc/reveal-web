import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Col, Row, Spinner } from 'react-bootstrap';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { DebounceInput } from 'react-debounce-input';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import DefaultTable from '../../components/Table/DefaultTable';
import Paginator from '../../components/Pagination';
import CreateGroup from './CreateGroup';
import TeamAssignmentModal from './components/TeamAssignmentModal';
import { getGroupList, GroupModel } from './api';
import { GROUP_MANAGEMENT, GROUP_MANAGEMENT_CREATE, GROUP_MANAGEMENT_EDIT, PAGINATION_DEFAULT_SIZE } from '../../constants';
import { useAuthorization } from '../../hooks/useAuthorization';
import AuthorizedElement from '../../components/AuthorizedElement';


const GroupConfiguration: React.FC = () => {
    const { t } = useTranslation();
    const isAuthorizedForEdit = useAuthorization([GROUP_MANAGEMENT_EDIT])
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
    const [showAssignModal, setShowAssignModal] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();

    const isCreate = location.pathname.endsWith('/create');
    const isEdit = !!id;
    const showCreateOrEdit = isCreate || isEdit;

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
        if(!isAuthorizedForEdit) return;
        navigate(`${GROUP_MANAGEMENT}/${identifier}/edit`);
    };

    const handleSave = () => {
        navigate(GROUP_MANAGEMENT);
        loadGroups(pageSize, currentPage, search, currentSortField, currentSortDirection);
    };

    const handleCancel = () => {
        navigate(GROUP_MANAGEMENT);
    };


    // ─── Render ─────────────────────────────────────────────────────────────────
    if (showCreateOrEdit) {
        return <CreateGroup identifier={id} onCancel={handleCancel} onSave={handleSave} />;
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
                    <AuthorizedElement roles={[GROUP_MANAGEMENT_CREATE]}>
                        <div className="d-flex justify-content-end gap-2">
                            <Button 
                                variant="outline-primary" 
                                onClick={() => setShowAssignModal(true)}
                            >
                                Assign teams
                            </Button>
                            <Button className="btn btn-primary" onClick={() => navigate(GROUP_MANAGEMENT + '/create')}>
                                {t('buttons.create')}
                            </Button>
                        </div>
                    </AuthorizedElement>
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

            <TeamAssignmentModal 
                show={showAssignModal}
                onHide={() => setShowAssignModal(false)}
                onSaveSuccess={() => loadGroups(pageSize, currentPage, search, currentSortField, currentSortDirection)}
            />

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
