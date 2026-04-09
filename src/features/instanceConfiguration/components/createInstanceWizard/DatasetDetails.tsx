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
import { getInstanceDatasets, DatasetResponse, DatasetEntityTag } from '../../api/instanceAPI';
import { EntityTagResponse } from '../../../planSimulation/providers/types';
import { toast } from 'react-toastify';

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

  const loadData = useCallback(
    () => {
      let isPublic: boolean | undefined = undefined;
      if (statusFilter === 'Public') isPublic = true;
      else if (statusFilter === 'Private') isPublic = false;

      getInstanceDatasets(defaultValues.locationHierarchy, isPublic)
        .then((res: PageableModel<DatasetResponse>) => {
          const previouslySelectedTags = new Set(defaultValues?.datasets_tags || []);

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
    [statusFilter, defaultValues?.datasets_tags]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Frontend search filter
  const filteredMetadataList = useMemo(() => {
    const s = searchTerm.toLowerCase();
    if (!s) return metadataImportList;

    return metadataImportList
      .map(item => {
        // Search in dataset name
        const matchesName = (item.filename || '').toLowerCase().includes(s);
        // Search in uploadedBy (owner)
        const matchesOwner = (item.uploadedBy || '').toLowerCase().includes(s);
        // Search in tags
        const matchingTags = (item.entityTagEvents || []).filter((tagEvent: any) =>
          (tagEvent.tag || '').toLowerCase().includes(s)
        );

        // Include dataset if name, owner, or any tag matches
        if (matchesName || matchesOwner || matchingTags.length > 0) {
          return {
            ...item,
            // If any tags match, we can optionally filter the displayed tags
            // But if the name matched, we should probably show all tags.
            // Let's only filter tags if the name/owner DID NOT match, or if it's more specific?
            // Actually, showing ONLY matching tags when searching for tags is much more useful.
            entityTagEvents: matchingTags.length > 0 ? matchingTags : item.entityTagEvents
          };
        }
        return null;
      })
      .filter(item => item !== null) as MetadataFileImportResponse[];
  }, [metadataImportList, searchTerm]);

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
    // Frontend pagination logic could go here if needed
  };

  const sortHandler = (field: string, direction: boolean) => {
    // Sort logic could go here, potentially calling the backend if sorted by non-FE logic
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setSearchTerm('')
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
              {filteredMetadataList.length ? (
                <>
                  <DatasetImportTable
                    data={filteredMetadataList}
                    clickHandler={el => setSelectedMetaImport(el)}
                    sortHandler={sortHandler}
                    setMetadataList={handleUpdateFromTable}
                    searchTerm={searchTerm}
                    viewOnly={viewOnly}
                  />
                  <Paginator
                    page={0}
                    size={filteredMetadataList.length}
                    totalElements={filteredMetadataList.length}
                    totalPages={1}
                    paginationHandler={paginationHandler}
                  />
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
        <Button
          variant="secondary"
          onClick={() => {
            const datasetsTags = selectedMetadata.map((tag: any) => tag.identifier);
            onBack({ datasets_tags: datasetsTags });
          }}
        >
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
              datasets_tags: datasetsTags || []
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
