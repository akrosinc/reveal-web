import React, { useState, useEffect } from 'react';
import { Button, Table, Col, Row } from 'react-bootstrap';
import { PageableModel } from '../../../../api/providers';
import { ActionDialog } from '../../../../components/Dialogs';
import Paginator from '../../../../components/Pagination';
import { PAGINATION_DEFAULT_SIZE, BULK_TABLE_COLUMNS } from '../../../../constants';
import { useAppDispatch } from '../../../../store/hooks';
import { formatDate } from '../../../../utils';
import { showLoader } from '../../../reducers/loader';
import { getBulkById, getBulkList } from '../../api';
import { BulkDetailsModel, UserBulk } from '../../providers/types';
import CreateBulk from './create';
import BulkDetails from './details';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslation } from 'react-i18next';

const UserImport = () => {
  const [openCreate, setOpenCreate] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [bulkList, setBulkList] = useState<PageableModel<UserBulk>>();
  const [selectedBulk, setSelectedBulk] = useState<PageableModel<BulkDetailsModel>>();
  const [selectedBulkFile, setSelectedBulkFile] = useState<UserBulk>();
  const [currentSortField, setCurrentSortField] = useState('');
  const [currentSortDirection, setCurrentSortDirection] = useState(false);
  const [sortDirection, setSortDirection] = useState(false);
  const [activeSortField, setActiveSortField] = useState('');
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const closeHandler = () => {
    setOpenCreate(false);
    setOpenDetails(false);
    getBulkList(
      bulkList?.size ?? PAGINATION_DEFAULT_SIZE,
      bulkList?.pageable.pageNumber ?? 0,
      '',
      currentSortField,
      currentSortDirection
    ).then(res => {
      setBulkList(res);
    });
  };

  const paginationHandler = (size: number, page: number) => {
    if (openDetails && selectedBulkFile !== undefined) {
      dispatch(showLoader(true));
      getBulkById(size, page, selectedBulkFile.identifier).then(res => {
        setSelectedBulk(res);
        setSelectedBulkFile(selectedBulkFile);
        dispatch(showLoader(false));
      });
    } else {
      getBulkList(size, page).then(res => {
        setBulkList(res);
      });
    }
  };

  const openBulkById = (selectedFile: UserBulk) => {
    dispatch(showLoader(true));
    getBulkById(PAGINATION_DEFAULT_SIZE, 0, selectedFile.identifier).then(res => {
      setSelectedBulk(res);
      setSelectedBulkFile(selectedFile);
      setOpenDetails(true);
      dispatch(showLoader(false));
    });
  };

  useEffect(() => {
    getBulkList(PAGINATION_DEFAULT_SIZE, 0).then(res => {
      setBulkList(res);
    });
  }, []);

  const sortHandler = (field: string, sortDirection: boolean) => {
    if (bulkList !== undefined) {
      setCurrentSortField(field);
      setCurrentSortDirection(sortDirection);
      getBulkList(bulkList.size, 0, '', field, sortDirection).then(res => {
        setBulkList(res);
      });
    }
  };

  return (
    <>
      <Row className="mt-2">
        <Col>
          <h2 className="m-0">
            {t('userImportPage.importedFiles')} ({bulkList?.totalElements ?? 0})
          </h2>
        </Col>
        <Col>
          <Button id="import-button" className="float-end" onClick={() => setOpenCreate(true)}>
            {t('userImportPage.bulkImport')}
          </Button>
        </Col>
      </Row>

      <hr className="my-4" />
      {bulkList !== undefined && bulkList?.totalElements > 0 ? (
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
            {bulkList?.content?.map(el => (
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
      {bulkList !== undefined && bulkList.content.length > 0 ? (
        <Paginator
          totalElements={bulkList.totalElements}
          page={bulkList.pageable.pageNumber}
          size={bulkList.size}
          totalPages={bulkList.totalPages}
          paginationHandler={paginationHandler}
        />
      ) : null}
      {openCreate && (
        <ActionDialog
          closeHandler={closeHandler}
          title="Import users"
          element={<CreateBulk handleClose={closeHandler} />}
        />
      )}
      {openDetails && selectedBulk !== undefined && (
        <BulkDetails
          userList={selectedBulk}
          bulkFile={selectedBulkFile}
          handleClose={closeHandler}
          paginationHandler={paginationHandler}
        />
      )}
    </>
  );
};

export default UserImport;
