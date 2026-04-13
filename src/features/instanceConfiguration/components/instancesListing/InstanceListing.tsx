import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import { Button, Col, Row, Spinner } from 'react-bootstrap';
import { DebounceInput } from 'react-debounce-input';
import DefaultTable from '../../../../components/Table/DefaultTable';
import { INSTANCE_TABLE_COLUMNS } from '../../../../constants/constants';
import { useTranslation } from 'react-i18next';
import { activateInstance, getInstances } from '../../api';
import Paginator from '../../../../components/Pagination';
import { toast } from 'react-toastify';
import AuthorizedElement from '../../../../components/AuthorizedElement';
import { ACTIVATE_ADMIN_INSTANCE_PLAN, ACTIVATE_INSTANCE_PLAN, INSTANE_MANAGEMENT_CREATE, INSTANE_MANAGEMENT_EDIT } from '../../../../constants';
import { useAuthorization } from '../../../../hooks/useAuthorization';
import { ConfirmDialog } from '../../../../components/Dialogs';
import { useAppSelector } from '../../../../store/hooks';
interface InstancesProps {
  onCreate?: () => void;
  onEdit?: (identifier: string) => void;
}

const PAGINATION_DEFAULT_SIZE = 10;

const Instances: React.FC<InstancesProps> = ({ onCreate, onEdit }) => {
  const { t } = useTranslation();
  const isDarkMode = useAppSelector(state => state.darkMode.value);
  const isAuthorizedToActivate = useAuthorization([ACTIVATE_ADMIN_INSTANCE_PLAN, ACTIVATE_INSTANCE_PLAN])
  const [instances, setInstances] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [showConfirmActivate, setShowConfirmActivate] = useState(false);
  const [search, setSearch] = useState('');
  const [currentSortField, setCurrentSortField] = useState('');
  const [currentSortDirection, setCurrentSortDirection] = useState(false);
  const isAuthorizedToEdit = useAuthorization([INSTANE_MANAGEMENT_EDIT])
  const [selectedElem, setSelectedElem] = useState<any>();
  const editHandler = (identifier: string) => {
    if (!isAuthorizedToEdit) return
    if (onEdit) {
      onEdit(identifier);
    }
  };

  const activateHandler = (action: boolean) => {
    if (!selectedElem) return
    if (!action) {
      setShowConfirmActivate(false);
      return
    }
    toast.promise(activateInstance(selectedElem?.identifier), {
      pending: 'Activating...',
      success: {
        render() {
          toast.success("Instance activated successfully");
          loadData(PAGINATION_DEFAULT_SIZE, instances?.pageable?.pageNumber ?? 0, search, currentSortField, currentSortDirection);
          setShowConfirmActivate(false);
          return 'Successfully activated instance!';
        }

      },
      error: {
        render({ data: err }: { data: any }) {
          //  setShowConfirmActivate(false);
          return err?.message || err;
        }

      }
    });
  };

  /**
   * Load instances from API
   */
  const loadData = useCallback(
    (size: number, page: number, searchData?: string, field?: string, direction?: boolean) => {
      setLoading(true);

      getInstances(size, page, searchData !== undefined ? searchData : search, field, direction)
        .then(res => {
          setInstances(res);
        })
        .catch(err => {
          toast.error('Failed to fetch instances');
          console.error(err);
        })
        .finally(() => setLoading(false));
    },
    [search]
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
    loadData(instances?.size ?? PAGINATION_DEFAULT_SIZE, 0, e.target.value, currentSortField, currentSortDirection);
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

      getInstances(instances.size, 0, search, field, direction)
        .then(res => setInstances(res))
        .catch(err => toast.error(err));
    }
  };


  /**
   * Pagination
   */
  const paginationHandler = (size: number, page: number) => {
    loadData(size, page, search, currentSortField, currentSortDirection);
  };

  /**
   * Table Data
   */
  const tableData = (instances?.content ?? []).map((row: any) => ({
    ...row,
    startDate: row.startDate ? moment(row.startDate).format('DD/MM/YYYY') : '',
    endDate: row.endDate ? moment(row.endDate).format('DD/MM/YYYY') : '',
    ...(isAuthorizedToActivate && {
      action:
        row.planStatus === 'DRAFT' ? (
          <Button
            size="sm"
            variant="primary"
            onClick={e => {
              e.stopPropagation();
              e.preventDefault();
              // activateHandler(row);
              setSelectedElem(row)
              setShowConfirmActivate(true);
            }}
          >
            Activate
          </Button>
        ) : null
    })
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
      {showConfirmActivate && (
        <ConfirmDialog
          closeHandler={activateHandler}
          message={'Are you sure you want to activate instance'}
          title="Activate Instance"
          backdrop
          isDarkMode={isDarkMode}
        />
      )}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading instances...</p>
        </div>
      ) : instances && instances.content.length > 0 ? (
        <>
          <DefaultTable
            pageKey="instancesPage.table."
            columns={[...INSTANCE_TABLE_COLUMNS, ...(isAuthorizedToActivate ? [{
              name: 'activate',
              sortValue: undefined,
              accessor: 'action'
            }] : [])]}
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
        <p className="text-center text-muted">No record found</p>
      )}
    </>
  );
};

export default Instances;
