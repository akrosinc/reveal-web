import React, { useState } from 'react';
import { Row, Col, Form, Button, Alert } from 'react-bootstrap';
import Select from 'react-select';
import AreasSelection from './AreasSelection';
import MembersSelection from './MembersSelection';
import { WizardStepProps } from '../Wizard/Wizard';

/* -------------------- Mock Data -------------------- */
const hierarchyOptions = [
  { value: 'country', label: 'Country' },
  { value: 'region', label: 'Region' }
];

const InstanceDetails: React.FC<WizardStepProps> = ({ onNext, onBack, defaultValues }) => {
  // Form State - Initialize with defaultValues if present
  const [instanceName, setInstanceName] = useState(defaultValues?.instanceName || '');
  const [selectedHierarchy, setSelectedHierarchy] = useState<any>(
    defaultValues?.hierarchy ? hierarchyOptions.find(opt => opt.value === defaultValues.hierarchy) : null
  );
  const [selectedAreas, setSelectedAreas] = useState<string[]>(defaultValues?.areas || []);
  const [assignedMembers, setAssignedMembers] = useState<string[]>(defaultValues?.members || []);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!instanceName.trim()) {
      setError('Instance name is required.');
      return;
    }
    if (!selectedHierarchy) {
      setError('Hierarchy selection is required.');
      return;
    }
    if (selectedAreas.length === 0) {
      setError('At least one area must be selected.');
      return;
    }
    if (assignedMembers.length === 0) {
      setError('At least one member must be assigned.');
      return;
    }

    const formData = {
      instanceName,
      hierarchy: selectedHierarchy?.value,
      areas: selectedAreas,
      members: assignedMembers
    };
    setError(null);
    onNext && onNext(formData);
  };

  return (
    <div className="p-4 bg-white">
      <h4 className="mb-4 fw-bold">Create Instance</h4>
      <Form onSubmit={handleSubmit}>
        <Col md={8}>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          {/* Instance Name and Hierarchy Inputs */}
          {/* <Row className="mb-4">
            <Col md={6}> */}
          <div style={{ width: '100%' }} className="d-flex flex-column flex-md-row gap-4">
            <Form.Group className="flex-grow-1" controlId="instanceName">
              {/* <Form.Label>Instance Name</Form.Label> */}
              <Form.Control
                type="text"
                placeholder="Enter Instance name"
                value={instanceName}
                onChange={e => setInstanceName(e.target.value)}
                className="py-2"
              />
            </Form.Group>

            <Form.Group className="flex-grow-1" controlId="hierarchy">
              {/* <Form.Label>Hierarchy</Form.Label> */}
              <Select
                options={hierarchyOptions}
                value={selectedHierarchy}
                onChange={setSelectedHierarchy}
                placeholder="Select Hierarchy"
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </Form.Group>
          </div>

          {/* Areas Section */}
          <div className="mb-5">
            <h5 className="mb-3 fw-bold">Areas</h5>
            <AreasSelection selectedAreas={selectedAreas} onSelectionChange={setSelectedAreas} />
          </div>
        </Col>

        {/* Members Section */}
        <h5 className="mb-3 fw-bold text-secondary">Members</h5>
        <Col md={8}>
          <div className="mb-5">
            <MembersSelection assignedMembers={assignedMembers} onAssignmentChange={setAssignedMembers} />
          </div>
        </Col>

        <Col md={8}>
          <hr className="my-3" />
          {/* Footer Buttons */}
          <div className="d-flex justify-content-between ">
            <Button
              variant="secondary"
              className="px-4 py-2"
              onClick={onBack}
              style={{ backgroundColor: '#6c757d', border: 'none' }}
            >
              Back
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="px-4 py-2"
              style={{ backgroundColor: '#0d6efd', border: 'none' }}
            >
              Next and Continue
            </Button>
          </div>
        </Col>
      </Form>
    </div>
  );
};

export default InstanceDetails;
