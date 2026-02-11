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

const CreateInstance = () => {
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
    <div className="p-4">
      <h4 className="mb-4">Create Instance</h4>
      <Form onSubmit={handleSubmit}>
        {/* Top Row: Name and Hierarchy */}
        <Row className="mb-4">
          <Col md={6}>
            <Form.Group>
              <Form.Control
                type="text"
                placeholder="Enter Instance name"
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
            />
          </Col>
        </Row>

        {/* Areas Section */}
        {/* <h5 className="mb-3">Areas</h5> */}
        <div className="mb-5">
          <AreasSelection
            selectedAreas={selectedAreas}
            onSelectionChange={setSelectedAreas}
          />
        </div>

        {/* Members Section */}
        <h5 className="mb-3">Members</h5>
        <div className="mb-5">
          <MembersSelection
            assignedMembers={assignedMembers}
            onAssignmentChange={setAssignedMembers}
          />
        </div>

        {/* Footer Buttons */}
        <div className="d-flex justify-content-between mt-4">
          <Button variant="secondary">Back</Button>
          <Button variant="primary" type="submit">Next and Continue</Button>
        </div>
      </Form>
    </div>
  );
};

export default CreateInstance;
