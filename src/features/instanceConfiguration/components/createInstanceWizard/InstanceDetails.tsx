import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Button, Alert } from 'react-bootstrap';
import Select from 'react-select';
import AreasSelection from './AreasSelection';
import MembersSelection from './MembersSelection';
import { WizardStepProps } from '../Wizard/Wizard';
import { useAppSelector } from '../../../../store/hooks';

import { hierarchyOptions as baseHierarchyOptions } from './mockLargeDataset';
import { getLocationHierarchyList } from '../../../location/api';
import { toast } from 'react-toastify';
interface Options {
  value: string;
  label: string;
  nodeOrder?: string[];
}
/* -------------------- Mock Data -------------------- */
const hierarchyOptions = baseHierarchyOptions.map(opt => ({
  value: opt,
  label: opt
}));

const InstanceDetails: React.FC<WizardStepProps> = ({ onNext, onBack, defaultValues }) => {
  // Form State - Initialize with defaultValues if present
  const [hierarchyList, setHierarchyList] = useState<Options[]>([]);
  const isDarkMode = useAppSelector((state: any) => state.darkMode.value);
  const [instanceName, setInstanceName] = useState(defaultValues?.instanceName || '');
  const [selectedHierarchy, setSelectedHierarchy] = useState<any>(
    defaultValues?.selectedHierarchyObject || null
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
      selectedHierarchyObject: selectedHierarchy,
      areas: selectedAreas,
      members: assignedMembers
    };
    setError(null);
    onNext && onNext(formData);
  };

  useEffect(() => {
    if (defaultValues) {
      if (defaultValues.instanceName) setInstanceName(defaultValues.instanceName);
      if (defaultValues.areas?.length) setSelectedAreas(defaultValues.areas);
      if (defaultValues.members?.length) setAssignedMembers(defaultValues.members);
    }
  }, [defaultValues]);

  useEffect(() => {
    getLocationHierarchyList(0, 0, true)
      .then((locationHierarchyList) => {
        const hList = locationHierarchyList.content.map<Options>(el => ({
          label: el.name,
          value: el.identifier ?? '',
          nodeOrder: el.nodeOrder
        }));
        setHierarchyList(hList);           
        
        // Sync selectedHierarchy with the real list item (to fix ID showing instead of label)
        if (defaultValues?.hierarchy) {
          const match = hList.find(opt => opt.value === defaultValues.hierarchy);
          if (match) {
            setSelectedHierarchy(match);
          }
        } else if (hList.length > 0 && !selectedHierarchy) {
          // Auto-select 0th element if none provided
          setSelectedHierarchy(hList[0]);
        }
      })
      .catch(err => toast.error(String(err)));
  }, [defaultValues?.hierarchy]); // Re-sync if defaultValues changes
  return (
    <div style={isDarkMode ? { backgroundColor: '#282828' } : { background: '#FFF' }} className="p-4">
      <h4 className="mb-4 fw-bold">Create Instance</h4>
      <Form onSubmit={handleSubmit}>
        <Col md={8}>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          <div style={{ width: '100%' }} className="d-flex flex-column flex-md-row gap-4 mb-4">
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
                className="custom-react-select-container"
                classNamePrefix="custom-react-select"
                options={hierarchyList}
                value={selectedHierarchy}
                onChange={setSelectedHierarchy}
                placeholder="Select Hierarchy"
              />
            </Form.Group>
          </div>

          {/* Areas Section - Render one AreaSelection tied to the dropdown */}
          <div className="mb-5">
            <h5 className="mb-3 fw-bold">Areas</h5>
            <AreasSelection
              selectedHierarchy={selectedHierarchy?.value}
              selectedAreas={selectedAreas}
              onSelectionChange={setSelectedAreas}
            />
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
              onClick={() => onBack({
                instanceName,
                hierarchy: selectedHierarchy?.value,
                selectedHierarchyObject: selectedHierarchy,
                areas: selectedAreas,
                members: assignedMembers
              })}
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
