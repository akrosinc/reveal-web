import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Button, Card, Col, Form, InputGroup, Row } from 'react-bootstrap';
import { WizardStepProps } from '../Wizard/Wizard';
import AuthorizedElement from '../../../../components/AuthorizedElement';
import DatasetImportTable from './DatasetDetails/DatasetImportTable';
import Paginator from '../../../../components/Pagination';
import TagAccess from '../../../access/TagAccess';
import RemoveTagAccess from '../../../access/RemoveTagAccess';
import DetailsModal from './DatasetDetails/detailsModal';
import UploadModal from './DatasetDetails/uploadModal';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../store/hooks';
import { MetadataFileImportResponse } from '../../../metaDataImport/type';
import { PageableModel } from '../../../../api/providers';
import { getInstanceDatasets, DatasetResponse, DatasetEntityTag, getComplexTags, ComplexTagResponse } from '../../api/instanceAPI';
import ComplexTagTable from './DatasetDetails/ComplexTagTable';
import { Nav } from 'react-bootstrap';
import { EntityTagResponse } from '../../../planSimulation/providers/types';
import { toast } from 'react-toastify';

const DEFAULT_PAGE_SIZE = 10;

const DatasetDetails: React.FC<WizardStepProps> = ({ onBack, onNext, defaultValues, viewOnly }) => {
  const { t } = useTranslation();
  const isDarkMode = useAppSelector((state: any) => state.darkMode.value);
  const [open, setOpen] = useState(false);
  const [openAccess, setOpenAccess] = useState(false);
  const [metadataImportList, setMetadataImportList] = useState<MetadataFileImportResponse[]>([]);
  const [selectedMetadata, setSelectedMetadata] = useState<any[]>([]);
  const [selectedMetaImport, setSelectedMetaImport] = useState<any>();
  const [showRemoveAccess, setShowRemoveAccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeTab, setActiveTab] = useState<'simple' | 'complex'>('simple');
  const [complexTagsList, setComplexTagsList] = useState<ComplexTagResponse[]>([]);
  const [selectedComplexTags, setSelectedComplexTags] = useState<number[]>(defaultValues?.complexTags || []);
  // Persistent storage for selected tag identifiers across reloads/filters
  const selectedTagIdsRef = React.useRef<Set<string>>(new Set(defaultValues?.datasets_tags || []));
  const [datasetsPagination, setDatasetsPagination] = useState<PageableModel<DatasetResponse>>();
  const [complexTagsPagination, setComplexTagsPagination] = useState<PageableModel<ComplexTagResponse>>();

  useEffect(() => {
    // Sync ref with current metadataImportList selections
    // We only update the ref for items that are currently in the list (visible)
    const nextIds = new Set(selectedTagIdsRef.current);
    metadataImportList.forEach(item => {
      item.entityTagEvents?.forEach((tag: any) => {
        if (tag.selected) {
          nextIds.add(tag.identifier);
        } else {
          nextIds.delete(tag.identifier);
        }
      });
    });
    selectedTagIdsRef.current = nextIds;
  }, [metadataImportList]);
  const loadData = useCallback(
    (size: number = DEFAULT_PAGE_SIZE, page: number = 0, search?: string) => {
      let isPublic: boolean | undefined = undefined;
      if (statusFilter === 'Public') isPublic = true;
      else if (statusFilter === 'Private') isPublic = false;

      getInstanceDatasets(defaultValues.locationHierarchy, isPublic, size, page, search !== undefined ? search : searchTerm)
        .then((res: PageableModel<DatasetResponse>) => {
          setDatasetsPagination(res);
          const previouslySelectedTags = selectedTagIdsRef.current;

          let transformedMetadataList: MetadataFileImportResponse[] = res.content.map((dataset: DatasetResponse) => {
            let entityTagWithChildren = dataset.datasetEntityTags?.map((tag: DatasetEntityTag) => {
              // Sync with previous selections
              const isTagSelected = previouslySelectedTags.has(tag.identifier);

              const tagResponse: EntityTagResponse = {
                identifier: tag.identifier,
                tag: tag.tag,
                public: tag.isPublic,
                selected: isTagSelected,
                aggregate: false,
                children: [],
                instances: tag.instances
              } as any;

              return tagResponse;
            });

            const fileSelected = entityTagWithChildren && entityTagWithChildren.length > 0 &&
              entityTagWithChildren.every(tag => tag.selected);

            let newFileImport: MetadataFileImportResponse = {
              selected: fileSelected || false,
              entityTagEvents: entityTagWithChildren as any,
              filename: dataset.datasetName || '',
              status: 'Imported',
              identifier: dataset.identifier,
              uploadDatetime: dataset.uploadDatetime,
              uploadedBy: dataset.uploadedBy || '',
              owner: true,
              owners: []
            };

            return newFileImport;
          });

          setMetadataImportList(transformedMetadataList);
        })
        .catch((err: any) => toast.error(err));
    },
    [statusFilter, defaultValues?.datasets_tags, defaultValues.locationHierarchy, searchTerm]
  );

  const loadComplexTags = useCallback(
    (size: number = DEFAULT_PAGE_SIZE, page: number = 0, search?: string) => {
      let isPublic: boolean | undefined = undefined;
      if (statusFilter === 'Public') isPublic = true;
      else if (statusFilter === 'Private') isPublic = false;

      getComplexTags(defaultValues.locationHierarchy, isPublic, size, page, search !== undefined ? search : searchTerm)
        .then((res: PageableModel<ComplexTagResponse>) => {
          setComplexTagsPagination(res);
          setComplexTagsList(res.content);
        })
        .catch((err: any) => toast.error(err));
    },
    [statusFilter, defaultValues.locationHierarchy, searchTerm]
  );



  useEffect(() => {
    if (activeTab === 'simple') {
      loadData(DEFAULT_PAGE_SIZE, 0, '');
    } else {
      loadComplexTags(DEFAULT_PAGE_SIZE, 0, '');
    }
  }, [activeTab, statusFilter]);



  const handleUpdateFromTable = useCallback((updatedFilteredList: MetadataFileImportResponse[]) => {
    setMetadataImportList(prev => {
      const copy = [...prev];
      updatedFilteredList.forEach(updatedItem => {
        const index = copy.findIndex(item => item.identifier === updatedItem.identifier);
        if (index > -1) {
          copy[index] = updatedItem;
        }
      });
      return copy;
    });
  }, []);

  const paginationHandler = (size: number, page: number) => {
    if (activeTab === 'simple') {
      loadData(size, page);
    } else {
      loadComplexTags(size, page);
    }
  };

  const sortHandler = (field: string, direction: boolean) => {
    // Sort logic could go here, potentially calling the backend if sorted by non-FE logic
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (activeTab === 'simple') {
      loadData(DEFAULT_PAGE_SIZE, 0, val);
    } else {
      loadComplexTags(DEFAULT_PAGE_SIZE, 0, val);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setStatusFilter(val);
    setSearchTerm('');
    if (activeTab === 'simple') {
      loadData(DEFAULT_PAGE_SIZE, 0, '');
    } else {
      loadComplexTags(DEFAULT_PAGE_SIZE, 0, '');
    }
  };

  const handleComplexTagSelectionChange = (id: number, selected: boolean) => {
    setSelectedComplexTags(prev => {
      if (selected) {
        return [...prev, id];
      } else {
        return prev.filter(tagId => tagId !== id);
      }
    });
  };

  // Track selection of only main tags
  useEffect(() => {
    let selected: any[] = [];
    metadataImportList?.forEach(metadataItem => {
      metadataItem.entityTagEvents?.forEach((metaEvent: any) => {
        if (metaEvent.selected) {
          selected.push(metaEvent);
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
      >
        <Card className={`border shadow-sm rounded-3 ${isDarkMode ? 'border-white' : ''}`} style={{ background: isDarkMode ? '#212529' : '' }}>
          <Card.Header
            className={`d-flex align-items-center justify-content-between ${isDarkMode ? 'border-bottom text-white' : 'bg-light'} fw-bold`}
          >
            <h5 className="mb-0 fw-bold">Datasets</h5>
            {!viewOnly && (
              <Button
                variant="primary"
                className="rounded-circle p-0 d-flex align-items-center justify-content-center"
                style={{ width: '24px', height: '24px', fontSize: '14px' }}
                onClick={() => setOpen(true)}
              >
                +
              </Button>
            )}
          </Card.Header>
          <Card.Body style={isDarkMode ? { backgroundColor: '#282828' } : {}}>
            <Row className="mb-3">
              <Col>
                <Nav variant="tabs" activeKey={activeTab} onSelect={(k: any) => {
                  setActiveTab(k);
                  setSearchTerm('');
                }}>
                  <Nav.Item>
                    <Nav.Link eventKey="simple">Simple Tags</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="complex">Complex Tags</Nav.Link>
                  </Nav.Item>
                </Nav>
              </Col>
            </Row>
            <Row className="mb-3 g-2">
              <Col md={4}>
                <InputGroup>
                  <Form.Control
                    placeholder="Search by dataset name or owner"
                    value={searchTerm}
                    onChange={handleSearch}
                    className="form-control"
                    disabled={viewOnly}
                  />
                </InputGroup>
              </Col>
              <Col md={{ span: 2, offset: 6 }}>
                <Form.Select
                  className="custom-react-select-container"
                  value={statusFilter}
                  onChange={handleFilterChange}
                  disabled={viewOnly}
                >
                  <option value="All">All</option>
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                </Form.Select>
              </Col>
            </Row>

            <Row>
              {activeTab === 'simple' ? (
                metadataImportList.length ? (
                  <>
                    <DatasetImportTable
                      data={metadataImportList}
                      clickHandler={el => setSelectedMetaImport(el)}
                      sortHandler={sortHandler}
                      setMetadataList={handleUpdateFromTable}
                      searchTerm={searchTerm}
                      viewOnly={viewOnly}
                    />
                    {datasetsPagination && (
                      <Paginator
                        page={datasetsPagination.pageable.pageNumber}
                        size={datasetsPagination.size}
                        totalElements={datasetsPagination.totalElements}
                        totalPages={datasetsPagination.totalPages}
                        paginationHandler={paginationHandler}
                      />
                    )}
                  </>
                ) : (
                  <div className="p-3 text-center w-100">No data found.</div>
                )
              ) : (
                complexTagsList.length ? (
                  <>
                    <ComplexTagTable
                      data={complexTagsList}
                      selectedComplexTags={selectedComplexTags}
                      onSelectionChange={handleComplexTagSelectionChange}
                      viewOnly={viewOnly}
                    />
                    {complexTagsPagination && (
                      <Paginator
                        page={complexTagsPagination.pageable.pageNumber}
                        size={complexTagsPagination.size}
                        totalElements={complexTagsPagination.totalElements}
                        totalPages={complexTagsPagination.totalPages}
                        paginationHandler={paginationHandler}
                      />
                    )}
                  </>
                ) : (
                  <div className="p-3 text-center w-100">No complex tags found.</div>
                )
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
        <Button
          variant="secondary"
          onClick={() => {
            const datasetsTags = Array.from(selectedTagIdsRef.current);
            onBack({ datasets_tags: datasetsTags, complexTags: selectedComplexTags });
          }}
        >
          Back
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            const datasetsTags = Array.from(selectedTagIdsRef.current);

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
              datasets_tags: datasetsTags || [],
              complexTags: selectedComplexTags || []
            };
            console.log('final payload--instance configuration', finalPayload)
            if (onNext) {
              onNext(finalPayload);
            }
          }}
        >
          {viewOnly ? 'Finish View' : 'Finish'}
        </Button>
      </div>
    </div>
  );
};

export default DatasetDetails;
