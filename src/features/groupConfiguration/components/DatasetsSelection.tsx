import React from 'react';
import { Card, Form } from 'react-bootstrap';
import { useAppSelector } from '../../../store/hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';

const datasets = ['SMC 1', 'SMC 2', 'SMC 3'];

const DatasetsSelection: React.FC = () => {
    const isDarkMode = useAppSelector((state: any) => state.darkMode.value);

    return (
        <Card
            className={`flex-fill shadow-sm ${isDarkMode ? 'border-white text-white' : ''}`}
            style={{ background: isDarkMode ? '#212529' : '', height: '100%' }}
        >
            <Card.Header className={`${isDarkMode ? 'border-bottom border-white text-white' : 'bg-light'} fw-bold d-flex justify-content-between align-items-center`}>
                Datasets
                <FontAwesomeIcon icon={faPlusCircle} className="text-primary cursor-pointer" />
            </Card.Header>
            <Card.Body className="p-3">
                {datasets.map(dataset => (
                    <Form.Check key={dataset} type="checkbox" id={`dataset-${dataset}`} label={dataset} className="mb-2" />
                ))}
            </Card.Body>
        </Card>
    );
};

export default DatasetsSelection;
