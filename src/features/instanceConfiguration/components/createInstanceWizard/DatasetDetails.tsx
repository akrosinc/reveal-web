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

// Comprehensive mock data to mimic API response structure
const MOCK_DATA: any[] = [
  {
    identifier: '1',
    filename: 'metadata_sample_v1.xlsx',
    uploadDatetime: '2024-02-12T08:30:00Z',
    status: 'SUCCESS',
    uploadedBy: 'John Doe',
    selected: false,
    owner: true,
    owners: [{ id: 'u1', username: 'jdoe' }],
    entityTagEvents: [
      {
        identifier: 'tag-101',
        tag: 'Temperature_Sensor_01',
        public: true,
        selected: false,
        aggregate: false,
        owner: true,
        owners: [{ id: 'u1', username: 'jdoe' }]
      },
      {
        identifier: 'tag-1011',
        tag: 'Temperature_Sensor_011',
        public: false,
        selected: false,
        aggregate: false,
        owner: true,
        owners: [{ id: 'u1', username: 'jdoe' }]
      }
    ]
  },
  {
    identifier: '2',
    filename: 'production_data_feb.xlsx',
    uploadDatetime: '2024-02-11T14:45:00Z',
    status: 'SUCCESS',
    uploadedBy: 'Jane Smith',
    selected: false,
    owner: false,
    owners: [{ id: 'u2', username: 'jsmith' }],
    entityTagEvents: [
      {
        identifier: 'tag-201',
        tag: 'Pressure_Gauge_A',
        public: false,
        selected: false,
        aggregate: false,
        owner: true,
        owners: [{ id: 'u2', username: 'jsmith' }]
      }
    ]
  },
  {
    identifier: '3',
    filename: 'covid-hiv.xlsx',
    uploadDatetime: '2024-02-10T10:00:00Z',
    status: 'SUCCESS',
    uploadedBy: 'Trevelen',
    selected: true,
    owner: false,
    owners: [{ id: 'u3', username: 'trevelen' }],
    entityTagEvents: [
      {
        identifier: 'tag-301',
        tag: 'covid-hiv.xlsx',
        public: false,
        selected: false,
        aggregate: false,
        owner: true,
        owners: [{ id: 'u3', username: 'trevelen' }]
      }
    ]
  },
  {
    identifier: '4',
    filename: 'population_stats.xlsx',
    uploadDatetime: '2024-02-09T16:20:00Z',
    status: 'SUCCESS',
    uploadedBy: 'Alice Wong',
    selected: false,
    owner: true,
    owners: [{ id: 'u4', username: 'awong' }],
    entityTagEvents: []
  },
  {
    identifier: '5',
    filename: 'weather_patterns.xlsx',
    uploadDatetime: '2024-02-08T09:15:00Z',
    status: 'SUCCESS',
    uploadedBy: 'Bob Miller',
    selected: false,
    owner: true,
    owners: [{ id: 'u5', username: 'bmiller' }],
    entityTagEvents: []
  },
  {
    identifier: '6',
    filename: 'economic_indicators.xlsx',
    uploadDatetime: '2024-02-07T11:45:00Z',
    status: 'SUCCESS',
    uploadedBy: 'Charlie Brown',
    selected: false,
    owner: false,
    owners: [{ id: 'u6', username: 'cbrown' }],
    entityTagEvents: []
  }
];

const DatasetDetails: React.FC<WizardStepProps> = ({ onBack, onNext, defaultValues }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [openAccess, setOpenAccess] = useState(false);
  const [metadataImportPaged, setMetadataImportPaged] = useState<any>();
  const [metadataImportList, setMetadataImportList] = useState<any[]>([]);
  const [selectedMetadata, setSelectedMetadata] = useState<any[]>([]);
  const [selectedMetaImport, setSelectedMetaImport] = useState<any>();
  const [showRemoveAccess, setShowRemoveAccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const loadData = useCallback(
    (search?: string, status?: string) => {
      const s = search ?? searchTerm;
      const st = status ?? statusFilter;

      // Simulating data loading with filtering
      let filtered = MOCK_DATA.filter(item => {
        const matchesSearch =
          item.filename.toLowerCase().includes(s.toLowerCase()) ||
          item.uploadedBy.toLowerCase().includes(s.toLowerCase());
        const matchesStatus = st === 'All' || (st === 'Public' && item.owner) || (st === 'Private' && !item.owner);
        return matchesSearch && matchesStatus;
      }).map(fileImport => ({ ...fileImport }));

      setMetadataImportList(filtered);
      setMetadataImportPaged({
        content: filtered,
        totalElements: filtered.length,
        totalPages: 1,
        size: filtered.length,
        pageable: { pageNumber: 0 },
        empty: filtered.length === 0
      });
    },
    [searchTerm, statusFilter]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const paginationHandler = (size: number, page: number) => {
    loadData(searchTerm, statusFilter);
  };

  const sortHandler = (field: string, direction: boolean) => {
    loadData(searchTerm, statusFilter);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    loadData(e.target.value, statusFilter);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    loadData(searchTerm, e.target.value);
  };

  // Precise logic from MetaFileImport for tracking selection
  useEffect(() => {
    let selected: any[] = [];
    metadataImportList?.forEach(metadataItem =>
      metadataItem.entityTagEvents
        ?.filter((metaEvent: any) => metaEvent.selected)
        .forEach((metaEvent: any) => {
          selected.push(metaEvent);
          if (metaEvent.children && metaEvent.children.length > 0) {
            metaEvent.children
              .filter((metaChild: any) => metaChild.selected)
              .forEach((metaChild: any) => {
                selected.push(metaChild);
              });
          }
        })
    );
    setSelectedMetadata(selected);
  }, [metadataImportList]);

  const setTagGrantsUpdated = () => {
    setOpenAccess(false);
    setShowRemoveAccess(false);
    loadData();
  };

  return (
    <div className="p-4 bg-white">
      <div className="my-4">
        <Card className="border-0 shadow-sm rounded-3">
          <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
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
          <Card.Body>
            <Row className="mb-3 g-2">
              <Col md={4}>
                <InputGroup>
                  <Form.Control
                    placeholder="Search by dataset name or owner"
                    value={searchTerm}
                    onChange={handleSearch}
                    className="bg-light border-0"
                  />
                </InputGroup>
              </Col>
              <Col md={{ span: 2, offset: 6 }}>
                <Form.Select value={statusFilter} onChange={handleFilterChange} className="bg-light border-0">
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
          setTagsCreated={() => {}}
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
        <Button variant="primary" onClick={() => onNext && onNext({})}>
          Finish
        </Button>
      </div>
    </div>
  );
};

export default DatasetDetails;
