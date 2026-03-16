import React, { useEffect, useState } from 'react';
import { Card, Form, Spinner } from 'react-bootstrap';
import { useAppSelector } from '../../../store/hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { getAssignedDatasetList, AssignedDatasetModel } from '../api';
import { toast } from 'react-toastify';
import UploadModal from '../../metaDataImport/components/fileImport/uploadModal/UploadModal';

interface DatasetsSelectionProps {
    selectedDatasets?: string[];
    onDatasetChange?: (datasets: string[]) => void;
    hideHeader?: boolean;
    textColor?: string;
    variant?: 'default' | 'editUser';
}

const DatasetsSelection: React.FC<DatasetsSelectionProps> = ({
    selectedDatasets = [],
    onDatasetChange,
    hideHeader,
    textColor,
    variant = 'default'
}) => {
    const isDarkMode = useAppSelector((state: any) => state.darkMode.value);
    const [datasets, setDatasets] = useState<AssignedDatasetModel[]>([]);
    const [isLoading, setIsLoading] = useState(false);

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

    useEffect(() => {
        fetchDatasets();
    }, []);

    const [showUploadModal, setShowUploadModal] = useState(false);

    const handleToggle = (datasetId: string) => {
        if (!onDatasetChange) return;
        const newDatasets = selectedDatasets.includes(datasetId)
            ? selectedDatasets.filter(id => id !== datasetId)
            : [...selectedDatasets, datasetId];
        onDatasetChange(newDatasets);
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
                    <FontAwesomeIcon 
                    
                        icon={faPlusCircle} 
                        className="text-primary cursor-pointer" 
                        onClick={() => setShowUploadModal(true)}
                    />
                </Card.Header>
            )}
            <Card.Body style={{height:266,overflowY:'auto'}} className="p-3">
               
                {isLoading ? (
                    <div className="text-center p-3">
                        <Spinner animation="border" size="sm" variant="primary" />
                    </div>
                ) : (
                    datasets.map(dataset => (
                        <Form.Check
                            key={dataset.identifier}
                            type="checkbox"
                            id={`dataset-${dataset.identifier}`}
                            label={<span style={{ color: effectiveTextColor }}>{dataset.name}</span>}
                            className="mb-2"
                            checked={selectedDatasets.includes(dataset.identifier)}
                            onChange={() => handleToggle(dataset.identifier)}
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
                    setTagsCreated={() => {}}
                />
            )}
        </Card>
    );
};

export default DatasetsSelection;
