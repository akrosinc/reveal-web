import React, { useMemo, useState } from 'react';
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
    onSelect: (id: string, isChecked: boolean, recursive?: boolean) => void;
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

                    {(!isTeamMode || hasChildren) ? (
                        <div className="form-check mb-0">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id={`area-${node.id}`}
                                checked={isSelected}
                                onChange={e => onSelect(node.id, e.target.checked, true)}
                            />
                            <label className="form-check-label cursor-pointer" htmlFor={`area-${node.id}`}>
                                {node.label}
                            </label>
                        </div>
                    ) : (
                        <span className="text-muted ms-1" style={{ fontSize: '0.9rem' }}>{node.label}</span>
                    )}
                </div>

                {isTeamMode && !hasChildren && (
                    <div className={`d-flex align-items-center gap-2 ${!isSelected ? 'opacity-25' : ''}`}>
                        <span className="text-muted small">{areaTeams[node.id] || ''}</span>
                        <FontAwesomeIcon
                            icon={faEllipsisV}
                            className={`text-secondary ${isSelected ? 'cursor-pointer' : ''} ms-2`}
                            onClick={() => isSelected && onTeamClick(node.id)}
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
            {/* <hr className="my-2 opacity-25" /> */}
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

    // Create a flat map of parents and children for easier traversal
    const areaTreeData = useMemo(() => {
        const parentsMap: Record<string, string> = {};
        const childrenMap: Record<string, string[]> = {};
        const allNodes: Record<string, any> = {};

        const traverse = (nodes: any[], parentId?: string) => {
            nodes.forEach(node => {
                allNodes[node.id] = node;
                if (parentId) parentsMap[node.id] = parentId;
                if (node.children) {
                    childrenMap[node.id] = node.children.map((c: any) => c.id);
                    traverse(node.children, node.id);
                }
            });
        };
        traverse(mockAreas);
        return { parentsMap, childrenMap, allNodes };
    }, []);

    const { parentsMap, childrenMap, allNodes } = areaTreeData;

    // Helper to get all descendant IDs
    const getAllDescendantIds = (nodeId: string): string[] => {
        let ids: string[] = [];
        const collectIds = (node: any) => {
            ids.push(node.id);
            if (node.children) {
                node.children.forEach((child: any) => collectIds(child));
            }
        };
        const node = allNodes[nodeId];
        if (node) collectIds(node);
        return ids;
    };

    const handleSelect = (id: string, isChecked: boolean, recursive: boolean = true) => {
        let newSelected = [...selectedAreas];

        if (recursive) {
            const affectedIds = getAllDescendantIds(id);
            if (isChecked) {
                newSelected = Array.from(new Set([...newSelected, ...affectedIds]));
            } else {
                newSelected = newSelected.filter(sid => !affectedIds.includes(sid));
            }
        } else {
            if (isChecked) {
                if (!newSelected.includes(id)) newSelected.push(id);
            } else {
                newSelected = newSelected.filter(sid => sid !== id);
            }
        }

        // --- Upward recursive logic ---
        let currentId = id;
        while (parentsMap[currentId]) {
            const parentId = parentsMap[currentId];
            const siblings = childrenMap[parentId];
            const allSiblingsSelected = siblings.every((sId: string) => newSelected.includes(sId));

            if (allSiblingsSelected) {
                if (!newSelected.includes(parentId)) newSelected.push(parentId);
            } else {
                newSelected = newSelected.filter(sid => sid !== parentId);
            }
            currentId = parentId;
        }

        onSelectionChange(newSelected);
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

    // The screenshots show "All" in the header for Team mode or consistent with Members selection
    const headerTitle = isTeamMode ? "All" : "Areas";

    return (
        <Card
            className={`flex-fill  shadow-sm ${isDarkMode ? 'text-white border-white' : ''}`}
            style={{ background: isDarkMode ? '#212529' : '', minHeight: '300px' }}
        >
            <Card.Header className={`${isDarkMode ? 'border-bottom border-white text-white' : 'bg-light'} fw-bold`}>
                {headerTitle}
            </Card.Header>
            <Card.Body className="p-3">
                <Form.Select className="mb-3 border-0 py-2" defaultValue="Niagara">
                    <option value="Niagara">Niagara</option>
                </Form.Select>
                {/* Search is currently commented out as per user request */}
                <hr className="my-3 opacity-25" />
                <div style={{ maxHeight: '400px', overflowY: 'auto' }} className="pe-2">
                    {/* Render from top-level children since Niagara is in the dropdown */}
                    {mockAreas[0].children.map(area => (
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
