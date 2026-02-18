import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, Form, Collapse } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronDown, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { useAppSelector } from '../../../store/hooks';
import SelectTeamModal from './SelectTeamModal';
import { datasetsByHierarchy, hierarchyOptions, AreaNode } from './mockLargeDataset';

interface TreeNodeProps {
    node: AreaNode;
    selectedAreas: string[];
    onSelect: (id: string, isChecked: boolean) => void;
    isTeamMode: boolean;
    onTeamClick: (id: string) => void;
    areaTeams: Record<string, string>;
    textColor?: string;
    filter: string;
    depth?: number;
    expandedNodeId: string | null;
    onToggleExpand: (nodeId: string | null) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({
    node,
    selectedAreas,
    onSelect,
    isTeamMode,
    onTeamClick,
    areaTeams,
    textColor,
    filter,
    depth = 0,
    expandedNodeId,
    onToggleExpand
}) => {
    const [childrenLoaded, setChildrenLoaded] = useState(false); // Track if children are loaded
    const [isVisible, setIsVisible] = useState(depth === 0); // Top level always visible
    const isDarkMode = useAppSelector((state: any) => state.darkMode.value);
    const checkboxRef = useRef<HTMLInputElement>(null);
    const nodeRef = useRef<HTMLDivElement>(null);

    const isSelected = selectedAreas.includes(node.id);
    const hasChildren = node.children && node.children.length > 0;

    // Single accordion + Auto-expand logic
    // If filter is active, we expand if matching children found
    const isExpandedByFilter = !!(filter && hasChildren && node.children?.some(c => JSON.stringify(c).toLowerCase().includes(filter.toLowerCase())));
    const expanded = isExpandedByFilter || expandedNodeId === node.id;

    // Lazy loading with Intersection Observer
    useEffect(() => {
        // Disable lazy loading when filtering to prevent whitespace gaps
        if (filter) {
            setIsVisible(true);
            return;
        }

        if (depth === 0 || !nodeRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        observer.disconnect();
                    }
                });
            },
            {
                root: null,
                rootMargin: '100px',
                threshold: 0.01
            }
        );

        observer.observe(nodeRef.current);

        return () => observer.disconnect();
    }, [depth, filter]);

    // Load children when accordion expands OR when filtering
    useEffect(() => {
        if ((expanded || filter) && hasChildren && !childrenLoaded) {
            setTimeout(() => {
                setChildrenLoaded(true);
            }, 0);
        }
    }, [expanded, filter, hasChildren, childrenLoaded]);

    // Calculate indeterminate state
    const getDescendantSelectionState = useCallback((n: AreaNode): { total: number; selected: number } => {
        let total = 0;
        let selected = 0;

        if (n.children && n.children.length > 0) {
            n.children.forEach((child) => {
                const childState = getDescendantSelectionState(child);
                total += childState.total;
                selected += childState.selected;
            });
        } else {
            total = 1;
            selected = selectedAreas.includes(n.id) ? 1 : 0;
        }

        return { total, selected };
    }, [selectedAreas]);

    const isIndeterminate = useCallback(() => {
        if (!hasChildren) return false;
        const state = getDescendantSelectionState(node);
        return state.selected > 0 && state.selected < state.total;
    }, [hasChildren, node, getDescendantSelectionState]);

    const indeterminate = isIndeterminate();

    // Set indeterminate property on checkbox
    useEffect(() => {
        if (checkboxRef.current) {
            checkboxRef.current.indeterminate = indeterminate;
        }
    }, [indeterminate]);

    const handleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Toggle single accordion
        onToggleExpand(expandedNodeId === node.id ? null : node.id);
    };

    // Filter logic
    if (filter) {
        const matches = node.label.toLowerCase().includes(filter.toLowerCase());
        const childMatches =
            node.children &&
            node.children.some((c) => {
                return JSON.stringify(c).toLowerCase().includes(filter.toLowerCase());
            });
        if (!matches && !childMatches) return null;
    }

    // Render placeholder until visible (lazy loading for nested items)
    if (!isVisible && depth > 0 && !filter) {
        return <div ref={nodeRef} style={{ height: '40px' }} />;
    }

    return (
        <div ref={nodeRef} className="ms-3 mb-1">
            <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                    {(!isTeamMode || hasChildren) ? (
                        <div className="form-check mb-0">
                            <input
                                ref={checkboxRef}
                                className={`form-check-input ${hasChildren ? 'parent-checkbox' : 'child-checkbox'}`}
                                type="checkbox"
                                id={`area-${node.id}`}
                                checked={isSelected}
                                onChange={e => onSelect(node.id, e.target.checked)}
                            />
                            <label className="form-check-label cursor-pointer" htmlFor={`area-${node.id}`} style={{ color: textColor }}>
                                {node.label}
                            </label>
                        </div>
                    ) : (
                        <span className="ms-1" style={{ fontSize: '0.9rem', color: textColor || 'inherit' }}>{node.label}</span>
                    )}
                </div>

                <div className="d-flex align-items-center">
                    {hasChildren ? (
                        <span onClick={handleExpand} style={{ cursor: 'pointer', width: '20px' }} className="me-1 text-center">
                            <FontAwesomeIcon icon={expanded ? faChevronDown : faChevronRight} size="xs" className="text-secondary" />
                        </span>
                    ) : (
                        <span style={{ width: '20px' }} className="me-1"></span>
                    )}

                    {isTeamMode && !hasChildren && (
                        <div className={`d-flex align-items-center gap-2 ${!isSelected ? 'opacity-25' : ''}`}>
                            <span className="text-muted small" style={{ color: textColor }}>{areaTeams[node.id] || ''}</span>
                            <FontAwesomeIcon
                                icon={faEllipsisV}
                                className={`text-secondary ${isSelected ? 'cursor-pointer' : ''} ms-2`}
                                onClick={() => isSelected && onTeamClick(node.id)}
                            />
                        </div>
                    )}
                </div>
            </div>
            {hasChildren && (
                <Collapse in={expanded}>
                    <div>
                        {childrenLoaded ? (
                            node.children!.map((child: any) => (
                                <TreeNode
                                    key={child.id}
                                    node={child}
                                    selectedAreas={selectedAreas}
                                    onSelect={onSelect}
                                    isTeamMode={isTeamMode}
                                    onTeamClick={onTeamClick}
                                    areaTeams={areaTeams}
                                    textColor={textColor}
                                    filter={filter}
                                    depth={depth + 1}
                                    expandedNodeId={expandedNodeId}
                                    onToggleExpand={onToggleExpand}
                                />
                            ))
                        ) : (
                            <div className="text-muted small p-2">Loading...</div>
                        )}
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
    hideHeader?: boolean;
    textColor?: string;
    variant?: 'default' | 'editUser';
}

// Custom hook for debounced search
const useDebounce = (value: string, delay: number = 300) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
};

const AreasSelection: React.FC<AreasSelectionProps> = ({
    isTeamMode,
    selectedAreas,
    onSelectionChange,
    areaTeams,
    onAreaTeamChange,
    hideHeader,
    textColor,
    variant = 'default'
}) => {
    const isDarkMode = useAppSelector((state: any) => state.darkMode.value);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [showModal, setShowModal] = useState(false);
    const [activeAreaId, setActiveAreaId] = useState<string | null>(null);
    const [selectedHierarchy, setSelectedHierarchy] = useState('Niagara');
    const [currentAreas, setCurrentAreas] = useState<AreaNode[]>(datasetsByHierarchy['Niagara']);
    const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null);

    const isEditUser = variant === 'editUser';
    const showHeader = hideHeader !== undefined ? !hideHeader : !isEditUser;
    const effectiveTextColor = textColor || (isEditUser ? 'black' : (isDarkMode ? 'white' : 'black'));
    const headerTitle = isTeamMode ? "All" : "Areas";

    // Update areas on hierarchy change
    useEffect(() => {
        setCurrentAreas(datasetsByHierarchy[selectedHierarchy] || []);
        onSelectionChange([]);
        setSearchTerm('');
        setExpandedNodeId(null);
    }, [selectedHierarchy, onSelectionChange]);

    // Helper to get all descendant IDs
    const getAllDescendantIds = useCallback((node: AreaNode): string[] => {
        let ids: string[] = [node.id];
        if (node.children) {
            node.children.forEach((child) => {
                ids = [...ids, ...getAllDescendantIds(child)];
            });
        }
        return ids;
    }, []);

    const findNode = useCallback((nodes: AreaNode[], targetId: string): AreaNode | null => {
        for (const node of nodes) {
            if (node.id === targetId) return node;
            if (node.children) {
                const found = findNode(node.children, targetId);
                if (found) return found;
            }
        }
        return null;
    }, []);

    const findParent = useCallback((nodes: AreaNode[], targetId: string, parent: AreaNode | null = null): AreaNode | null => {
        for (const node of nodes) {
            if (node.id === targetId) return parent;
            if (node.children) {
                const found = findParent(node.children, targetId, node);
                if (found) return found;
            }
        }
        return null;
    }, []);

    const handleSelect = useCallback((id: string, isChecked: boolean) => {
        const node = findNode(currentAreas, id);
        if (!node) return;

        const affectedIds = getAllDescendantIds(node);
        let newSelected = [...selectedAreas];

        if (isChecked) {
            // Add all descendants that aren't already selected
            affectedIds.forEach(affectedId => {
                if (!newSelected.includes(affectedId)) newSelected.push(affectedId);
            });

            // Bubble up: check if parent should be selected
            let currentParent = findParent(currentAreas, id);
            while (currentParent) {
                const allChildrenSelected = currentParent.children!.every((child) => newSelected.includes(child.id));
                if (allChildrenSelected) {
                    if (!newSelected.includes(currentParent.id)) {
                        newSelected.push(currentParent.id);
                    }
                    currentParent = findParent(currentAreas, currentParent.id);
                } else {
                    break;
                }
            }
        } else {
            // Remove all descendants
            newSelected = newSelected.filter(sid => !affectedIds.includes(sid));

            // Bubble up: remove all ancestors
            let currentParent = findParent(currentAreas, id);
            while (currentParent) {
                if (newSelected.includes(currentParent.id)) {
                    newSelected = newSelected.filter(sid => sid !== currentParent?.id);
                    currentParent = findParent(currentAreas, currentParent.id);
                } else {
                    break;
                }
            }
        }
        onSelectionChange(newSelected);
    }, [currentAreas, selectedAreas, findNode, getAllDescendantIds, findParent, onSelectionChange]);

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
            className={`flex-fill shadow-sm ${isEditUser ? 'border-0' : (isDarkMode ? 'text-white border-white' : '')}`}
            style={{
                background: isEditUser ? '#F0F2F5' : (isDarkMode ? '#212529' : ''),
                height: isEditUser ? '100%' : 'auto',
                minHeight: isEditUser ? '0' : '300px'
            }}
        >
            {showHeader && (
                <Card.Header className={`${isDarkMode ? 'border-bottom border-white text-white' : 'bg-light'} fw-bold`}>
                    {headerTitle}
                </Card.Header>
            )}
            <Card.Body className="p-3">
                <Form.Select
                    className="mb-3 border-0 py-2"
                    value={selectedHierarchy}
                    onChange={(e) => setSelectedHierarchy(e.target.value)}
                    style={{
                        backgroundColor: isEditUser || !isDarkMode ? '#fff' : '#212529',
                        color: isEditUser || !isDarkMode ? '#000' : '#fff',
                        border: isDarkMode && !isEditUser ? '1px solid #495057' : '1px solid #ced4da'
                    }}
                >
                    {hierarchyOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </Form.Select>

                {/* Search Input */}
                <div className="position-relative mb-3">
                    <Form.Control
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{
                            backgroundColor: isEditUser || !isDarkMode ? '#fff' : '#212529',
                            color: isEditUser || !isDarkMode ? '#000' : '#fff',
                            border: isDarkMode && !isEditUser ? '1px solid #495057' : '1px solid #ced4da'
                        }}
                    />
                    {searchTerm && searchTerm !== debouncedSearchTerm && (
                        <small className="text-muted d-block mt-1">Searching...</small>
                    )}
                </div>

                <hr className="my-3 opacity-25" />
                <div style={{ maxHeight: '400px', overflowY: 'auto' }} className="pe-2 area-selection-tree">
                    {currentAreas.map(area => (
                        <TreeNode
                            key={area.id}
                            node={area}
                            selectedAreas={selectedAreas}
                            onSelect={handleSelect}
                            isTeamMode={isTeamMode}
                            onTeamClick={handleTeamClick}
                            areaTeams={areaTeams}
                            textColor={effectiveTextColor}
                            filter={debouncedSearchTerm}
                            expandedNodeId={expandedNodeId}
                            onToggleExpand={setExpandedNodeId}
                        />
                    ))}
                </div>
            </Card.Body>
            <SelectTeamModal show={showModal} onHide={() => setShowModal(false)} onSelect={handleTeamSelect} />
        </Card>
    );
};

export default AreasSelection;
