import React, { ChangeEvent, useMemo, useState } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { DebounceInput } from 'react-debounce-input';
import { useTranslation } from 'react-i18next';
import DefaultTable from '../../components/Table/DefaultTable';
import { MOCK_GROUPS, GroupModel } from './mockGroups';

const GroupConfiguration: React.FC = () => {
    const { t } = useTranslation();
    const [search, setSearch] = useState('');
    const [currentSortField, setCurrentSortField] = useState('');
    const [currentSortDirection, setCurrentSortDirection] = useState(false);

    const filterData = (e: ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const sortHandler = (field: string, sortDirection: boolean) => {
        setCurrentSortField(field);
        setCurrentSortDirection(sortDirection);
    };

    const filteredData = useMemo(() => {
        let data = [...MOCK_GROUPS];

        // 🔍 Search
        if (search) {
            data = data.filter(item => item.groupName.toLowerCase().includes(search.toLowerCase()));
        }

        // ↕️ Sort
        if (currentSortField) {
            data.sort((a: any, b: any) => {
                const aVal = a[currentSortField];
                const bVal = b[currentSortField];

                if (aVal == null) return 1;
                if (bVal == null) return -1;

                if (typeof aVal === 'string') {
                    return currentSortDirection ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
                }

                if (typeof aVal === 'boolean') {
                    return currentSortDirection ? (aVal === bVal ? 0 : aVal ? -1 : 1) : (aVal === bVal ? 0 : aVal ? 1 : -1);
                }

                return 0;
            });
        }

        return data;
    }, [search, currentSortField, currentSortDirection]);

    const columns = [
        { name: 'groupName', sortValue: 'groupName', accessor: 'groupName' },
        { name: 'team', sortValue: 'team', accessor: 'team' }
    ];

    const tableData = filteredData.map(row => ({
        ...row,
        team: (
            <span style={{ color: row.team ? 'green' : 'red' }}>
                {row.team ? t('groupConfigurationPage.table.yes') : t('groupConfigurationPage.table.no')}
            </span>
        )
    }));

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
                    <Button className="btn btn-primary float-end">{t('buttons.create')}</Button>
                </Col>
            </Row>

            <hr className="my-3" />

            <DefaultTable
                pageKey="groupConfigurationPage.table."
                columns={columns}
                data={tableData}
                sortHandler={sortHandler}
            />
        </>
    );
};

export default GroupConfiguration;
