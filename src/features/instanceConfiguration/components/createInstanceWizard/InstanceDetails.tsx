import React, { useState } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import Select from 'react-select';
import AreasSelection from './AreasSelection';
import MembersSelection from './MembersSelection';

/* -------------------- Mock Data -------------------- */
const hierarchyOptions = [
  { value: 'country', label: 'Country' },
  { value: 'region', label: 'Region' }
];

const InstanceDetails = () => {
  // Form State
  const [instanceName, setInstanceName] = useState('');
  const [selectedHierarchy, setSelectedHierarchy] = useState<any>(null);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [assignedMembers, setAssignedMembers] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = {
      instanceName,
      hierarchy: selectedHierarchy?.value,
      areas: selectedAreas,
      members: assignedMembers
    };
    console.log('Form Submitted:', formData);
    // Add navigation logic here
  };

  return (
    <div className="p-4 bg-white">
      {/* <h4 className="mb-4 fw-bold">Create Instance</h4> */}
      <Col md={8}>
        <Form onSubmit={handleSubmit}>
          {/* Top Row: Name and Hierarchy */}
          {/* <Row className="mb-5">
          <Col md={6}>
            <Form.Group>
              <Form.Control
                type="text"
                placeholder="Enter Instance name"
                className="py-2"
                value={instanceName}
                onChange={e => setInstanceName(e.target.value)}
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
        </Row> */}

          {/* Areas Section */}
          <div className="mb-5">
            <AreasSelection selectedAreas={selectedAreas} onSelectionChange={setSelectedAreas} />
          </div>

          {/* Members Section */}
          <h5 className="mb-3 fw-bold text-secondary">Members</h5>
          <div className="mb-5">
            <MembersSelection assignedMembers={assignedMembers} onAssignmentChange={setAssignedMembers} />
          </div>
        </Form>
      </Col>
      {/* Footer Buttons */}
      <div className=" mt-5 pt-3 border-top">
        <Col md={8}>
          <div className="d-flex justify-content-between">
            <Button variant="secondary" className="px-4 py-2" style={{ backgroundColor: '#6c757d', border: 'none' }}>
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
      </div>
    </div>
  );
};

export default InstanceDetails;
