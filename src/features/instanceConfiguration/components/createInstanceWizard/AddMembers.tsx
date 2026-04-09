import React, { useState, useEffect } from 'react';
import { Col, Button, Alert } from 'react-bootstrap';
import MembersSelection from './MembersSelection';
import { WizardStepProps } from '../Wizard/Wizard';
import { useAppSelector } from '../../../../store/hooks';

const AddMembers: React.FC<WizardStepProps> = ({ onNext, onBack, defaultValues, viewOnly }) => {
  const isDarkMode = useAppSelector((state: any) => state.darkMode.value);
  const [assignedMembers, setAssignedMembers] = useState<string[]>(defaultValues?.members || []);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultValues?.members?.length) {
      setAssignedMembers(defaultValues.members);
    }
  }, [defaultValues]);

  const handleNext = () => {
    if (assignedMembers.length === 0) {
      setError('At least one member must be assigned.');
      return;
    }
    setError(null);
    onNext && onNext({ members: assignedMembers });
  };

  return (
    <div style={isDarkMode ? { backgroundColor: '#282828' } : { background: '#FFF' }} className="p-4">
      <h4 className="mb-4 fw-bold">Assign Members</h4>
      
      {error && (
        <Col md={8} className="mb-3">
          <Alert variant="danger">{error}</Alert>
        </Col>
      )}

      <Col md={8}>
        <div className="mb-5">
          <MembersSelection 
            assignedMembers={assignedMembers} 
            onAssignmentChange={setAssignedMembers} 
            viewOnly={viewOnly}
          />
        </div>
      </Col>

      <Col md={8}>
        <hr className="my-3" />
        <div className="d-flex justify-content-between">
          <Button
            variant="secondary"
            className="px-4 py-2"
            onClick={() => onBack && onBack({ members: assignedMembers })}
            style={{ backgroundColor: '#6c757d', border: 'none' }}
          >
            Back
          </Button>
          <Button
            variant="primary"
            className="px-4 py-2"
            onClick={handleNext}
            style={{ backgroundColor: '#0d6efd', border: 'none' }}
          >
            Next and Continue
          </Button>
        </div>
      </Col>
    </div>
  );
};

export default AddMembers;
