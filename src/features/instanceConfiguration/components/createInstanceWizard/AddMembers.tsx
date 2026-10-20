import React, { useState, useCallback, useMemo } from 'react';
import { Col, Button, Alert } from 'react-bootstrap';
import MembersSelection from './MembersSelection';
import { WizardStepProps } from '../Wizard/Wizard';
import { useAppSelector } from '../../../../store/hooks';

const AddMembers: React.FC<WizardStepProps> = ({ onNext, onBack, defaultValues, viewOnly }) => {
  const isDarkMode = useAppSelector((state: any) => state.darkMode.value);
  const instanceIdentifier = defaultValues?.instanceIdentifier || defaultValues?.planId || defaultValues?.identifier;
  const savedAdmins: string[] | undefined = defaultValues?.adminMembers;
  const members: string[] = useMemo(() => defaultValues?.members || [], [defaultValues]);
  const [assignedMembers, setAssignedMembers] = useState<string[]>(
    savedAdmins ?? (instanceIdentifier ? [] : members)
  );
  const [otherMembers, setOtherMembers] = useState<string[]>(
    savedAdmins ? members.filter(id => !savedAdmins.includes(id)) : []
  );
  const [memberNames, setMemberNames] = useState<Record<string, string>>(defaultValues?.memberNames || {});
  const [error, setError] = useState<string | null>(null);

  const handleAdminsLoaded = useCallback(
    (adminIds: string[]) => {
      if (savedAdmins) return;
      setAssignedMembers(adminIds);
      setOtherMembers(members.filter(id => !adminIds.includes(id)));
    },
    [savedAdmins, members]
  );

  const getStepData = () => ({
    members: [...assignedMembers, ...otherMembers.filter(id => !assignedMembers.includes(id))],
    adminMembers: assignedMembers,
    memberNames
  });

  const handleNext = () => {
    if (assignedMembers.length === 0) {
      setError('At least one member must be assigned.');
      return;
    }
    setError(null);
    onNext && onNext(getStepData());
  };

  return (
    <div style={isDarkMode ? { backgroundColor: '#282828' } : { background: '#FFF' }} className="p-4">
      <h4 className="mb-4 fw-bold">Assign Admin Members</h4>

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
            memberNames={memberNames}
            onMemberNamesChange={setMemberNames}
            viewOnly={viewOnly}
            instanceIdentifier={instanceIdentifier}
            onAdminsLoaded={handleAdminsLoaded}
          />
        </div>
      </Col>

      <Col md={8}>
        <hr className="my-3" />
        <div className="d-flex justify-content-between">
          <Button
            variant="secondary"
            className="px-4 py-2"
            onClick={() => onBack && onBack(getStepData())}
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
