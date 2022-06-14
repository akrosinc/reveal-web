import React, { useEffect, useState, useCallback, useRef, ChangeEvent } from 'react';
import { Col, Row, Button } from 'react-bootstrap';
import { getOrganizationById, getOrganizationCount, getOrganizationList, getOrganizationListSummary } from '../api';
import { OrganizationModel } from '../providers/types';
import ExpandingTable from '../../../components/Table/ExpandingTable';
import Paginator from '../../../components/Pagination';
import { useAppDispatch } from '../../../store/hooks';
import { showLoader } from '../../reducers/loader';
import CreateOrganization from './create';
import { ORGANIZATION_TABLE_COLUMNS, PAGINATION_DEFAULT_SIZE, UNEXPECTED_ERROR_STRING } from '../../../constants';
import { DebounceInput } from 'react-debounce-input';
import { ActionDialog } from '../../../components/Dialogs/';
import EditOrganization from './edit';
import { toast } from 'react-toastify';
import { PageableModel, ErrorModel } from '../../../api/providers';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Organization = () => {
  const [organizationList, setOrganizationList] = useState<PageableModel<OrganizationModel>>();
  const [show, setShow] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [organizationCount, setOrganizationCount] = useState(0);
  const [selectedOrganizaton, setSelectedOrganization] = useState<OrganizationModel>();
  const [organizationDropdown, setOrganizationDropdown] = useState<OrganizationModel[]>([]);
  const [currentSearchInput, setCurrentSearchInput] = useState('');
  const [currentSortField, setCurrentSortField] = useState('');
  const [currentSortDirection, setCurrentSortDirection] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const { t } = useTranslation();
  const expandAll = useRef<HTMLSpanElement>();

  const handleClose = (isEdited: boolean) => {
    setShow(false);
    setShowDetails(false);
    if (isEdited) {
      loadData(
        organizationList?.size ?? PAGINATION_DEFAULT_SIZE,
        organizationList?.pageable.pageNumber ?? 0,
        currentSearchInput,
        currentSortField,
        currentSortDirection
      );
    }
  };

  const columns = React.useMemo(
    () => [
      {
        // Build our expander column
        id: 'expander', // Make sure it has an ID
        Header: ({ getToggleAllRowsExpandedProps }: { getToggleAllRowsExpandedProps: Function }) => (
          <span {...getToggleAllRowsExpandedProps()} ref={expandAll}></span>
        ),
        Cell: ({ row }: { row: any }) =>
          // Use the row.canExpand and row.getToggleRowExpandedProps prop getter
          // to build the toggle for expanding a row
          // show expanding icons if row.canExpand is true, if not check where is it a root element
          // if its a root element don't set anything otherwise set dash so user can see what is the last element
          row.canExpand ? (
            <span
              {...row.getToggleRowExpandedProps({
                style: {
                  // We can even use the row.depth property
                  // and paddingLeft to indicate the depth
                  // of the row
                  paddingLeft: `${row.depth * 1.5}rem`,
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
          ) : (
            <span
              {...row.getToggleRowExpandedProps({
                style: {
                  paddingLeft: `${row.depth * 1.5}rem`,
                  paddingTop: '15px',
                  paddingBottom: '15px',
                  paddingRight: '15px'
                }
              })}
            >
              {row.depth > 0 ? '-' : null}
            </span>
          )
      },
      ...ORGANIZATION_TABLE_COLUMNS
    ],
    []
  );

  const handleShow = () => setShow(true);

  const dispatch = useAppDispatch();

  const loadData = useCallback(
    (size: number, page: number, searchData?: string, field?: string, sortDirection?: boolean) => {
      dispatch(showLoader(true));
      getOrganizationList(size, page, searchData !== undefined ? searchData : '', field, sortDirection)
        .then(data => {
          setOrganizationList(data);
          setData(
            data.content.map(el => {
              return {
                name: el.name,
                identifier: el.identifier,
                active: el.active.toString(),
                headOf: el.headOf,
                type: el.type.valueCodableConcept
              };
            })
          );
          if (searchData !== undefined && searchData.length) {
            setOrganizationCount(data.numberOfElements);
            expandAll?.current?.click();
          } else {
            getOrganizationCount()
              .then(res => setOrganizationCount(res.count))
              .catch(err => toast.error(err.toString()));
          }
        })
        .catch((error: ErrorModel) => toast.error(error !== undefined ? error.message : UNEXPECTED_ERROR_STRING))
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

  const filterData = (e: ChangeEvent<HTMLInputElement>) => {
    setCurrentSearchInput(e.target.value);
    loadData(organizationList?.pageable.pageSize ?? PAGINATION_DEFAULT_SIZE, 0, e.target.value);
  };

  const openOrganizationById = (id: string) => {
    dispatch(showLoader(true));
    getOrganizationById(id)
      .then(res => {
        setSelectedOrganization(res);
        getOrganizationListSummary()
          .then(res => {
            setOrganizationDropdown(res.content.filter(el => el.identifier !== id));
            setShowDetails(true);
            dispatch(showLoader(false));
          })
          .catch(_ => toast.error('An error has occured while loading organization.'));
      })
      .catch(_ => toast.error('An error has occured while loading organization.'));
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
      <h2>
        {t('organizationPage.organization')} ({organizationCount})
      </h2>
      <Row className="my-4">
        <Col md={8} className="mb-2">
          <Button id="organization-create-button" className="btn btn-primary float-end" onClick={handleShow}>
            {t('buttons.create')}
          </Button>
        </Col>
        <Col sm={12} md={4} className="order-md-first">
          <DebounceInput
            id="search-organizatins-input"
            className="form-control"
            placeholder={t('organizationPage.search') + ' (min 3 charaters)'}
            debounceTimeout={800}
            onChange={e => filterData(e)}
            disabled={organizationCount === 0 && currentSearchInput === ''}
          />
        </Col>
      </Row>
      <hr className="my-4" />
      {organizationList !== undefined && organizationList.content.length > 0 ? (
        <>
          <ExpandingTable columns={columns} data={data} clickHandler={openOrganizationById} sortHandler={sortHandler} />
          <Paginator
            totalPages={organizationList.totalPages}
            totalElements={organizationList.totalElements}
            page={organizationList.pageable.pageNumber}
            size={organizationList.size}
            paginationHandler={paginatonHandler}
          />
        </>
      ) : (
        <p className="text-center lead">No organizations found.</p>
      )}
      {show && (
        <ActionDialog
          title={'Create organization'}
          closeHandler={handleClose}
          element={<CreateOrganization handleClose={handleClose} show={show} />}
        />
      )}
      {showDetails && selectedOrganizaton && (
        <ActionDialog
          closeHandler={handleClose}
          element={
            <EditOrganization
              organization={selectedOrganizaton}
              organizations={organizationDropdown}
              handleClose={handleClose}
              show={true}
            />
          }
          title="Organization details"
        />
      )}
    </>
  );
};

export default Organization;
