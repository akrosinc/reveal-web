import React, { useCallback, useEffect, useState } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { WizardStepProps } from '../Wizard/Wizard';
import { METADATA_FILE_IMPORT, PAGINATION_DEFAULT_SIZE } from '../../../../constants';
import AuthorizedElement from '../../../../components/AuthorizedElement';
import MetadataImportTable from '../../../../components/Table/MetadataImportTable';
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
                valueType: 'Double',
                selected: false,
                aggregate: false,
                owner: true,
                owners: [{ id: 'u1', username: 'jdoe' }]
            },
            {
                identifier: 'tag-102',
                tag: 'Humidity_Sensor_01',
                valueType: 'Double',
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
        owner: true,
        owners: [{ id: 'u2', username: 'jsmith' }],
        entityTagEvents: [
            {
                identifier: 'tag-201',
                tag: 'Pressure_Gauge_A',
                valueType: 'Double',
                selected: false,
                aggregate: false,
                owner: true,
                owners: [{ id: 'u2', username: 'jsmith' }]
            }
        ]
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

    const loadData = useCallback((size: number, page: number, field?: string, direction?: boolean) => {
        // Simulating data loading
        const transformedData = MOCK_DATA.map(fileImport => ({ ...fileImport }));
        setMetadataImportList(transformedData);
        setMetadataImportPaged({
            content: transformedData,
            totalElements: transformedData.length,
            totalPages: 1,
            size: size,
            pageable: { pageNumber: page },
            empty: transformedData.length === 0
        });
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
        loadData(PAGINATION_DEFAULT_SIZE, 0);
    };

    return (
        <div className="p-4 bg-white">
            <div className="my-4">
                <Row>
                    <Col>
                        <h4 className="mb-4 fw-bold">Dataset Details</h4>
                    </Col>
                    {/* <Col>
                        <AuthorizedElement roles={[METADATA_FILE_IMPORT]}>
                            <Button onClick={() => setOpen(!open)} style={{ float: 'right' }}>
                                {t('metadataImport.uploadFile')}
                            </Button>
                        </AuthorizedElement>
                        <AuthorizedElement roles={[METADATA_FILE_IMPORT]}>
                            <Button
                                disabled={selectedMetadata.length === 0}
                                onClick={() => setOpenAccess(!openAccess)}
                                className={'mx-2'}
                                style={{ float: 'right' }}
                            >
                                Grant Access
                            </Button>
                        </AuthorizedElement>
                        <AuthorizedElement roles={[METADATA_FILE_IMPORT]}>
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
                    </Col> */}
                </Row>
                <Row className="mt-3">
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
                        <div className="p-3 text-center w-100">No data found.</div>
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
