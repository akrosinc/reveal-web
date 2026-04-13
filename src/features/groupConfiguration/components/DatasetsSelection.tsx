import React, { useEffect, useState } from 'react';
import { Card, Form, Spinner } from 'react-bootstrap';
import { useAppSelector } from '../../../store/hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { getAssignedDatasetList, AssignedDatasetModel, getAssignedComplexTagList, AssignedComplexTagModel } from '../api';
import { toast } from 'react-toastify';
import UploadModal from '../../metaDataImport/components/fileImport/uploadModal/UploadModal';
import { Nav } from 'react-bootstrap';
import AuthorizedElement from '../../../components/AuthorizedElement';
import { GROUP_MANAGEMENT_ADD_DATASET } from '../../../constants';

interface DatasetsSelectionProps {
    selectedDatasets?: string[];
    onDatasetChange?: (datasets: string[]) => void;
    selectedComplexTags?: number[];
    onComplexTagChange?: (complexTags: number[]) => void;
    hideHeader?: boolean;
    textColor?: string;
    variant?: 'default' | 'editUser';
    disabled?: boolean;
}

const DatasetsSelection: React.FC<DatasetsSelectionProps> = ({
    selectedDatasets = [],
    onDatasetChange,
    selectedComplexTags = [],
    onComplexTagChange,
    hideHeader,
    textColor,
    variant = 'default',
    disabled = false
}) => {
    const isDarkMode = useAppSelector((state: any) => state.darkMode.value);
    const [datasets, setDatasets] = useState<AssignedDatasetModel[]>([]);
    const [complexTags, setComplexTags] = useState<AssignedComplexTagModel[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'simple' | 'complex'>('simple');

    const fetchDatasets = () => {
        setIsLoading(true);
        getAssignedDatasetList()
            .then(data => {
                setDatasets(data);
                setIsLoading(false);
            })
            .catch(err => {
                toast.error('Error fetching datasets');
                setIsLoading(false);
            });
    };

    const fetchComplexTags = () => {
        setIsLoading(true);
        getAssignedComplexTagList()
            .then(data => {
                setComplexTags(data);
                setIsLoading(false);
            })
            .catch(err => {
                toast.error('Error fetching complex tags');
                setIsLoading(false);
            });
    };

    useEffect(() => {
        if (activeTab === 'simple') {
            fetchDatasets();
        } else {
            fetchComplexTags();
        }
    }, [activeTab]);

    const [showUploadModal, setShowUploadModal] = useState(false);

    const handleToggle = (datasetId: string) => {
        if (!onDatasetChange) return;
        const newDatasets = selectedDatasets.includes(datasetId)
            ? selectedDatasets.filter(id => id !== datasetId)
            : [...selectedDatasets, datasetId];
        onDatasetChange(newDatasets);
    };

    const handleComplexToggle = (tagId: number) => {
        if (!onComplexTagChange) return;
        const newTags = selectedComplexTags.includes(tagId)
            ? selectedComplexTags.filter(id => id !== tagId)
            : [...selectedComplexTags, tagId];
        onComplexTagChange(newTags);
    };

    const isEditUser = variant === 'editUser';
    const showHeader = hideHeader !== undefined ? !hideHeader : !isEditUser;
    const effectiveTextColor = textColor || (isEditUser ? 'black' : (isDarkMode ? 'white' : 'black'));

    return (
        <Card
            className={`flex-fill shadow-sm ${isEditUser ? 'border-0' : (isDarkMode ? 'text-white border-white' : '')}`}
            style={{
                background: isEditUser ? '#F0F2F5' : (isDarkMode ? '#212529' : ''),
                // height: isEditUser ? '100%' : 'auto',
                // minHeight: isEditUser ? '0' : '300px'
            }}
        >
            {showHeader && (
                <Card.Header className={`${isDarkMode ? 'border-bottom border-white text-white' : 'bg-light'} fw-bold d-flex justify-content-between align-items-center`}>
                    Datasets
                    <AuthorizedElement roles={[GROUP_MANAGEMENT_ADD_DATASET]}>
                        <FontAwesomeIcon
                            style={{ cursor: 'pointer' }}
                            icon={faPlusCircle}
                            className="text-primary cursor-pointer"
                            onClick={() => setShowUploadModal(true)}
                        />
                    </AuthorizedElement>
                </Card.Header>
            )}
            <Card.Body style={{ height: 266, overflowY: 'auto' }} className="p-3">
                <Nav variant="tabs" activeKey={activeTab} onSelect={(k: any) => setActiveTab(k)} className="mb-3">
                    <Nav.Item>
                        <Nav.Link eventKey="simple">Simple Tag</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="complex">Complex Tag</Nav.Link>
                    </Nav.Item>
                </Nav>

                {isLoading ? (
                    <div className="text-center p-3">
                        <Spinner animation="border" size="sm" variant="primary" />
                    </div>
                ) : activeTab === 'simple' ? (
                    datasets.map(dataset => (
                        <Form.Check
                            key={dataset.identifier}
                            type="checkbox"
                            id={`dataset-${dataset.identifier}`}
                            label={<span style={{ color: effectiveTextColor }}>{dataset.name}</span>}
                            className="mb-2"
                            checked={selectedDatasets.includes(dataset.identifier)}
                            onChange={() => handleToggle(dataset.identifier)}
                            disabled={disabled}
                        />
                    ))
                ) : (
                    complexTags.map(tag => (
                        <Form.Check
                            key={tag.id}
                            type="checkbox"
                            id={`complex-tag-${tag.id}`}
                            label={<span style={{ color: effectiveTextColor }}>{tag.tagName}</span>}
                            className="mb-2"
                            checked={selectedComplexTags.includes(tag.id)}
                            onChange={() => handleComplexToggle(tag.id)}
                            disabled={disabled}
                        />
                    ))
                )}
            </Card.Body>
            {showUploadModal && (
                <UploadModal
                    closeHandler={() => {
                        setShowUploadModal(false);
                        fetchDatasets();
                    }}
                    setTagsCreated={() => { }}
                />
            )}
        </Card>
    );
};

export default DatasetsSelection;
