import React, { useEffect, useState, useCallback } from 'react';
import { Col, Row, Button } from 'react-bootstrap';
import { getOrganizationCount, getOrganizationList } from '../api';
import { OrganizationModel } from '../providers/types';
import OrganizationTable from '../../../components/Table/OrganizationsTable';
import Paginator from '../../../components/Pagination';
import { useAppDispatch } from '../../../store/hooks';
import { showLoader } from '../../reducers/loader';
import CreateOrganization from './create';
import { PAGINATION_DEFAULT_SIZE } from '../../../constants';
import { DebounceInput } from 'react-debounce-input';
import { ActionDialog } from '../../../components/Dialogs/';
import EditOrganization from './edit';
import { toast } from 'react-toastify';
import { PageableModel, ErrorModel } from '../../../api/providers';
import { useTranslation } from 'react-i18next';

const Organization = () => {
  const [organizationList, setOrganizationList] = useState<PageableModel<OrganizationModel>>();
  const [show, setShow] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [organizationCount, setOrganizationCount] = useState(0);
  const [selectedOrganizaton, setSelectedOrganization] = useState('');
  const [currentSearchInput, setCurrentSearchInput] = useState('');
  const [currentSortField, setCurrentSortField] = useState('');
  const [currentSortDirection, setCurrentSortDirection] = useState(false);
  const { t } = useTranslation();
  const handleClose = () => {
    setShow(false);
    setShowDetails(false);
    loadData(
      organizationList?.size ?? PAGINATION_DEFAULT_SIZE,
      organizationList?.pageable.pageNumber ?? 0,
      currentSearchInput,
      currentSortField,
      currentSortDirection
    );
  };
  const handleShow = () => setShow(true);

  const dispatch = useAppDispatch();

  const loadData = useCallback(
    (size: number, page: number, searchData?: string, field?: string, sortDirection?: boolean) => {
      dispatch(showLoader(true));
      getOrganizationList(size, page, searchData !== undefined ? searchData : '', field, sortDirection)
        .then(data => {
          setOrganizationList(data);
          if (searchData !== undefined) {
            setOrganizationCount(data.numberOfElements);
          } else {
            getOrganizationCount()
              .then(res => setOrganizationCount(res.count))
              .catch(err => toast.error(err.toString()));
          }
        })
        .catch((error: ErrorModel) => toast.error(error !== undefined ? error.message : "Unexpected error!"))
        .finally(() => dispatch(showLoader(false)));
    },
    [dispatch]
  );

  useEffect(() => {
    loadData(PAGINATION_DEFAULT_SIZE, 0);
  }, [loadData]);

  const paginatonHandler = (size: number, page: number) => {
    loadData(size, page);
  };

  const filterData = (e: any) => {
    setCurrentSearchInput(e.target.value);
    loadData(PAGINATION_DEFAULT_SIZE, 0, e.target.value);
  };

  const openOrganizationById = (id: string) => {
    setShowDetails(true);
    setSelectedOrganization(id);
  };

  const sortHandler = (field: string, sortDirection: boolean) => {
    if (organizationList !== undefined) {
      setCurrentSortField(field);
      setCurrentSortDirection(sortDirection);
      loadData(organizationList.size, 0, currentSearchInput, field, sortDirection);
    }
  };

  return (
    <>
      <h2>{t('organizationPage.organization')} ({organizationCount})</h2>
      <Row className="my-4">
        <Col md={8} className="mb-2">
          <Button className="btn btn-primary float-end" onClick={handleShow}>
            {t('buttons.create')}
          </Button>
        </Col>
        <Col sm={12} md={4} className="order-md-first">
          <DebounceInput
            className="form-control"
            placeholder={t('organizationPage.search')}
            debounceTimeout={800}
            onChange={e => filterData(e)}
            disabled={organizationCount === 0 && currentSearchInput === ''}
          />
        </Col>
      </Row>
      <hr className="my-4" />
      <OrganizationTable
        sortHandler={sortHandler}
        clickHandler={openOrganizationById}
        rows={organizationList !== undefined ? organizationList.content : []}
      />
      {organizationList !== undefined && organizationList.content.length > 0 ? (
        <Paginator
          totalPages={organizationList.totalPages}
          totalElements={organizationList.totalElements}
          page={organizationList.pageable.pageNumber}
          size={organizationList.size}
          paginationHandler={paginatonHandler}
        />
      ) : null}
      {show && (
        <ActionDialog
          backdrop={true}
          title={'Create organization'}
          closeHandler={handleClose}
          element={<CreateOrganization handleClose={handleClose} show={show} />}
        />
      )}
      {showDetails && (
        <ActionDialog
          backdrop={true}
          closeHandler={handleClose}
          element={<EditOrganization organizationId={selectedOrganizaton} handleClose={handleClose} show={true} />}
          title="Organization details"
        />
      )}
    </>
  );
};

export default Organization;
