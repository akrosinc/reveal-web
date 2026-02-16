import React, { useState } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { useAppSelector } from '../../store/hooks';
import AreasSelection from './components/AreasSelection';
import RolesSelection from './components/RolesSelection';
import DatasetsSelection from './components/DatasetsSelection';
import TeamStats from './components/TeamStats';
import MembersSelection from './components/MembersSelection';

interface CreateGroupProps {
    onCancel: () => void;
    onSave: (data: any) => void;
}

const CreateGroup: React.FC<CreateGroupProps> = ({ onCancel, onSave }) => {
    const isDarkMode = useAppSelector((state: any) => state.darkMode.value);
    const [groupName, setGroupName] = useState('');
    const [isTeam, setIsTeam] = useState(false);
    const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
    const [assignedMembers, setAssignedMembers] = useState<string[]>([]);
    const [areaTeams, setAreaTeams] = useState<Record<string, string>>({});

    const handleAreaTeamChange = (areaId: string, team: string) => {
        setAreaTeams(prev => ({ ...prev, [areaId]: team }));
    };

    const handleSave = () => {
        onSave({
            groupName,
            isTeam,
            selectedAreas,
            assignedMembers,
            areaTeams
        });
    };

    return (
        <div className={`p-4 ${isDarkMode ? 'text-white' : ''}`}>
            <h3 className="mb-4">Create Group</h3>

            <Row className="mb-4 align-items-center">
                <Col md={4}>
                    <Form.Group>
                        <Form.Control
                            placeholder="Enter group name"
                            value={groupName}
                            onChange={e => setGroupName(e.target.value)}
                        />
                    </Form.Group>
                </Col>
                <Col md={1}>
                    <Form.Check
                        type="checkbox"
                        id="team-checkbox"
                        label="Team"
                        checked={isTeam}
                        onChange={e => setIsTeam(e.target.checked)}
                    />
                </Col>
            </Row>

            <Row className="mb-4">
                <Col md={4}>
                    <AreasSelection
                        isTeamMode={isTeam}
                        selectedAreas={selectedAreas}
                        onSelectionChange={setSelectedAreas}
                        areaTeams={areaTeams}
                        onAreaTeamChange={handleAreaTeamChange}
                    />
                </Col>
                {!isTeam ? (
                    <>
                        <Col md={4}>
                            <RolesSelection />
                        </Col>
                        <Col md={4}>
                            <DatasetsSelection />
                        </Col>
                    </>
                ) : (
                    <Col md={4}>
                        <TeamStats />
                    </Col>
                )}
            </Row>

            <Row className="mb-4">
                <Col md={12}>
                    <MembersSelection assignedMembers={assignedMembers} onAssignmentChange={setAssignedMembers} />
                </Col>
            </Row>

            <hr className="my-4" />

            <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    Save
                </Button>
            </div>
        </div>
    );
};

export default CreateGroup;
