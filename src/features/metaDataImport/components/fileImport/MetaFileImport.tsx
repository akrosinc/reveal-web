import React, { useCallback, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { PageableModel } from '../../../../api/providers';
import Paginator from '../../../../components/Pagination';
import DefaultTable from '../../../../components/Table/DefaultTable';
import { META_IMPORT_TABLE_COLUMNS, PAGINATION_DEFAULT_SIZE } from '../../../../constants';
import { getMetadataImportList } from '../../api';
import DetailsModal from './detailsModal';
import UploadModal from './uploadModal';
import { useTranslation } from 'react-i18next';

const MetaFileImport = () => {
  const [open, setOpen] = useState(false);
  const [metadataList, setMetadataList] = useState<PageableModel<any>>();
  const [selectedMetaImport, setSelectedMetaImport] = useState<any>();

  const { t } = useTranslation();

  const loadData = useCallback((size: number, page: number, field?: string, direction?: boolean) => {
    getMetadataImportList(size, page, field, direction)
      .then(res => {
        setMetadataList(res);
      })
      .catch(err => toast.error(err));
  }, []);

  useEffect(() => {
    loadData(PAGINATION_DEFAULT_SIZE, 0);
  }, [loadData]);

  const paginationHandler = (size: number, page: number) => {
    loadData(size, page);
  };

  const sortHandler = (field: string, direction: boolean) => {
    loadData(PAGINATION_DEFAULT_SIZE, 0, field, direction);
  };

  return (
    <>
      <div className="d-flex justify-content-between my-4">
        <h2>Metadata Imports({metadataList?.totalElements})</h2>
        <Button onClick={() => setOpen(!open)}>{t('metadataImport.uploadFile')}</Button>
      </div>
      {metadataList && metadataList.content.length ? (
        <>
          <DefaultTable
            columns={META_IMPORT_TABLE_COLUMNS}
            data={metadataList.content}
            clickHandler={el => setSelectedMetaImport(el)}
            sortHandler={sortHandler}
          />
          <Paginator
            page={metadataList.pageable.pageNumber}
            size={metadataList.size}
            totalElements={metadataList.totalElements}
            totalPages={metadataList.totalPages}
            paginationHandler={paginationHandler}
          />
        </>
      ) : (
        'No data found.'
      )}
      {open && (
        <UploadModal
          closeHandler={() => {
            loadData(PAGINATION_DEFAULT_SIZE, 0);
            setOpen(false);
          }}
        />
      )}
      {selectedMetaImport && (
        <DetailsModal
          closeHandler={() => {
            loadData(PAGINATION_DEFAULT_SIZE, 0);
            setSelectedMetaImport(undefined);
          }}
          selectedFile={selectedMetaImport}
        />
      )}
    </>
  );
};

export default MetaFileImport;
