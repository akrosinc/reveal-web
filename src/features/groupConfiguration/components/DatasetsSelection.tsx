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
}

const DatasetsSelection: React.FC<DatasetsSelectionProps> = ({
    selectedDatasets = [],
    onDatasetChange,
    hideHeader = false,
    textColor
}) => {
    const isDarkMode = useAppSelector((state: any) => state.darkMode.value);

    const handleToggle = (dataset: string) => {
        if (!onDatasetChange) return;
        const newDatasets = selectedDatasets.includes(dataset)
            ? selectedDatasets.filter(d => d !== dataset)
            : [...selectedDatasets, dataset];
        onDatasetChange(newDatasets);
    };

    return (
        <Card
            className={`flex-fill shadow-sm border-0 ${isDarkMode ? 'text-white' : ''}`}
            style={{ background: isDarkMode ? '#F0F2F5' : '#F0F2F5', height: '100%' }}
        >
            {!hideHeader && (
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
                        label={<span style={{ color: textColor }}>{dataset}</span>}
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
