import React from 'react';
import { Card, Form } from 'react-bootstrap';
import { useAppSelector } from '../../../store/hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';

const datasets = ['SMC 1', 'SMC 2', 'SMC 3'];

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

    const handleToggle = (dataset: string) => {
        if (!onDatasetChange) return;
        const newDatasets = selectedDatasets.includes(dataset)
            ? selectedDatasets.filter(d => d !== dataset)
            : [...selectedDatasets, dataset];
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
                height: isEditUser ? '100%' : 'auto',
                minHeight: isEditUser ? '0' : '300px'
            }}
        >
            {showHeader && (
                <Card.Header className={`${isDarkMode ? 'border-bottom border-white text-white' : 'bg-light'} fw-bold d-flex justify-content-between align-items-center`}>
                    Datasets
                    <FontAwesomeIcon icon={faPlusCircle} className="text-primary cursor-pointer" />
                </Card.Header>
            )}
            <Card.Body className="p-3">
                {datasets.map(dataset => (
                    <Form.Check
                        key={dataset}
                        type="checkbox"
                        id={`dataset-${dataset}`}
                        label={<span style={{ color: effectiveTextColor }}>{dataset}</span>}
                        className="mb-2"
                        checked={selectedDatasets.includes(dataset)}
                        onChange={() => handleToggle(dataset)}
                    />
                ))}
            </Card.Body>
        </Card>
    );
};

export default DatasetsSelection;
