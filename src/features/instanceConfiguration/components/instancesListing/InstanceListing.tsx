import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Button, Col, Row, Spinner } from 'react-bootstrap';
import { DebounceInput } from 'react-debounce-input';
import DefaultTable from '../../../../components/Table/DefaultTable';
import { MOCK_INSTANCES, InstanceModel } from './mockInstances';
import { INSTANCE_TABLE_COLUMNS } from '../../../../constants/constants';
import { useTranslation } from 'react-i18next';
import { getInstances } from '../../api';

interface InstancesProps {
  onCreate?: () => void;
}

const Instances: React.FC<InstancesProps> = ({ onCreate }) => {
  const [search, setSearch] = useState('');
  const { t } = useTranslation();
  const [currentSortField, setCurrentSortField] = useState('');
  const [currentSortDirection, setCurrentSortDirection] = useState(false);
  const [instances, setInstances] = useState<InstanceModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getInstances().then(res => {
      if (res && (res as any).content) {
        setInstances((res as any).content);
      } 
      setLoading(false);
    }).catch(err => {
      console.error('Failed to fetch instances:', err);
      setInstances(MOCK_INSTANCES);
      setLoading(false);
    });
  }, []);

  const filterData = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const sortHandler = (field: string, sortDirection: boolean) => {
    setCurrentSortField(field);
    setCurrentSortDirection(sortDirection);
  };

  const activateHandler = (row: InstanceModel) => {
    console.log('Activate clicked for:', row);
  };

  const filteredData = useMemo(() => {
    let data = [...instances];

    // Search
    if (search) {
      data = data.filter(
        item =>
          item.instanceName?.toLowerCase().includes(search.toLowerCase()) ||
          item.planTitle?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort
    if (currentSortField) {
      data.sort((a: any, b: any) => {
        const aVal = a[currentSortField];
        const bVal = b[currentSortField];

        if (aVal == null) return 1;
        if (bVal == null) return -1;

        // Date sorting check
        if (typeof aVal === 'string' && !isNaN(Date.parse(aVal)) && (aVal.includes('-') || aVal.includes(':'))) {
          return currentSortDirection
            ? new Date(bVal).getTime() - new Date(aVal).getTime()
            : new Date(aVal).getTime() - new Date(bVal).getTime();
        }

        // String sorting
        if (typeof aVal === 'string') {
          return currentSortDirection ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
        }

        // Number sorting
        if (typeof aVal === 'number') {
          return currentSortDirection ? bVal - aVal : aVal - bVal;
        }

        return 0;
      });
    }

    return data;
  }, [instances, search, currentSortField, currentSortDirection]);

  const tableData = filteredData.map(row => ({
    ...row,
    action:
      row.planStatus === 'DRAFT' ? (
        <Button size="sm" variant="primary" onClick={() => activateHandler(row)}>
          Activate
        </Button>
      ) : null
  }));

  return (
    <>
      <h2>{t('instancesPage.title')}</h2>

      <Row className="my-4 align-items-center">
        <Col md={4}>
          <DebounceInput
            className="form-control"
            placeholder={t('instancesPage.search')}
            debounceTimeout={500}
            onChange={filterData}
          />
        </Col>

        <Col md={8}>
          <Button className="btn btn-primary float-end" onClick={onCreate}>{t('buttons.create')}</Button>
        </Col>
      </Row>

      <hr className="my-3" />

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading instances...</p>
        </div>
      ) : (
        <DefaultTable
          pageKey="instancesPage.table."
          columns={INSTANCE_TABLE_COLUMNS}
          data={tableData}
          sortHandler={sortHandler}
        />
      )}
    </>
  );
};

export default Instances;
