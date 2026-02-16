import React, { useState } from 'react';
import { Card, Form, Collapse } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronDown, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { useAppSelector } from '../../../store/hooks';
import SelectTeamModal from './SelectTeamModal';

// Mock Data
const mockAreas = [
    {
        id: 'niagara',
        label: 'Niagara',
        children: [
            {
                id: 'boko',
                label: 'Boko',
                children: [
                    { id: 'ph1', label: 'PH 1' },
                    { id: 'ph2', label: 'PH 2' },
                    { id: 'ph3', label: 'PH 3' },
                    { id: 'ph4', label: 'PH 4' }
                ]
            },
            {
                id: 'laka',
                label: 'Laka',
                children: [
                    { id: 'lg1', label: 'LG 1' },
                    { id: 'lg2', label: 'LG 2' }
                ]
            }
        ]
    }
];

interface TreeNodeProps {
    node: any;
    selectedAreas: string[];
    onSelect: (id: string, isChecked: boolean) => void;
    isTeamMode: boolean;
    onTeamClick: (id: string) => void;
    areaTeams: Record<string, string>;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, selectedAreas, onSelect, isTeamMode, onTeamClick, areaTeams }) => {
    const [expanded, setExpanded] = useState(true);
    const isDarkMode = useAppSelector((state: any) => state.darkMode.value);
    const isSelected = selectedAreas.includes(node.id);
    const hasChildren = node.children && node.children.length > 0;

    const handleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        setExpanded(!expanded);
    };

    return (
        <div className="ms-3 mb-1">
            <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                    {hasChildren ? (
                        <span onClick={handleExpand} style={{ cursor: 'pointer', width: '20px' }} className="me-1 text-center">
                            <FontAwesomeIcon icon={expanded ? faChevronDown : faChevronRight} size="xs" className="text-secondary" />
                        </span>
                    ) : (
                        <span style={{ width: '20px' }} className="me-1"></span>
                    )}
                    <div className="form-check mb-0">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id={`area-${node.id}`}
                            checked={isSelected}
                            onChange={e => onSelect(node.id, e.target.checked)}
                        />
                        <label className="form-check-label cursor-pointer" htmlFor={`area-${node.id}`}>
                            {node.label}
                        </label>
                    </div>
                </div>
                {isTeamMode && isSelected && !hasChildren && (
                    <div className="d-flex align-items-center gap-2">
                        <span className="text-muted small">{areaTeams[node.id]}</span>
                        <FontAwesomeIcon
                            icon={faEllipsisV}
                            className="text-secondary cursor-pointer ms-2"
                            onClick={() => onTeamClick(node.id)}
                        />
                    </div>
                )}
            </div>
            {hasChildren && (
                <Collapse in={expanded}>
                    <div>
                        {node.children.map((child: any) => (
                            <TreeNode
                                key={child.id}
                                node={child}
                                selectedAreas={selectedAreas}
                                onSelect={onSelect}
                                isTeamMode={isTeamMode}
                                onTeamClick={onTeamClick}
                                areaTeams={areaTeams}
                            />
                        ))}
                    </div>
                </Collapse>
            )}
        </div>
    );
};

interface AreasSelectionProps {
    isTeamMode: boolean;
    selectedAreas: string[];
    onSelectionChange: (ids: string[]) => void;
    areaTeams: Record<string, string>;
    onAreaTeamChange: (areaId: string, team: string) => void;
}

const AreasSelection: React.FC<AreasSelectionProps> = ({
    isTeamMode,
    selectedAreas,
    onSelectionChange,
    areaTeams,
    onAreaTeamChange
}) => {
    const isDarkMode = useAppSelector((state: any) => state.darkMode.value);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [activeAreaId, setActiveAreaId] = useState<string | null>(null);

    const handleSelect = (id: string, isChecked: boolean) => {
        if (isChecked) {
            onSelectionChange([...selectedAreas, id]);
        } else {
            onSelectionChange(selectedAreas.filter(sid => sid !== id));
        }
    };

    const handleTeamClick = (id: string) => {
        setActiveAreaId(id);
        setShowModal(true);
    };

    const handleTeamSelect = (team: string) => {
        if (activeAreaId) {
            onAreaTeamChange(activeAreaId, team);
        }
    };

    return (
        <Card
            className={`flex-fill shadow-sm ${isDarkMode ? 'border-white text-white' : ''}`}
            style={{ background: isDarkMode ? '#212529' : '' }}
        >
            <Card.Header className={`${isDarkMode ? 'border-bottom border-white text-white' : 'bg-light'} fw-bold`}>
                Areas
            </Card.Header>
            <Card.Body className="p-3">
                <Form.Select className="mb-3 border-0 bg-light" defaultValue="Niagara">
                    <option value="Niagara">Niagara</option>
                </Form.Select>
                <div className="mb-3">
                    <Form.Control
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {mockAreas.map(area => (
                        <TreeNode
                            key={area.id}
                            node={area}
                            selectedAreas={selectedAreas}
                            onSelect={handleSelect}
                            isTeamMode={isTeamMode}
                            onTeamClick={handleTeamClick}
                            areaTeams={areaTeams}
                        />
                    ))}
                </div>
            </Card.Body>
            <SelectTeamModal show={showModal} onHide={() => setShowModal(false)} onSelect={handleTeamSelect} />
        </Card>
    );
};

export default AreasSelection;
