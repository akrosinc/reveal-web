import React, { useState } from 'react';
import { Modal, Button, Row, Col } from 'react-bootstrap';
import AreasSelection from './AreasSelection';
import TeamStats from './TeamStats';
import { assignLocationToGroup } from '../api';
import { toast } from 'react-toastify';
import { useAppSelector } from '../../../store/hooks';

interface TeamAssignmentModalProps {
  show: boolean;
  onHide: () => void;
  onSaveSuccess?: () => void;
}

const TeamAssignmentModal: React.FC<TeamAssignmentModalProps> = ({ 
  show, 
  onHide, 
  onSaveSuccess 
}) => {
  const isDarkMode = useAppSelector((state: any) => state.darkMode.value);
  const [areaTeams, setAreaTeams] = useState<Record<string, string>>({});

  const handleAreaTeamChange = (areaId: string | string[], teamName: string) => {
    // API call is handled internally by SelectTeamModal (inside AreasSelection).
    onSaveSuccess?.();
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      fullscreen={true} 
      centered
      contentClassName={isDarkMode ? 'bg-dark text-white' : ''}
    >
      <Modal.Header closeButton className={isDarkMode ? 'border-secondary' : ''}>
        <Modal.Title>Assign Teams</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Row className="mb-4 g-4 items-stretch">
          <Col md={8} xs={12}>
            <AreasSelection
              isTeamMode={true} // Consolidated view with three-dots menu
              selectedAreas={[]} // Not used in team mode for selection
              onSelectionChange={() => {}}
              areaTeams={areaTeams}
              onAreaTeamChange={handleAreaTeamChange}
            />
          </Col>
          <Col md={4} xs={12}>
            <TeamStats />
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer className={isDarkMode ? 'border-secondary' : ''}>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TeamAssignmentModal;
