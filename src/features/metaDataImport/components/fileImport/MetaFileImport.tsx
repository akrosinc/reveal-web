import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { PageableModel } from '../../../../api/providers';
import Paginator from '../../../../components/Pagination';
import DefaultTable from '../../../../components/Table/DefaultTable';
import { META_IMPORT_TABLE_COLUMNS, PAGINATION_DEFAULT_SIZE } from '../../../../constants';
import { getMetadataImportList } from '../../api';
import DetailsModal from './detailsModal';
import UploadModal from './uploadModal';

const MetaFileImport = () => {
  const [open, setOpen] = useState(false);
  const [metadataList, setMetadataList] = useState<PageableModel<any>>();
  const [selectedMetaImport, setSelectedMetaImport] = useState<any>();

  useEffect(() => {
    getMetadataImportList(PAGINATION_DEFAULT_SIZE, 0).then(res => {
      setMetadataList(res);
    }).catch(err => toast.error(err));
  }, []);

  const paginationHandler = (size: number, page: number) => {
    getMetadataImportList(size, page).then(res => {
      setMetadataList(res);
    });
  };

  const sortHandler = (field: string, direction: boolean) => {
    getMetadataImportList(PAGINATION_DEFAULT_SIZE, 0, field, direction).then(res => {
      setMetadataList(res);
    });
  };

  return (
    <>
      <div className="d-flex justify-content-between my-4">
        <h2>Metadata Imports({metadataList?.totalElements})</h2>
        <Button onClick={() => setOpen(!open)}>Upload File</Button>
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
      {open && <UploadModal closeHandler={() => setOpen(false)} />}
      {selectedMetaImport && <DetailsModal closeHandler={() => setSelectedMetaImport(undefined)} selectedFile={selectedMetaImport} />}
    </>
  );
};

export default MetaFileImport;
