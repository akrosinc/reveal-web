import React, { useEffect, useState } from 'react';
import { Card, Form, Spinner } from 'react-bootstrap';
import { useAppSelector } from '../../../../../../store/hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faCheck } from '@fortawesome/free-solid-svg-icons';
import { getAssignedDatasetList, AssignedDatasetModel } from '../../../../../groupConfiguration/api';
import { toast } from 'react-toastify';

interface DatasetsSelectionProps {
    selectedDatasets?: string[];
    onDatasetChange?: (datasets: string[]) => void;
    hideHeader?: boolean;
    textColor?: string;
    variant?: 'default' | 'editUser';
    readOnly?: boolean;
}

const DatasetsSelection: React.FC<DatasetsSelectionProps> = ({
    selectedDatasets = [],
    onDatasetChange,
    hideHeader,
    textColor,
    variant = 'default',
    readOnly = false
}) => {
    const isDarkMode = useAppSelector((state: any) => state.darkMode.value);
    const [datasets, setDatasets] = useState<AssignedDatasetModel[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
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
    }, []);

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
                height: '200px',
            }}
        >
            {/* {showHeader && (
                <Card.Header className={`${isDarkMode ? 'border-bottom border-white text-white' : 'bg-light'} fw-bold d-flex justify-content-between align-items-center`}>
                    Datasets
                    <FontAwesomeIcon icon={faPlusCircle} className="text-primary cursor-pointer" />
                </Card.Header>
            )} */}
            <Card.Body className="p-3" style={{ overflowY: 'auto' }}>
                {isLoading ? (
                    <div className="text-center p-3">
                        <Spinner animation="border" size="sm" variant="primary" />
                    </div>
                ) : (
                    (() => {
                        const itemsToRender = datasets.filter(dataset => {
                            const isSelected = selectedDatasets.includes(dataset.identifier);
                            return !(readOnly && !isSelected);
                        });

                        if (itemsToRender.length === 0) {
                            return <div className="text-muted text-center p-3">No datasets found</div>;
                        }

                        return itemsToRender.map(dataset => {
                            const isSelected = selectedDatasets.includes(dataset.identifier);
                            return (
                                <div key={dataset.identifier} className="d-flex align-items-center mb-2">
                                    {readOnly ? (
                                        <FontAwesomeIcon icon={faCheck} className="text-primary me-2" />
                                    ) : (
                                        <Form.Check
                                            type="checkbox"
                                            id={`dataset-${dataset.identifier}`}
                                            checked={isSelected}
                                            onChange={() => handleToggle(dataset.identifier)}
                                            disabled={readOnly}
                                            className="me-2"
                                        />
                                    )}
                                    <span style={{ color: effectiveTextColor }}>{dataset.name}</span>
                                </div>
                            );
                        });
                    })()
                )}
            </Card.Body>
        </Card>
    );
};

export default DatasetsSelection;
