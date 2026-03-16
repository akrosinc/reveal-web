import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAppSelector } from '../../store/hooks';
import AreasSelection from './components/AreasSelection';
import RolesSelection from './components/RolesSelection';
import DatasetsSelection from './components/DatasetsSelection';
import TeamStats from './components/TeamStats';
import MembersSelection from './components/MembersSelection';
import { getLocationHierarchyList } from '../location/api';
import { toast } from 'react-toastify';
import { createGroup } from './api';

interface Options {
    value: string;
    label: string;
}

interface FormErrors {
    name?: string;
    roles?: string;
    areaTeams?: string;
}

interface CreateGroupProps {
    onCancel: () => void;
    onSave: (data: any) => void;
}

const CreateGroup: React.FC<CreateGroupProps> = ({ onCancel, onSave }) => {
    const isDarkMode = useAppSelector((state: any) => state.darkMode.value);
    const selectedInstance = useAppSelector((state: any) => state.instanceContext.selectedInstance);

    // Form fields
    const [groupName, setGroupName] = useState('');
    const [isTeam, setIsTeam] = useState(false);
    const [hierarchyList, setHierarchyList] = useState<Options[]>([]);
    const [selectedHierarchy, setSelectedHierarchy] = useState<any>(null);
    const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
    const [assignedMembers, setAssignedMembers] = useState<string[]>([]);
    const [areaTeams, setAreaTeams] = useState<Record<string, string>>({});
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [selectedDatasets, setSelectedDatasets] = useState<string[]>([]);

    // Validation errors
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            .catch(() => toast.error('Error fetching hierarchies'));
    }, []);

    const handleAreaTeamChange = useCallback((areaId: string, team: string) => {
        setAreaTeams(prev => ({ ...prev, [areaId]: team }));
    }, []);

    /** Validate the form and return true if valid */
    const validate = useCallback((): FormErrors => {
        const errs: FormErrors = {};

        // 1. Group name is required
        if (!groupName.trim()) {
            errs.name = 'Group name is required.';
        }

        if (isTeam) {
            // 2. Team mode: every selected area must have a team assigned
            if (selectedAreas.length > 0) {
                const areasWithoutTeam = selectedAreas.filter(areaId => !areaTeams[areaId] || !areaTeams[areaId].trim());
                if (areasWithoutTeam.length > 0) {
                    errs.areaTeams = `${areasWithoutTeam.length} selected area(s) have no team assigned. Please assign a team to every selected area.`;
                }
            }
        } else {
            // 3. Non-team mode: at least one role must be selected
            // if (selectedRoles.length === 0) {
            //     errs.roles = 'Please select at least one permission role.';
            // }
        }

        return errs;
    }, [groupName, isTeam, selectedAreas, areaTeams, selectedRoles]);

    const handleSave = useCallback(async () => {
        setSubmitted(true);
        const validationErrors = validate();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        const getRandomId = () => {
            try {
                return window.crypto.randomUUID();
            } catch {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                    const r = (Math.random() * 16) | 0;
                    const v = c === 'x' ? r : (r & 0x3) | 0x8;
                    return v.toString(16);
                });
            }
        };

        // Build the final payload
        const payload = {
            // identifier: undefined,
            name: groupName.trim(),
            isTeam,
            // instanceId: selectedInstance?.identifier ,
            // areasIdentifiers: selectedAreas.length > 0 ? selectedAreas : [getRandomId()],
            ...(!isTeam ? { areasIdentifiers: selectedAreas || [], 
                rolesIdentifiers: selectedRoles || [],
            datasetsIdentifiers: selectedDatasets || [],
            membersIdentifiers: assignedMembers || [], } : {areasIdentifiers: selectedAreas || [],membersIdentifiers: assignedMembers || []}),
        };

        console.log('=== Create Group Payload ===');
        console.log(JSON.stringify(payload, null, 2));

        setIsSubmitting(true);
        try {
            await createGroup(payload as any);
            toast.success(`Group "${payload.name}" created successfully.`);
            onSave(payload);
        } catch (err: any) {
            const message = err?.response?.data?.message || err?.message || 'Failed to create group.';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    }, [
        validate,
        groupName,
        isTeam,
        selectedInstance,
        selectedAreas,
        selectedRoles,
        selectedDatasets,
        assignedMembers,
        onSave
    ]);

    const handleTeamToggle = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setIsTeam(checked);
        // Reset selections when mode changes
        setSelectedAreas([]);
        setAreaTeams({});
        setSelectedRoles([]);
        if (submitted) setErrors({}); // reset errors on mode switch
    }, [submitted]);

    return (
        <div className={`p-4 ${isDarkMode ? 'text-white' : ''}`}>
            <h3 className="mb-4">Create Group</h3>

            <Row className="mb-4 g-3 align-items-start">
                <Col md={4} xs={12}>
                    <Form.Group>
                        <Form.Control
                            placeholder="Enter group name"
                            value={groupName}
                            onChange={e => {
                                setGroupName(e.target.value);
                                if (submitted && e.target.value.trim()) {
                                    setErrors(prev => ({ ...prev, name: undefined }));
                                }
                            }}
                            isInvalid={!!errors.name}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.name}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col md={1} xs={4}>
                    <Form.Check
                        type="checkbox"
                        id="team-checkbox"
                        label="Team"
                        checked={isTeam}
                        onChange={handleTeamToggle}
                        className="mt-2"
                    />
                </Col>
            </Row>

            {/* Team validation banner */}
            {errors.areaTeams && (
                <Alert variant="danger" className="mb-3 py-2">
                    <span className="fw-semibold">⚠ Team assignment required:</span> {errors.areaTeams}
                </Alert>
            )}

            <Row className="mb-4 g-4 items-stretch">
                <Col md={4} xs={12}>
                    <AreasSelection
                        isTeamMode={isTeam}
                        selectedHierarchy={selectedHierarchy?.value}
                        selectedAreas={selectedAreas}
                        onSelectionChange={ids => {
                            setSelectedAreas(ids);
                            // Clear area-team error once areas are changed
                            if (submitted) setErrors(prev => ({ ...prev, areaTeams: undefined }));
                        }}
                        areaTeams={areaTeams}
                        onAreaTeamChange={(areaId, team) => {
                            handleAreaTeamChange(areaId, team);
                            if (submitted) setErrors(prev => ({ ...prev, areaTeams: undefined }));
                        }}
                    />
                </Col>
                {!isTeam ? (
                    <>
                        <Col md={4} xs={12}>
                            <div>
                                <RolesSelection
                                    selectedRoles={selectedRoles}
                                    onRoleChange={roles => {
                                        setSelectedRoles(roles);
                                        if (submitted && roles.length > 0) {
                                            setErrors(prev => ({ ...prev, roles: undefined }));
                                        }
                                    }}
                                />
                                {errors.roles && (
                                    <div className="text-danger small mt-1">
                                        <span>⚠ {errors.roles}</span>
                                    </div>
                                )}
                            </div>
                        </Col>
                        <Col md={4} xs={12}>
                            <DatasetsSelection
                                selectedDatasets={selectedDatasets}
                                onDatasetChange={setSelectedDatasets}
                            />
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
                <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSave} disabled={isSubmitting}>
                    {isSubmitting && <Spinner animation="border" size="sm" className="me-2" />}
                    {isSubmitting ? 'Creating...' : 'Create'}
                </Button>
            </div>
        </div>
    );
};

export default CreateGroup;
