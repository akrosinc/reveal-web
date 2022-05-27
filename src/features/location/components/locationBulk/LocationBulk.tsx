import React, { useEffect, useState, useCallback } from 'react';
import { Row, Col, Button, Table } from 'react-bootstrap';
import { PageableModel } from '../../../../api/providers';
import { useTranslation } from 'react-i18next';
import { LocationBulkModel, LocationBulkDetailsModel } from '../../providers/types';
import { ActionDialog } from '../../../../components/Dialogs';
import UploadLocation from './upload';
import Paginator from '../../../../components/Pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatDate } from '../../../../utils';
import { useAppDispatch } from '../../../../store/hooks';
import { PAGINATION_DEFAULT_SIZE, BULK_TABLE_COLUMNS } from '../../../../constants';
import { getLocationBulkListById, getLocationBulkList } from '../../api';
import { showLoader } from '../../../reducers/loader';
import { toast } from 'react-toastify';
import LocationBulkDetails from './details';
import { BulkStatus } from '../../../user/providers/types';

const LocationBulk = () => {
  const [openUpload, setOpenUpload] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [locationBulkList, setLocationBulkList] = useState<PageableModel<LocationBulkModel>>();
  const [selectedBulkLocationList, setSelectedBulkLocationList] = useState<PageableModel<LocationBulkDetailsModel>>();
  const { t } = useTranslation();
  const [selectedBulkFile, setSelectedBulkFile] = useState<LocationBulkModel>();
  const [currentSortField, setCurrentSortField] = useState('');
  const [currentSortDirection, setCurrentSortDirection] = useState(false);
  const [sortDirection, setSortDirection] = useState(false);
  const [activeSortField, setActiveSortField] = useState('');
  const dispatch = useAppDispatch();
  const [interval, setSelectedInterval] = useState<NodeJS.Timeout>();

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
    dispatch(showLoader(true));
    getLocationBulkListById(PAGINATION_DEFAULT_SIZE, 0, selectedBulk.identifier)
      .then(res => {
        setSelectedBulkFile(selectedBulk);
        setSelectedBulkLocationList(res);
        setOpenDetails(true);
        if (selectedBulk.status !== BulkStatus.COMPLETE) {
          setSelectedInterval(
            setInterval(() => {
              getLocationBulkListById(PAGINATION_DEFAULT_SIZE, 0, selectedBulk.identifier).then(res => {
                setSelectedBulkLocationList(res);
              });
            }, 5000)
          );
        }
      })
      .catch(err => toast.error(err.message ? err.message : 'Error loading bulk details'))
      .finally(() => dispatch(showLoader(false)));
  };

  const closeHandler = () => {
    setOpenUpload(false);
    setOpenDetails(false);
    if (interval) {
      clearInterval(interval);
    }
    loadData(
      locationBulkList?.pageable.pageSize ?? PAGINATION_DEFAULT_SIZE,
      locationBulkList?.pageable.pageNumber ?? 0
    );
  };

  //Clear interval after component unmount
  useEffect(() => {
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [interval]);

  const paginationHandler = (size: number, page: number) => {
    if (openDetails) {
      dispatch(showLoader(true));
      getLocationBulkListById(size, page, selectedBulkFile?.identifier ?? '')
        .then(res => {
          setSelectedBulkLocationList(res);
        })
        .catch(err => toast.error('Error loading bulk details'))
        .finally(() => dispatch(showLoader(false)));
    } else {
      loadData(size, page, currentSortField, currentSortDirection);
    }
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
          <Button id="import-locations-button" className="float-end" onClick={() => setOpenUpload(true)}>
            {t('userImportPage.bulkImport')}
          </Button>
        </Col>
      </Row>

      <hr className="my-4" />
      {locationBulkList !== undefined && locationBulkList?.totalElements > 0 ? (
        <Table bordered responsive hover>
          <thead className="border border-2">
            <tr>
              {BULK_TABLE_COLUMNS.map((el, index) => (
                <th
                  id={el.name + '-sort'}
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
                <td>{el.uploadedBy}</td>
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
          closeHandler={() => closeHandler()}
          title="Upload Locations"
          element={<UploadLocation handleClose={() => closeHandler()} />}
        />
      )}
      {openDetails && selectedBulkFile !== undefined && selectedBulkLocationList !== undefined && (
        <LocationBulkDetails
          closeHandler={() => closeHandler()}
          locationBulkFile={selectedBulkFile}
          locationList={selectedBulkLocationList}
          paginationHandler={paginationHandler}
        />
      )}
    </>
  );
};

export default LocationBulk;
