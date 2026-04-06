import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Button, Alert } from 'react-bootstrap';
import Select from 'react-select';
import AreasSelection from './AreasSelection';
import { WizardStepProps } from '../Wizard/Wizard';
import { useAppSelector } from '../../../../store/hooks';

import { hierarchyOptions as baseHierarchyOptions } from './mockLargeDataset';
import { getLocationHierarchyList, getGeographicLevelList } from '../../../location/api';
import { getInterventionTypeList } from '../../../plan/api';
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

const InstanceDetails: React.FC<WizardStepProps> = ({ onNext, onBack, defaultValues, viewOnly }) => {
  // Form State - Initialize with defaultValues if present
  const [hierarchyList, setHierarchyList] = useState<Options[]>([]);
  const isDarkMode = useAppSelector((state: any) => state.darkMode.value);
  const [instanceName, setInstanceName] = useState(defaultValues?.instanceName || '');
  const [selectedHierarchy, setSelectedHierarchy] = useState<any>(
    defaultValues?.selectedHierarchyObject || null
  );
  const [interventionTypeList, setInterventionTypeList] = useState<Options[]>([]);
  const [geographicLevelList, setGeographicLevelList] = useState<any[]>([]);
  const [selectedIntervention, setSelectedIntervention] = useState<Options | null>(null);
  const [selectedHierarchyLevelTarget, setSelectedHierarchyLevelTarget] = useState<Options | null>(null);
  const [selectedAreas, setSelectedAreas] = useState<string[]>(defaultValues?.areas || []);
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
    if (!selectedIntervention) {
      setError('Intervention type is required.');
      return;
    }
    if (selectedIntervention?.label?.toLowerCase().includes('lite') && !selectedHierarchyLevelTarget) {
      setError('Hierarchy level target is required for Lite intervention.');
      return;
    }

    const formData = {
      instanceName,
      hierarchy: selectedHierarchy?.value,
      locationHierarchy: selectedHierarchy?.value,
      interventionType: selectedIntervention?.value,
      hierarchyLevelTarget: selectedHierarchyLevelTarget?.value,
      selectedHierarchyObject: selectedHierarchy,
      areas: selectedAreas,
    };
    setError(null);
    onNext && onNext(formData);
  };

  useEffect(() => {
    if (defaultValues) {
      if (defaultValues.instanceName) setInstanceName(defaultValues.instanceName);
      if (defaultValues.areas?.length) setSelectedAreas(defaultValues.areas);
    }
  }, [defaultValues]);

  useEffect(() => {
    Promise.all([getLocationHierarchyList(0, 0, true), getInterventionTypeList(), getGeographicLevelList(0, 0)])
      .then(([locationHierarchyList, interventionTypeList, geoLevelList]) => {
        const hList = locationHierarchyList.content.map<Options>((el: any) => ({
          label: el.name,
          value: el.identifier ?? '',
          nodeOrder: el.nodeOrder
        }));
        const iList = interventionTypeList.map<Options>((el: any) => ({
          label: el.name,
          value: el.identifier
        }));

        setHierarchyList(hList);
        setInterventionTypeList(iList);
        setGeographicLevelList(geoLevelList.content);

        // Sync hierarchy
        const hierarchyValue = defaultValues?.hierarchy || defaultValues?.locationHierarchy;
        let selectedH: Options | null = null;
        if (hierarchyValue) {
          selectedH = hList.find((opt: any) => opt.value === hierarchyValue) || null;
          setSelectedHierarchy(selectedH);
        } else if (hList.length > 0 && !selectedHierarchy) {
          selectedH = hList[0];
          setSelectedHierarchy(selectedH);
        }

        // Sync intervention
        if (defaultValues?.interventionType) {
          const selectedI = iList.find((opt: any) => opt.value === defaultValues.interventionType) || null;
          setSelectedIntervention(selectedI);
        }

        // Sync target level
        if (defaultValues?.hierarchyLevelTarget && selectedH?.nodeOrder) {
          const targetLevel = selectedH.nodeOrder
            .filter((el: string) => el !== 'structure')
            .map((el: string) => {
              const geoLevel = geoLevelList.content.find((g: any) => g.name === el);
              return {
                label: geoLevel ? geoLevel.title : el,
                value: el
              };
            })
            .find((opt: any) => opt.value === defaultValues.hierarchyLevelTarget);
          setSelectedHierarchyLevelTarget(targetLevel || null);
        }
      })
      .catch(err => toast.error(String(err)));
  }, [defaultValues]);
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

          <div style={{ width: '100%' }} className="mb-4">
            <Form.Group controlId="instanceName">
              <Form.Label>Instance Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Instance name"
                disabled={viewOnly}
                value={instanceName}
                onChange={e => setInstanceName(e.target.value)}
                className="py-2"
              />
            </Form.Group>
          </div>

          <div style={{ width: '100%' }} className="d-flex flex-column flex-md-row gap-4 mb-4">
            <Form.Group className="flex-grow-1" controlId="hierarchy">
              <Form.Label>Location Hierarchy</Form.Label>
              <Select
                className="custom-react-select-container"
                classNamePrefix="custom-react-select"
                options={hierarchyList}
                isDisabled={viewOnly}
                value={selectedHierarchy}
                onChange={(val: any) => {
                  setSelectedHierarchy(val);
                  setSelectedHierarchyLevelTarget(null);
                  setSelectedAreas([]); // Clear areas when hierarchy changes
                }}
                placeholder="Select Hierarchy"
              />
            </Form.Group>

            <Form.Group className="flex-grow-1" controlId="interventionType">
              <Form.Label>Intervention Type</Form.Label>
              <Select
                className="custom-react-select-container"
                classNamePrefix="custom-react-select"
                options={interventionTypeList}
                isDisabled={viewOnly}
                value={selectedIntervention}
                onChange={(val: any) => {
                  setSelectedIntervention(val);
                  setSelectedHierarchyLevelTarget(null);
                }}
                placeholder="Select Intervention"
              />
            </Form.Group>
          </div>

          {selectedIntervention?.label?.toLowerCase().includes('lite') && (
            <div style={{ width: '100%' }} className="mb-4">
              <Form.Group controlId="hierarchyLevelTarget">
                <Form.Label>Hierarchy Level Target</Form.Label>
                <Select
                  className="custom-react-select-container"
                  classNamePrefix="custom-react-select"
                  isDisabled={viewOnly}
                  options={
                    selectedHierarchy?.nodeOrder
                      ?.filter((el: string) => el !== 'structure')
                      .map((el: string) => {
                        const geoLevel = geographicLevelList.find(g => g.name === el);
                        return {
                          label: geoLevel ? geoLevel.title : el,
                          value: el
                        };
                      }) || []
                  }
                  value={selectedHierarchyLevelTarget}
                  onChange={setSelectedHierarchyLevelTarget}
                  placeholder="Select Target Level"
                />
              </Form.Group>
            </div>
          )}

          {/* Areas Section - Render one AreaSelection tied to the dropdown */}
          <div className="mb-5">
            <h5 className="mb-3 fw-bold">Areas</h5>
            <AreasSelection
              selectedHierarchy={selectedHierarchy?.value}
              selectedAreas={selectedAreas}
              onSelectionChange={setSelectedAreas}
              viewOnly={viewOnly}
            />
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
                locationHierarchy: selectedHierarchy?.value,
                interventionType: selectedIntervention?.value,
                hierarchyLevelTarget: selectedHierarchyLevelTarget?.value,
                selectedHierarchyObject: selectedHierarchy,
                areas: selectedAreas,
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
