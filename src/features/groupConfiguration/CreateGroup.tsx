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
import { createGroup, getGroupByIdentifier, updateGroup, GroupMember, GroupDataset, GroupRole } from './api';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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
    identifier?: string | null;
}

const getSelectedLeafNodeIds = (nodes: any[]): string[] =>
    nodes.flatMap(node =>
        !node.children?.length
            ? node.selected
                ? [node.identifier]
                : []
            : getSelectedLeafNodeIds(node.children)
    );


const CreateGroup: React.FC<CreateGroupProps> = ({ onCancel, onSave, identifier }) => {
    const isDarkMode = useAppSelector((state: any) => state.darkMode.value);
    const selectedInstance = useAppSelector((state: any) => state.instanceContext.selectedInstance);
    const navigate = useNavigate();
    const location = useLocation();
    const readOnlyMode = location.state?.readOnlyMode || false;
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

    // Loading state for fetching data
    const [isLoadingData, setIsLoadingData] = useState(false);

    // Validation errors
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setIsLoadingData(true);
        Promise.all([
            getLocationHierarchyList(0, 0, true),
            identifier ? getGroupByIdentifier(identifier) : Promise.resolve(null)
        ])
            .then(([hierarchiesRes, groupRes]) => {
                const list = hierarchiesRes.content.map((el: any) => ({
                    label: el.name,
                    value: el.identifier ?? ''
                }));
                setHierarchyList(list);
                if (list.length > 0) setSelectedHierarchy(list[0]);

                if (groupRes) {
                    setGroupName(groupRes.name);
                    setIsTeam(groupRes.type === 'TEAM');
                    if (groupRes.members) {
                        setAssignedMembers(groupRes.members.map((m: GroupMember) => m.identifier));
                    }
                    if (groupRes.datasets) {
                        setSelectedDatasets(groupRes.datasets.map((d: GroupDataset) => d.identifier));
                    }
                    if (groupRes.roles) {
                        setSelectedRoles(groupRes.roles.map((r: GroupRole) => r.identifier));
                    }
                    if (groupRes.areas) {
                        console.log(groupRes?.areas, 'areas groupres')
                        setSelectedAreas(getSelectedLeafNodeIds(groupRes.areas));
                    }
                }
            })
            .catch((err) => {
                console.error('Error loading group data:', err);
                toast.error('Error fetching group/hierarchies');
            })
            .finally(() => setIsLoadingData(false));
    }, [identifier]);

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
        if (assignedMembers?.length === 0) return toast.error('Please assign at least one member to the team.');
        // Build the final payload
        const payload = {
            name: groupName.trim(),
            isTeam,
            instanceId: selectedInstance?.identifier || null,
            ...(!isTeam ? {
                areasIdentifiers: selectedAreas || [],
                rolesIdentifiers: selectedRoles || [],
                datasetsIdentifiers: selectedDatasets || [],
                membersIdentifiers: assignedMembers || [],
            } : {
                areasIdentifiers: selectedAreas || [],
                membersIdentifiers: assignedMembers || []
            }),
        };

        setIsSubmitting(true);
        try {
            if (identifier) {
                await updateGroup(identifier, payload as any);
                toast.success(`Group "${payload.name}" updated successfully.`);
            } else {
                await createGroup(payload as any);
                toast.success(`Group "${payload.name}" created successfully.`);
            }
            onSave(payload);
        } catch (err: any) {
            const message = err?.response?.data?.message || err?.message || 'Failed to save group.';
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
        onSave,
        identifier
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
            <div className='d-flex align-items-center justify-content-between mb-3'>
                <div className='d-flex align-items-center gap-1'>
                    {<button style={{ all: "unset", cursor: 'pointer' }} onClick={() => navigate(-1)}>    <FontAwesomeIcon icon="arrow-left" className="me-2" /></button>}
                    <h3 className="">{readOnlyMode ? 'View' : (identifier ? 'Edit' : 'Create')} Group</h3>
                </div>
                {readOnlyMode && (
                    <Alert variant="info" className="py-1 px-3 mb-0 border-0">
                        <span className="small fw-bold text-uppercase">Read-only Mode</span>
                    </Alert>
                )}
            </div>
            {isLoadingData ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2 text-muted">Loading group details...</p>
                </div>
            ) : (
                <>
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
                                    disabled={readOnlyMode}
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
                                disabled={readOnlyMode}
                            />
                        </Col>
                    </Row>

                    {/* Team validation banner */}
                    {errors.areaTeams && (
                        <Alert variant="danger" className="mb-3 py-2">
                            <span className="fw-semibold">⚠ Team assignment required:</span> {errors.areaTeams}
                        </Alert>
                    )}

                    <Row className={"g-4 items-stretch " + (isTeam && !readOnlyMode ? "" : "mb-4")}>
                        {(!isTeam || readOnlyMode) && <Col md={4} xs={12}>
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
                                    handleAreaTeamChange(areaId as string, team);
                                    if (submitted) setErrors(prev => ({ ...prev, areaTeams: undefined }));
                                }}
                                disabled={readOnlyMode}
                            />
                        </Col>}
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
                                {readOnlyMode ? <TeamStats /> : <></>}
                            </Col>
                        )}
                    </Row>

                    <Row className="mb-4 g-4">
                        <Col md={12}>
                            <MembersSelection
                                assignedMembers={assignedMembers}
                                onAssignmentChange={setAssignedMembers}
                                disabled={readOnlyMode}

                            />
                        </Col>
                    </Row>

                    <hr className="my-4" />

                    {!readOnlyMode && <div className="d-flex justify-content-end gap-2">
                        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
                            {readOnlyMode ? 'Close' : 'Cancel'}
                        </Button>
                        {!readOnlyMode && (
                            <Button variant="primary" onClick={handleSave} disabled={isSubmitting}>
                                {isSubmitting && <Spinner animation="border" size="sm" className="me-2" />}
                                {isSubmitting ? (identifier ? 'Updating...' : 'Creating...') : (identifier ? 'Update' : 'Create')}
                            </Button>
                        )}
                    </div>}
                </>
            )}
        </div>
    );
};

export default CreateGroup;
