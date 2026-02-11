import React, { useState } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = {
      instanceName,
      hierarchy: selectedHierarchy?.value,
      areas: selectedAreas,
      members: assignedMembers
    };
    onNext && onNext(formData);
  };

  return (
    <div className="p-4 bg-white">
      {/* <h4 className="mb-4 fw-bold">Create Instance</h4> */}
      <Form onSubmit={handleSubmit}>
        {/* Top Row: Name and Hierarchy */}
        <Row className="mb-5">
          <Col md={6}>
            <Form.Group>
              <Form.Control
                type="text"
                placeholder="Enter Instance name"
                className="py-2"
                value={instanceName}
                onChange={(e) => setInstanceName(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Select
              options={hierarchyOptions}
              value={selectedHierarchy}
              onChange={setSelectedHierarchy}
              placeholder="Select Hierarchy"
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </Col>
        </Row>

        {/* Areas Section */}
        <div className="mb-5">
          <AreasSelection selectedAreas={selectedAreas} onSelectionChange={setSelectedAreas} />
        </div>

        {/* Members Section */}
        <h5 className="mb-3 fw-bold text-secondary">Members</h5>
        <div className="mb-5">
          <MembersSelection assignedMembers={assignedMembers} onAssignmentChange={setAssignedMembers} />
        </div>

        {/* Footer Buttons */}
        <div className="d-flex justify-content-between mt-5 pt-3 border-top">
          <Button variant="secondary" className="px-4 py-2" onClick={onBack} style={{ backgroundColor: '#6c757d', border: 'none' }}>
            Back
          </Button>
          <Button variant="primary" type="submit" className="px-4 py-2" style={{ backgroundColor: '#0d6efd', border: 'none' }}>
            Next and Continue
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default InstanceDetails;
