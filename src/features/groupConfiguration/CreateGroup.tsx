import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import Select from 'react-select';
import { useAppSelector } from '../../store/hooks';
import AreasSelection from './components/AreasSelection';
import RolesSelection from './components/RolesSelection';
import DatasetsSelection from './components/DatasetsSelection';
import TeamStats from './components/TeamStats';
import MembersSelection from './components/MembersSelection';
import { getLocationHierarchyList } from '../location/api';
import { toast } from 'react-toastify';

interface Options {
    value: string;
    label: string;
}

interface CreateGroupProps {
    onCancel: () => void;
    onSave: (data: any) => void;
}

const CreateGroup: React.FC<CreateGroupProps> = ({ onCancel, onSave }) => {
    const isDarkMode = useAppSelector((state: any) => state.darkMode.value);
    const [groupName, setGroupName] = useState('');
    const [isTeam, setIsTeam] = useState(false);
    const [hierarchyList, setHierarchyList] = useState<Options[]>([]);
    const [selectedHierarchy, setSelectedHierarchy] = useState<any>(null);
    const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
    const [assignedMembers, setAssignedMembers] = useState<string[]>([]);
    const [areaTeams, setAreaTeams] = useState<Record<string, string>>({});

    useEffect(() => {
        getLocationHierarchyList(0, 0, true)
            .then((res: any) => {
                const list = res.content.map((el: any) => ({
                    label: el.name,
                    value: el.identifier ?? ''
                }));
                setHierarchyList(list);
                if (list.length > 0) setSelectedHierarchy(list[0]);
            })
            .catch(err => toast.error('Error fetching hierarchies'));
    }, []);

    const handleAreaTeamChange = useCallback((areaId: string, team: string) => {
        setAreaTeams(prev => ({ ...prev, [areaId]: team }));
    }, []);

    const handleSave = useCallback(() => {
        onSave({
            groupName,
            isTeam,
            hierarchy: selectedHierarchy?.value,
            selectedAreas,
            assignedMembers,
            areaTeams
        });
    }, [onSave, groupName, isTeam, selectedHierarchy, selectedAreas, assignedMembers, areaTeams]);

    const handleTeamToggle = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setIsTeam(checked);
        // Reset selections when mode changes
        setSelectedAreas([]);
        setAreaTeams({});
    }, []);

    return (
        <div className={`p-4 ${isDarkMode ? 'text-white' : ''}`}>
            <h3 className="mb-4">Create Group</h3>

            <Row className="mb-4 g-3 align-items-center">
                <Col md={4} xs={12}>
                    <Form.Group>
                        <Form.Control
                            placeholder="Enter group name"
                            value={groupName}
                            onChange={e => setGroupName(e.target.value)}
                        />
                    </Form.Group>
                </Col>
                {/* <Col md={4} xs={12}>
                    <Form.Group>
                        <Select
                            options={hierarchyList}
                            value={selectedHierarchy}
                            onChange={setSelectedHierarchy}
                            placeholder="Select Hierarchy"
                            className="text-dark"
                        />
                    </Form.Group>
                </Col> */}
                <Col md={1} xs={4}>
                    <Form.Check
                        type="checkbox"
                        id="team-checkbox"
                        label="Team"
                        checked={isTeam}
                        onChange={handleTeamToggle}
                    />
                </Col>
            </Row>

            <Row className="mb-4 g-4 items-stretch">
                <Col md={4} xs={12}>
                    <AreasSelection
                        isTeamMode={isTeam}
                        selectedHierarchy={selectedHierarchy?.value}
                        selectedAreas={selectedAreas}
                        onSelectionChange={setSelectedAreas}
                        areaTeams={areaTeams}
                        onAreaTeamChange={handleAreaTeamChange}
                    />
                </Col>
                {!isTeam ? (
                    <>
                        <Col md={4} xs={12}>
                            <RolesSelection />
                        </Col>
                        <Col md={4} xs={12}>
                            <DatasetsSelection />
                        </Col>
                    </>
                ) : (
                    <Col md={4} xs={12}>
                        <TeamStats />
                    </Col>
                )}
            </Row>

            <Row className="mb-4 g-4">
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
                    Create
                </Button>
            </div>
        </div>
    );
};

export default CreateGroup;
