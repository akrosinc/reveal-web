import React from 'react';
import { Button } from 'react-bootstrap';
import { WizardStepProps } from '../Wizard/Wizard';

const PlanDetails: React.FC<WizardStepProps> = ({ onNext }) => {
    return (
        <div className="p-4 bg-white">
            <h4>Add Plan Details</h4>
            <p className="text-muted">Enter plan details here (Placeholder)</p>
            <div className="d-flex justify-content-end mt-4">
                <Button variant="primary" onClick={() => onNext && onNext({ planDetails: 'mock data' })}>
                    Next and Continue
                </Button>
            </div>
        </div>
    );
};

export default PlanDetails;
