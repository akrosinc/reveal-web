import React, { useCallback, useEffect, useState } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { PageableModel } from '../../../../api/providers';
import { METADATA_FILE_IMPORT, METADATA_FILE_IMPORT_GRANT_ACCESS, METADATA_FILE_IMPORT_REMOVE_ACCESS, METADATA_FILE_IMPORT_UPLOAD_FILE, PAGINATION_DEFAULT_SIZE } from '../../../../constants';
import { getMetadataImportList } from '../../api';
import DetailsModal from './detailsModal';
import UploadModal from './uploadModal';
import { useTranslation } from 'react-i18next';
import AuthorizedElement from '../../../../components/AuthorizedElement';
import { EntityTagResponse } from '../../../planSimulation/providers/types';
import MetadataImportTable from '../../../../components/Table/MetadataImportTable';
import { MetadataFileImportResponse } from '../../type';
import Paginator from '../../../../components/Pagination';
import TagAccess from '../../../access/TagAccess';
import RemoveTagAccess from '../../../access/RemoveTagAccess';

const MetaFileImport = () => {
  const [open, setOpen] = useState(false);
  const [openAccess, setOpenAccess] = useState(false);
  const [metadataImportPaged, setMetadataImportPaged] = useState<PageableModel<MetadataFileImportResponse>>();
  const [metadataImportList, setMetadataImportList] = useState<MetadataFileImportResponse[]>([]);
  const [selectedMetadata, setSelectedMetadata] = useState<EntityTagResponse[]>([]);
  const [selectedMetaImport, setSelectedMetaImport] = useState<any>();
  const [showRemoveAccess, setShowRemoveAccess] = useState(false);
  // const [setEntityTagsCreated] = useState<EntityTag[]>();

  const { t } = useTranslation();

  const loadData = useCallback((size: number, page: number, field?: string, direction?: boolean) => {
    getMetadataImportList(size, page, field, direction)
      .then(res => {
        let transformedMetadataList: MetadataFileImportResponse[] = res.content.map(fileImport => {
          let entityTagsNotAggregate: EntityTagResponse[] | undefined = fileImport.entityTagEvents?.filter(
            entityTag => !entityTag.aggregate
          );

          let entityTagWithChildren = entityTagsNotAggregate?.map(entityTag => {
            entityTag.children = fileImport.entityTagEvents?.filter(entityTagEvent => {
              return entityTagEvent.aggregate && entityTagEvent.referencedTag === entityTag.identifier;
            });
            return entityTag;
          });

          let newFileImport: MetadataFileImportResponse = {
            selected: fileImport.selected,
            entityTagEvents: entityTagWithChildren,
            filename: fileImport?.datasetName || fileImport?.filename,
            status: fileImport.status,
            identifier: fileImport.identifier,
            uploadDatetime: fileImport.uploadDatetime,
            uploadedBy: fileImport.uploadedBy,
            owner: fileImport.owner,
            owners: fileImport.owners
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

  useEffect(() => {
    let selectedMetadata: EntityTagResponse[] = [];
    metadataImportList?.forEach(metadataItem =>
      metadataItem.entityTagEvents
        ?.filter(metaEvent => metaEvent.selected)
        .forEach(metaEvent => {
          const meta = new EntityTagResponse(
            metaEvent.identifier,
            metaEvent.tag,
            metaEvent.owner,
            metaEvent.owners,
            metaEvent.definition,
            metaEvent.valueType,
            metaEvent.aggregate,
            metaEvent.created,
            metaEvent.metadataImportId,
            metaEvent.referencedTag,
            metaEvent.tagAccGrantsOrganization,
            metaEvent.tagAccGrantsUser,
            metaEvent.public,
            metaEvent.children,
            metaEvent.selected,
            metaEvent.resultingOrgs,
            metaEvent.resultingUsers
          );
          selectedMetadata.push(meta);
          if (metaEvent.children && metaEvent.children.length > 0) {
            metaEvent.children
              .filter(metaChild => metaChild.selected)
              .forEach(metaChild => {
                const metaChildObj = new EntityTagResponse(
                  metaChild.identifier,
                  metaChild.tag,
                  metaChild.owner,
                  metaChild.owners,
                  metaChild.definition,
                  metaChild.valueType,
                  metaChild.aggregate,
                  metaChild.created,
                  metaChild.metadataImportId,
                  metaChild.referencedTag,
                  metaChild.tagAccGrantsOrganization,
                  metaChild.tagAccGrantsUser,
                  metaChild.public,
                  metaChild.children,
                  metaChild.selected,
                  metaChild.resultingOrgs,
                  metaChild.resultingUsers
                );

                selectedMetadata.push(metaChildObj);
              });
          }
        })
    );
    setSelectedMetadata(selectedMetadata);
  }, [metadataImportList]);

  const setTagGrantsUpdated = () => {
    setOpenAccess(false);
    setShowRemoveAccess(false);
    loadData(PAGINATION_DEFAULT_SIZE, 0);
  };

  return (
    <>
      <div className=" my-4">
        <Row>
          <Col>
            <h2>Metadata Imports({metadataImportPaged?.content?.length})</h2>
          </Col>
          <Col>
            <AuthorizedElement
              // roles={[METADATA_FILE_IMPORT]}
              roles={[METADATA_FILE_IMPORT_UPLOAD_FILE]}
            >
              <Button onClick={() => setOpen(!open)} className={''} style={{ float: 'right' }}>
                {t('metadataImport.uploadFile')}
              </Button>
            </AuthorizedElement>
            <AuthorizedElement
              // roles={[METADATA_FILE_IMPORT]}
              roles={[METADATA_FILE_IMPORT_GRANT_ACCESS]}
            >
              <Button
                disabled={selectedMetadata.length === 0}
                onClick={() => setOpenAccess(!openAccess)}
                className={'mx-2'}
                style={{ float: 'right' }}
              >
                Grant Access
              </Button>
            </AuthorizedElement>
            <AuthorizedElement
              // roles={[METADATA_FILE_IMPORT]}
              roles={[METADATA_FILE_IMPORT_REMOVE_ACCESS]}
            >
              <Button
                variant={'outline-primary'}
                disabled={selectedMetadata.length === 0}
                onClick={() => setShowRemoveAccess(!showRemoveAccess)}
                className={'mx-2'}
                style={{ float: 'right' }}
              >
                Remove Access
              </Button>
            </AuthorizedElement>
          </Col>
        </Row>
        <Row>
          {metadataImportPaged && metadataImportPaged.content.length ? (
            <>
              <MetadataImportTable
                data={metadataImportList}
                clickHandler={el => setSelectedMetaImport(el)}
                sortHandler={sortHandler}
                setMetadataList={setMetadataImportList}
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
        <UploadModal
          closeHandler={() => {
            loadData(PAGINATION_DEFAULT_SIZE, 0);
            setOpen(false);
          }}
          setTagsCreated={() => { }}
        // setTagsCreated={setEntityTagsCreated}
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
      {showRemoveAccess && (
        <RemoveTagAccess
          showRemoveAccess={showRemoveAccess}
          setShowRemoveAccess={setTagGrantsUpdated}
          selectedMetadata={selectedMetadata}
          setTagGrantsUpdated={setTagGrantsUpdated}
          type={'tag'}
        />
      )}
      {openAccess && (
        <TagAccess
          showTagAccess={openAccess}
          setShowTagAccess={setTagGrantsUpdated}
          setTagGrantsUpdated={setTagGrantsUpdated}
          selectedMetadata={selectedMetadata}
          type={'tag'}
        />
      )}
    </>
  );
};

export default MetaFileImport;
