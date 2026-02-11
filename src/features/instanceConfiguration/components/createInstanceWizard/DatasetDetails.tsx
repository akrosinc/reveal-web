import React from 'react';
import { Button } from 'react-bootstrap';
import { WizardStepProps } from '../Wizard/Wizard';

const DatasetDetails: React.FC<WizardStepProps> = ({ onBack, onNext, defaultValues }) => {
    return (
        <div className="p-4 bg-white">
            <h4>Add Dataset Details</h4>
            <p className="text-muted">Enter dataset details here (Placeholder)</p>
            <div className="d-flex justify-content-between mt-4">
                <Button variant="secondary" onClick={onBack}>
                    Back
                </Button>
                <Button variant="primary" onClick={() => onNext && onNext({ dataset: 'mock data' })}>
                    Finish
                </Button>
            </div>
        </div>
    );
};

export default DatasetDetails;
