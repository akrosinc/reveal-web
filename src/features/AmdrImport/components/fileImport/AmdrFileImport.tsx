import React, { useCallback, useEffect, useState } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { PageableModel } from '../../../../api/providers';
import {
  BULK_TABLE_COLUMNS,
  METADATA_FILE_IMPORT,
  PAGINATION_DEFAULT_SIZE
} from '../../../../constants';
import { getAmdrImportList } from '../../api';
import AmdrDetailsModal from './detailsModal';
import AmdrUploadModal from './uploadModal';
import { useTranslation } from 'react-i18next';
import AuthorizedElement from '../../../../components/AuthorizedElement';
import { EntityTagResponse } from '../../../planSimulation/providers/types';
import MetadataImportTable from '../../../../components/Table/MetadataImportTable';
import { AmdrImportResponse } from '../../type';
import Paginator from '../../../../components/Pagination';
import TagAccess from '../../../access/TagAccess';
import RemoveTagAccess from '../../../access/RemoveTagAccess';
import DefaultTable from "../../../../components/Table/DefaultTable";

const AmdrFileImport = () => {
  const [open, setOpen] = useState(false);
  const [metadataImportPaged, setMetadataImportPaged] = useState<PageableModel<AmdrImportResponse>>();
  const [metadataImportList, setMetadataImportList] = useState<AmdrImportResponse[]>([]);
  const [selectedMetaImport, setSelectedMetaImport] = useState<any>();

  const { t } = useTranslation();

  const loadData = useCallback((size: number, page: number, field?: string, direction?: boolean) => {
    getAmdrImportList(size, page, field, direction)
      .then(res => {
        let transformedMetadataList: AmdrImportResponse[] = res.content.map(fileImport => {

          let newFileImport: AmdrImportResponse = {
            filename: fileImport.filename,
            status: fileImport.status,
            identifier: fileImport.identifier,
            uploadDatetime: fileImport.uploadDatetime,
            uploadedBy: fileImport.uploadedBy,
          };

          return newFileImport;
        });

        setMetadataImportList(transformedMetadataList);
        setMetadataImportPaged(res);
      })
      .catch(err => toast.error(err));
  }, []);

  useEffect(() => {
    loadData(10, 0);
  }, [loadData]);

  const paginationHandler = (size: number, page: number) => {
    loadData(size, page);
  };

  const sortHandler = (field: string, direction: boolean) => {
    loadData(PAGINATION_DEFAULT_SIZE, 0, field, direction);
  };



  return (
    <>
      <div className=" my-4">
        <Row>
          <Col>
            <h2>Amdr Imports({metadataImportPaged?.content?.length})</h2>
          </Col>
          <Col>
            <AuthorizedElement roles={[METADATA_FILE_IMPORT]}>
              <Button onClick={() => setOpen(!open)} className={''} style={{ float: 'right' }}>
                {t('metadataImport.uploadFile')}
              </Button>
            </AuthorizedElement>
          </Col>
        </Row>
        <Row>
          {metadataImportPaged && metadataImportPaged.content.length ? (
            <>
              <DefaultTable
                  columns={BULK_TABLE_COLUMNS}
                data={metadataImportList}
                clickHandler={el => setSelectedMetaImport(el)}
                sortHandler={sortHandler}
              />
              {!metadataImportPaged.empty ? (
                <Paginator
                  page={metadataImportPaged.pageable.pageNumber}
                  size={metadataImportPaged.size}
                  totalElements={metadataImportPaged.totalElements}
                  totalPages={metadataImportPaged.totalPages}
                  paginationHandler={paginationHandler}
                />
              ) : null}
            </>
          ) : (
            'No data found.'
          )}
        </Row>
      </div>
      {open && (
        <AmdrUploadModal
          closeHandler={() => {
            loadData(PAGINATION_DEFAULT_SIZE, 0);
            setOpen(false);
          }}
        />
      )}
      {selectedMetaImport && (
        <AmdrDetailsModal
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

export default AmdrFileImport;
