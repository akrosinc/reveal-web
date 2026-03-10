import React, { useCallback, useEffect, useState } from 'react';
import { Button, Card, Col, Form, InputGroup, Row } from 'react-bootstrap';
import { WizardStepProps } from '../Wizard/Wizard';
import { METADATA_FILE_IMPORT, PAGINATION_DEFAULT_SIZE } from '../../../../constants';
import AuthorizedElement from '../../../../components/AuthorizedElement';
import DatasetImportTable from './DatasetDetails/DatasetImportTable';
import Paginator from '../../../../components/Pagination';
import TagAccess from '../../../access/TagAccess';
import RemoveTagAccess from '../../../access/RemoveTagAccess';
import DetailsModal from './DatasetDetails/detailsModal';
import UploadModal from './DatasetDetails/uploadModal';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../store/hooks';
import { getMetadataImportList } from '../../../metaDataImport/api';
import { toast } from 'react-toastify';
import { EntityTagResponse } from '../../../planSimulation/providers/types';
import { MetadataFileImportResponse } from '../../../metaDataImport/type';
import { PageableModel } from '../../../../api/providers';

const DatasetDetails: React.FC<WizardStepProps> = ({ onBack, onNext, defaultValues }) => {
  const { t } = useTranslation();
  const isDarkMode = useAppSelector((state: any) => state.darkMode.value);
  const [open, setOpen] = useState(false);
  const [openAccess, setOpenAccess] = useState(false);
  const [metadataImportPaged, setMetadataImportPaged] = useState<PageableModel<MetadataFileImportResponse>>();
  const [metadataImportList, setMetadataImportList] = useState<MetadataFileImportResponse[]>([]);
  const [selectedMetadata, setSelectedMetadata] = useState<any[]>([]);
  const [selectedMetaImport, setSelectedMetaImport] = useState<any>();
  const [showRemoveAccess, setShowRemoveAccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const loadData = useCallback(
    (
      size: number = PAGINATION_DEFAULT_SIZE,
      page: number = 0,
      search?: string,
      status?: string,
      sortField?: string,
      direction?: boolean
    ) => {
      getMetadataImportList(size, page, sortField, direction)
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
              filename: fileImport.filename,
              status: fileImport.status,
              identifier: fileImport.identifier,
              uploadDatetime: fileImport.uploadDatetime,
              uploadedBy: fileImport.uploadedBy,
              owner: fileImport.owner,
              owners: fileImport.owners
            };

            return newFileImport;
          });

          // Local filtering for search and status if API doesn't support it yet
          // But looking at getMetadataImportList, it only takes size, page, field, direction
          const s = search ?? searchTerm;
          const st = status ?? statusFilter;

          let filtered = transformedMetadataList.filter(item => {
            const matchesSearch =
              item.filename.toLowerCase().includes(s.toLowerCase()) ||
              item.uploadedBy.toLowerCase().includes(s.toLowerCase());
            const matchesStatus = st === 'All' || (st === 'Public' && item.owner) || (st === 'Private' && !item.owner);
            return matchesSearch && matchesStatus;
          });

          setMetadataImportList(filtered);
          setMetadataImportPaged({
            ...res,
            content: filtered
          });
        })
        .catch(err => toast.error(err));
    },
    [searchTerm, statusFilter]
  );

  useEffect(() => {
    loadData(PAGINATION_DEFAULT_SIZE, 0);
  }, [loadData]);

  const paginationHandler = (size: number, page: number) => {
    loadData(size, page, searchTerm, statusFilter);
  };

  const sortHandler = (field: string, direction: boolean) => {
    loadData(PAGINATION_DEFAULT_SIZE, 0, searchTerm, statusFilter, field, direction);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    loadData(PAGINATION_DEFAULT_SIZE, 0, e.target.value, statusFilter);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    loadData(PAGINATION_DEFAULT_SIZE, 0, searchTerm, e.target.value);
  };

  // Track selection of only leaf nodes (tags)
  useEffect(() => {
    let selected: any[] = [];
    metadataImportList?.forEach(metadataItem => {
      metadataItem.entityTagEvents?.forEach((metaEvent: any) => {
        // Parent node but might be leaf if no children
        if (metaEvent.selected && (!metaEvent.children || metaEvent.children.length === 0)) {
          selected.push(metaEvent);
        }
        
        // Children (always leaves)
        if (metaEvent.children && metaEvent.children.length > 0) {
          metaEvent.children.forEach((child: any) => {
            if (child.selected) {
              selected.push(child);
            }
          });
        }
      });
    });
    setSelectedMetadata(selected);
  }, [metadataImportList]);

  const setTagGrantsUpdated = () => {
    setOpenAccess(false);
    setShowRemoveAccess(false);
    loadData();
  };

  return (
    <div
      className={`p-4 ${isDarkMode ? 'text-white' : 'bg-white'}`}
      style={isDarkMode ? { backgroundColor: '#282828' } : {}}
    >
      <div
        className={`p-4 ${isDarkMode ? 'text-white' : 'bg-white'}`}
        style={isDarkMode ? { backgroundColor: '#282828' } : {}}
      // className="my-4"
      >
        <Card className={`border  shadow-sm rounded-3 ${isDarkMode ? 'border-white' : ''}`} style={{ background: isDarkMode ? '#212529' : '' }}>
          <Card.Header
            className={`d-flex align-items-center justify-content-between ${isDarkMode ? 'border-bottom  text-white' : 'bg-light'} fw-bold`}
          >
            <h5 className="mb-0 fw-bold">Datasets</h5>
            <Button
              variant="primary"
              className="rounded-circle p-0 d-flex align-items-center justify-content-center"
              style={{ width: '24px', height: '24px', fontSize: '14px' }}
              onClick={() => setOpen(true)}
            >
              +
            </Button>
          </Card.Header>
          <Card.Body style={isDarkMode ? { backgroundColor: '#282828' } : {}}>
            <Row className="mb-3 g-2">
              <Col md={4}>
                <InputGroup>
                  <Form.Control
                    placeholder="Search by dataset name or owner"
                    value={searchTerm}
                    onChange={handleSearch}
                    className="form-control"
                  />
                </InputGroup>
              </Col>
              <Col md={{ span: 2, offset: 6 }}>
                <Form.Select
                  className="custom-react-select-container"
                  // classNamePrefix="custom-react-select"
                  value={statusFilter}
                  onChange={handleFilterChange}
                >
                  <option value="All">All</option>
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                </Form.Select>
              </Col>
            </Row>
            <Row>
              {metadataImportPaged && metadataImportPaged.content.length ? (
                <>
                  <DatasetImportTable
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
                <div className="p-3 text-center w-100">No data found.</div>
              )}
            </Row>
          </Card.Body>
        </Card>
      </div>

      {open && (
        <UploadModal
          closeHandler={() => {
            loadData();
            setOpen(false);
          }}
          setTagsCreated={() => { }}
        />
      )}
      {selectedMetaImport && (
        <DetailsModal
          closeHandler={() => {
            loadData();
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

      <div className="d-flex justify-content-between mt-4 border-top pt-4">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            const datasetsTags = selectedMetadata.map((tag: any) => tag.identifier);

            const formatDate = (date: any) => {
              if (!date) return '';
              const d = new Date(date);
              return d.toISOString().split('T')[0];
            };

            const finalPayload = {
              planRequest: {
                name: defaultValues?.name || '',
                title: defaultValues?.title || '',
                effectivePeriod: {
                  start: formatDate(defaultValues?.effectivePeriod?.start),
                  end: formatDate(defaultValues?.effectivePeriod?.end)
                },
                interventionType: defaultValues?.interventionType || '',
                locationHierarchy: defaultValues?.hierarchy || defaultValues?.locationHierarchy || '',
                goals: (defaultValues?.goals || []).map((goal: any) => ({
                  description: goal.description,
                  priority: goal.priority,
                  actions: (goal.actions || []).map((action: any) => ({
                    title: action.title,
                    description: action.description,
                    timingPeriod: {
                      start: formatDate(action.timingPeriod?.start),
                      end: formatDate(action.timingPeriod?.end)
                    },
                    formIdentifier: action.formIdentifier,
                    type: action.type,
                    conditions: action.conditions || []
                  }))
                })),
                hierarchyLevelTarget: defaultValues?.hierarchyLevelTarget || ''
              },
              instanceName: defaultValues?.instanceName || '',
              locationHierarchy: defaultValues?.hierarchy || defaultValues?.locationHierarchy || '',
              areas: defaultValues?.areas || [],
              members: defaultValues?.members || [],
              datasets_tags: datasetsTags
            };

            if (onNext) {
              onNext(finalPayload);
            }
          }}
        >
          Finish
        </Button>
      </div>
    </div>
  );
};

export default DatasetDetails;
