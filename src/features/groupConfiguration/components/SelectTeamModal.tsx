import React, { useEffect, useState } from 'react';
import { Modal, ListGroup, Button, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { getOrganizationListSummary } from '../../organization/api';
import { assignLocationToGroup } from '../api';
import { toast } from 'react-toastify';

interface Props {
    show: boolean;
    onHide: () => void;
    onSelect: (team: string) => void;
    planId: string;
    areaId: string | string[] | null;
    selectedTeam: { name: string, identifier: string } | null;

}

const SelectTeamModal: React.FC<Props> = ({ show, onHide, onSelect, planId, areaId, selectedTeam: initialSelectedTeam }) => {
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<any>(initialSelectedTeam || null);
    const [isSaving, setIsSaving] = useState(false);
// console.log('Selected team in modal:', selectedTeam);
//     useEffect(() => {
//         setSelectedTeam(initialSelectedTeam || null);
//     }, [initialSelectedTeam]);
    useEffect(() => {
        if (show) {
            setLoading(true);
            getOrganizationListSummary()
                .then(res => {
                    setOrganizations(res || []);
                    setLoading(false);
                })
                .catch(() => {
                    toast.error('Failed to load teams');
                    setLoading(false);
                });
        }
    }, [show]);

    const handleSave = () => {
        if (!selectedTeam || !areaId || !planId) return;

        setIsSaving(true);
        const locationIdentifiers = Array.isArray(areaId) ? areaId : [areaId];
        const requestBody = {
            organizationIdentifier: selectedTeam.identifier,
            locationIdentifiers: locationIdentifiers
        };

        assignLocationToGroup(requestBody)
            .then(() => {
                toast.success('Team assigned successfully');
                onSelect(selectedTeam.name);
                onHide();
            })
            .catch(err => {
                toast.error(err.message || 'Failed to assign team');
            })
            .finally(() => {
                setIsSaving(false);
            });
    };

    return (
        <Modal show={show} onHide={onHide} centered contentClassName="border-0 shadow-sm">
            <Modal.Header className="border-0 pb-0 d-flex justify-content-between align-items-center">
                <Modal.Title style={{ fontSize: '1.2rem', fontWeight: 500 }} className="text-dark ps-2 pt-2">
                    Select Team
                </Modal.Title>
                <div className="pe-2 pt-2 cursor-pointer" onClick={onHide} style={{ fontSize: '1.2rem', color: '#999' }}>
                    <FontAwesomeIcon icon={faTimes} />
                </div>
            </Modal.Header>
            <Modal.Body className="p-0 mt-3 pb-3">
                {loading ? (
                    <div className="text-center p-4">
                        <Spinner animation="border" variant="primary" />
                    </div>
                ) : organizations.length === 0 ? (
                    <div className="text-center p-5 text-muted small">
                        No teams found
                    </div>
                ) : (
                    <ListGroup variant="flush" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {organizations.map((team, index) => (
                            <ListGroup.Item
                                key={team.identifier}
                                action
                                onClick={() => setSelectedTeam(team)}
                                className={`border-0 py-3 px-4 ${selectedTeam?.identifier === team.identifier ? 'bg-primary text-white' : ''}`}
                                style={{ fontSize: '0.95rem' }}
                            >
                                {team.name}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </Modal.Body>
            <Modal.Footer className="border-0">
                <Button variant="secondary" onClick={() => {
                    onHide()
                }} disabled={isSaving}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSave} disabled={!selectedTeam || isSaving}>
                    {isSaving && <Spinner animation="border" size="sm" className="me-2" />}
                    Save
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default SelectTeamModal;

