import React, { useEffect, useState, useCallback } from 'react';
import { Row, Col, Button, Table } from 'react-bootstrap';
import { PageableModel } from '../../../../api/providers';
import { useTranslation } from 'react-i18next';
import { LocationBulkModel } from '../../providers/types';
import { ActionDialog } from '../../../../components/Dialogs';
import UploadLocation from './upload';
import Paginator from '../../../../components/Pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatDate } from '../../../../utils';
import { useAppDispatch } from '../../../../store/hooks';
import { PAGINATION_DEFAULT_SIZE, USER_BULK_TABLE_COLUMNS } from '../../../../constants';
import { getLocationBulkList } from '../../api';
import { showLoader } from '../../../reducers/loader';
import { toast } from 'react-toastify';
import LocationBulkDetails from './details';

const LocationBulk = () => {
  const [openUpload, setOpenUpload] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [locationBulkList, setLocationBulkList] = useState<PageableModel<LocationBulkModel>>();
  const { t } = useTranslation();
  const [selectedBulkFile, setSelectedBulkFile] = useState<LocationBulkModel>();
  const [currentSortField, setCurrentSortField] = useState('');
  const [currentSortDirection, setCurrentSortDirection] = useState(false);
  const [sortDirection, setSortDirection] = useState(false);
  const [activeSortField, setActiveSortField] = useState('');
  const dispatch = useAppDispatch();

  const loadData = useCallback(
    (page: number, size: number, field?: string, sortDirection?: boolean) => {
      dispatch(showLoader(true));
      getLocationBulkList(page, size, field, sortDirection)
        .then(res => {
          setLocationBulkList(res);
        })
        .catch(err => toast.error(err.message !== undefined ? err.message : err.toString()))
        .finally(() => dispatch(showLoader(false)));
    },
    [dispatch]
  );

  useEffect(() => {
    loadData(PAGINATION_DEFAULT_SIZE, 0);
  }, [loadData]);

  const sortHandler = (field: string, sortDirection: boolean) => {
    if (locationBulkList !== undefined) {
      setCurrentSortField(field);
      setCurrentSortDirection(sortDirection);
      loadData(locationBulkList.size, 0, field, sortDirection);
    }
  };

  const openBulkById = (selectedBulk: LocationBulkModel) => {
    setSelectedBulkFile(selectedBulk);
    setOpenDetails(true);
  };

  const closeHandler = () => {
    setOpenUpload(false);
    setOpenDetails(false);
    loadData(
      locationBulkList?.pageable.pageSize ?? PAGINATION_DEFAULT_SIZE,
      locationBulkList?.pageable.pageNumber ?? 0
    );
  };

  const paginationHandler = (size: number, page: number) => {
    loadData(size, page, currentSortField, currentSortDirection);
  };

  return (
    <>
      <Row className="mt-2">
        <Col>
          <h2 className="m-0">
            {t('userImportPage.importedFiles')} ({locationBulkList?.totalElements ?? 0})
          </h2>
        </Col>
        <Col>
          <Button className="float-end" onClick={() => setOpenUpload(true)}>
            {t('userImportPage.bulkImport')}
          </Button>
        </Col>
      </Row>

      <hr className="my-4" />
      {locationBulkList !== undefined && locationBulkList?.totalElements > 0 ? (
        <Table bordered responsive hover>
          <thead className="border border-2">
            <tr>
              {USER_BULK_TABLE_COLUMNS.map((el, index) => (
                <th
                  key={index}
                  onClick={() => {
                    setSortDirection(!sortDirection);
                    setActiveSortField(el.name);
                    sortHandler(el.sortValue, sortDirection);
                  }}
                >
                  {t('userImportPage.' + el.name)}
                  {activeSortField === el.name ? (
                    sortDirection ? (
                      <FontAwesomeIcon className="ms-1" icon="sort-up" />
                    ) : (
                      <FontAwesomeIcon className="ms-1" icon="sort-down" />
                    )
                  ) : (
                    <FontAwesomeIcon className="ms-1" icon="sort" />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {locationBulkList?.content?.map(el => (
              <tr onClick={() => openBulkById(el)} key={el.identifier}>
                <td>{el.filename}</td>
                <td>{formatDate(el.uploadDatetime)}</td>
                <td>{el.status}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p className="text-center lead">No bulk files found.</p>
      )}
      {locationBulkList !== undefined && locationBulkList.content.length > 0 ? (
        <Paginator
          totalElements={locationBulkList.totalElements}
          page={locationBulkList.pageable.pageNumber}
          size={locationBulkList.size}
          totalPages={locationBulkList.totalPages}
          paginationHandler={paginationHandler}
        />
      ) : null}
      {openUpload && (
        <ActionDialog
          backdrop
          closeHandler={() => closeHandler()}
          title="Upload Locations"
          element={<UploadLocation handleClose={() => closeHandler()} />}
        />
      )}
      {openDetails && selectedBulkFile !== undefined && (
        <LocationBulkDetails closeHandler={() => closeHandler()} locationBulkFile={selectedBulkFile} />
      )}
    </>
  );
};

export default LocationBulk;
