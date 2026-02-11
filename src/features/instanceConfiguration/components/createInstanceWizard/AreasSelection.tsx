import React, { useState } from 'react';
import { Card, Form, ListGroup, Button, Collapse } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronDown, faCheck } from '@fortawesome/free-solid-svg-icons';

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
            },
            {
                id: 'lagos',
                label: 'Lagos',
                children: [
                    { id: 'lg1', label: 'LG 1' },
                    { id: 'lg2', label: 'LG 2' }
                ]
            }
        ]
    }
];

interface Props {
    selectedAreas: string[];
    onSelectionChange: (selectedIds: string[]) => void;
}

const TreeNode = ({ node, selectedAreas, onToggle, onSelect }: any) => {
    const [expanded, setExpanded] = useState(true);

    const isSelected = selectedAreas.includes(node.id);
    const hasChildren = node.children && node.children.length > 0;

    const handleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        setExpanded(!expanded);
    };

    const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSelect(node.id, e.target.checked);
    };

    return (
        <div className="ms-3">
            <div className="d-flex align-items-center mb-1">
                {hasChildren ? (
                    <span onClick={handleExpand} style={{ cursor: 'pointer', width: '20px' }}>
                        <FontAwesomeIcon icon={expanded ? faChevronDown : faChevronRight} size="xs" />
                    </span>
                ) : (
                    <span style={{ width: '20px' }}></span>
                )}
                <Form.Check
                    type="checkbox"
                    id={`check-${node.id}`}
                    label={node.label}
                    checked={isSelected}
                    onChange={handleCheck}
                    className="mb-0"
                />
            </div>
            {hasChildren && (
                <Collapse in={expanded}>
                    <div>
                        {node.children.map((child: any) => (
                            <TreeNode
                                key={child.id}
                                node={child}
                                selectedAreas={selectedAreas}
                                onToggle={onToggle}
                                onSelect={onSelect}
                            />
                        ))}
                    </div>
                </Collapse>
            )}
        </div>
    );
};

const AreasSelection = ({ selectedAreas, onSelectionChange }: Props) => {
    const [searchTerm, setSearchTerm] = useState('');

    const recursiveSelect = (node: any, isChecked: boolean, currentSelected: string[]) => {
        let newSelected = [...currentSelected];
        if (isChecked) {
            if (!newSelected.includes(node.id)) newSelected.push(node.id);
        } else {
            newSelected = newSelected.filter(id => id !== node.id);
        }

        if (node.children) {
            node.children.forEach((child: any) => {
                newSelected = recursiveSelect(child, isChecked, newSelected);
            });
        }
        return newSelected;
    };

    const handleSelect = (id: string, isChecked: boolean) => {
        // Find node and select/deselect self and children (simplified flat lookup for demo)
        // For a real app, we need a lookup map or recursive search.
        // Assuming simple flat selection for now or implementing recursive helper

        // Better implementation: find node in mockAreas
        const findNode = (nodes: any[], targetId: string): any => {
            for (const node of nodes) {
                if (node.id === targetId) return node;
                if (node.children) {
                    const found = findNode(node.children, targetId);
                    if (found) return found;
                }
            }
            return null;
        };

        const node = findNode(mockAreas, id);
        if (node) {
            const newSelected = recursiveSelect(node, isChecked, selectedAreas);
            onSelectionChange(newSelected);
        }
    };

    return (
        <div className="d-flex gap-3">
            {/* Areas Tree */}
            <Card className="flex-fill" style={{ minWidth: '300px' }}>
                <Card.Header className="bg-light fw-bold">Areas</Card.Header>
                <Card.Body>
                    <Form.Control
                        type="text"
                        placeholder="Search..."
                        className="mb-3"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {mockAreas.map(area => (
                            <TreeNode
                                key={area.id}
                                node={area}
                                selectedAreas={selectedAreas}
                                onSelect={handleSelect}
                            />
                        ))}
                    </div>
                </Card.Body>
            </Card>

            {/* Selected Areas */}
            <Card className="flex-fill" style={{ minWidth: '300px' }}>
                <Card.Header className="bg-light fw-bold">Selected Areas</Card.Header>
                <Card.Body style={{ maxHeight: '475px', overflowY: 'auto' }}>
                    {/* Logic to show selected structure mimics tree but only selected items */}
                    {selectedAreas.length === 0 && <span className="text-muted">No areas selected</span>}
                    <ListGroup variant="flush">
                        {selectedAreas.map(id => (
                            <ListGroup.Item key={id} className="border-0 py-1">
                                <FontAwesomeIcon icon="check-square" className="text-primary me-2" />
                                {id} {/* Use label mapped from ID in real app */}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Card.Body>
            </Card>
        </div>
    );
};

export default AreasSelection;
