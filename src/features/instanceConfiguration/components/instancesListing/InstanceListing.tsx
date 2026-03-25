import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import { Button, Col, Row, Spinner } from 'react-bootstrap';
import { DebounceInput } from 'react-debounce-input';
import DefaultTable from '../../../../components/Table/DefaultTable';
import { INSTANCE_TABLE_COLUMNS } from '../../../../constants/constants';
import { useTranslation } from 'react-i18next';
import { getInstances } from '../../api';
import Paginator from '../../../../components/Pagination';
import { toast } from 'react-toastify';
import AuthorizedElement from '../../../../components/AuthorizedElement';
import { INSTANE_MANAGEMENT_CREATE, INSTANE_MANAGEMENT_EDIT } from '../../../../constants';
import { useAuthorization } from '../../../../hooks/useAuthorization';

interface InstancesProps {
  onCreate?: () => void;
  onEdit?: (identifier: string) => void;
}

const PAGINATION_DEFAULT_SIZE = 10;

const Instances: React.FC<InstancesProps> = ({ onCreate, onEdit }) => {
  const { t } = useTranslation();

  const [instances, setInstances] = useState<any>();
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [currentSortField, setCurrentSortField] = useState('');
  const [currentSortDirection, setCurrentSortDirection] = useState(false);
  const isAuthorizedToEdit = useAuthorization([INSTANE_MANAGEMENT_EDIT])
  const editHandler = (identifier: string) => {
    if(!isAuthorizedToEdit) return
    if (onEdit) {
      onEdit(identifier);
    }
  };

  const activateHandler = (row: any) => {
    console.log('Activate clicked for:', row);
  };

  /**
   * Load instances from API
   */
  const loadData = useCallback(
    (size: number, page: number, field?: string, direction?: boolean) => {
      setLoading(true);

      getInstances(size, page, field, direction)
        .then(res => {
          setInstances(res);
        })
        .catch(err => {
          toast.error('Failed to fetch instances');
          console.error(err);
        })
        .finally(() => setLoading(false));
    },
    []
  );

  /**
   * Initial load
   */
  useEffect(() => {
    loadData(PAGINATION_DEFAULT_SIZE, 0);
  }, [loadData]);

  /**
   * Search filter
   */
  const filterData = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  /**
   * Sorting
   */
//  const sortHandler = (field: string, direction: boolean) => {
//   setCurrentSortField(field);
//   setCurrentSortDirection(direction);

//   loadData(instances?.size ?? PAGINATION_DEFAULT_SIZE, 0, field, direction);
// };
const sortHandler = (field: string, direction: boolean) => {
  if (instances !== undefined) {
    setCurrentSortField(field);
    setCurrentSortDirection(direction);

    getInstances(instances.size, 0, field, direction)
      .then(res => setInstances(res))
      .catch(err => toast.error(err));
  }
};


  /**
   * Pagination
   */
  const paginationHandler = (size: number, page: number) => {
    loadData(size, page, currentSortField, currentSortDirection);
  };

  /**
   * Client-side search filtering
   */
  const filteredData = useMemo(() => {
    if (!instances?.content) return [];

    if (!search) return instances.content;

    return instances.content.filter((item: any) =>
      item.instanceName?.toLowerCase().includes(search.toLowerCase()) ||
      item.planTitle?.toLowerCase().includes(search.toLowerCase())
    );
  }, [instances, search]);

  /**
   * Table Data
   */
  const tableData = filteredData.map((row: any) => ({
    ...row,
    startDate: row.startDate ? moment(row.startDate).format('DD/MM/YYYY') : '',
    endDate: row.endDate ? moment(row.endDate).format('DD/MM/YYYY') : '',
    action:
      row.planStatus === 'DRAFT' ? (
        <Button size="sm" variant="primary" onClick={() => activateHandler(row)}>
          Activate
        </Button>
      ) : null
  }));

  return (
    <>
      <h2>
        {t('instancesPage.title')} ({instances?.totalElements ?? 0})
      </h2>

      <Row className="my-4 align-items-center">
        <Col md={4}>
          <DebounceInput
            className="form-control"
            placeholder={t('instancesPage.search')}
            debounceTimeout={600}
            onChange={filterData}
            disabled={instances?.totalElements === 0 && search === ''}
          />
        </Col>
      <AuthorizedElement roles={[INSTANE_MANAGEMENT_CREATE]}>
        <Col md={8}>
          <Button className="btn btn-primary float-end" onClick={onCreate}>
            {t('buttons.create')}
          </Button>
        </Col>
        </AuthorizedElement>
      </Row>

      <hr className="my-3" />

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading instances...</p>
        </div>
      ) : instances && instances.content.length > 0 ? (
        <>
          <DefaultTable
            pageKey="instancesPage.table."
            columns={INSTANCE_TABLE_COLUMNS}
            data={tableData}
            sortHandler={sortHandler}
            clickHandler={editHandler}
            clickAccessor="identifier"
          />

          <Paginator
            totalElements={instances.totalElements}
            page={instances.pageable.pageNumber}
            size={instances.size}
            totalPages={instances.totalPages}
            paginationHandler={paginationHandler}
          />
        </>
      ) : (
        <p className="text-center text-muted">No instances found</p>
      )}
    </>
  );
};

export default Instances;
