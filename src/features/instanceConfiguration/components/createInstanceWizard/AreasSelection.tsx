import React, { useState, useRef, useEffect } from 'react';
import { Card, Form, Collapse } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronDown, faSearch } from '@fortawesome/free-solid-svg-icons';
import { useAppSelector } from '../../../../store/hooks';

// Mock Data - 2 levels of nesting
const mockAreas = [
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
];

interface Props {
  selectedAreas: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

const TreeNode = ({ node, selectedAreas, onSelect, filter }: any) => {
  const [expanded, setExpanded] = useState(true);
  const isDarkMode = useAppSelector((state: any) => state.darkMode.value);
  const checkboxRef = useRef<HTMLInputElement>(null);

  const isSelected = selectedAreas.includes(node.id);
  const hasChildren = node.children && node.children.length > 0;

  // Calculate indeterminate state
  const getDescendantSelectionState = (n: any): { total: number; selected: number } => {
    let total = 0;
    let selected = 0;

    if (n.children && n.children.length > 0) {
      n.children.forEach((child: any) => {
        const childState = getDescendantSelectionState(child);
        total += childState.total;
        selected += childState.selected;
      });
    } else {
      // Leaf node
      total = 1;
      selected = selectedAreas.includes(n.id) ? 1 : 0;
    }

    return { total, selected };
  };

  const isIndeterminate = () => {
    if (!hasChildren) return false;
    const state = getDescendantSelectionState(node);
    return state.selected > 0 && state.selected < state.total;
  };

  const indeterminate = isIndeterminate();

  // Set indeterminate property on checkbox
  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  // Filter logic (for search)
  if (filter) {
    const matches = node.label.toLowerCase().includes(filter.toLowerCase());
    const childMatches =
      node.children &&
      node.children.some((c: any) => {
        return JSON.stringify(c).toLowerCase().includes(filter.toLowerCase());
      });
    if (!matches && !childMatches) return null;
  }

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelect(node.id, e.target.checked);
  };

  return (
    <div className="mb-1" style={{ background: isDarkMode ? '#212529' : '' }}>
      <div className="d-flex align-items-center">
        {hasChildren ? (
          <span
            onClick={handleExpand}
            style={{ cursor: 'pointer', width: '20px', display: 'inline-block', textAlign: 'center' }}
            className="me-1"
          >
            <FontAwesomeIcon icon={expanded ? faChevronDown : faChevronRight} size="xs" className="text-secondary" />
          </span>
        ) : (
          <span style={{ width: '20px', display: 'inline-block' }} className="me-1"></span>
        )}
        <div className="form-check mb-0">
          <input
            ref={checkboxRef}
            className="form-check-input"
            type="checkbox"
            id={`edit-${node.id}`}
            checked={isSelected}
            onChange={handleCheck}
            style={{ cursor: 'pointer' }}
          />
          <label
            className="form-check-label"
            htmlFor={`edit-${node.id}`}
            style={{ cursor: 'pointer', userSelect: 'none' }}
          >
            {node.label}
          </label>
        </div>
      </div>
      {hasChildren && (
        <Collapse in={expanded}>
          <div className="ms-4">
            {node.children.map((child: any) => (
              <TreeNode
                key={child.id}
                node={child}
                selectedAreas={selectedAreas}
                onSelect={onSelect}
                filter={filter}
              />
            ))}
          </div>
        </Collapse>
      )}
    </div>
  );
};

const AreasSelection = ({ selectedAreas, onSelectionChange }: Props) => {
  const isDarkMode = useAppSelector((state: any) => state.darkMode.value);
  const [searchTerm, setSearchTerm] = useState('');

  const getAllDescendantIds = (node: any): string[] => {
    let ids = [node.id];
    if (node.children) {
      node.children.forEach((child: any) => {
        ids = [...ids, ...getAllDescendantIds(child)];
      });
    }
    return ids;
  };

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

  const findParent = (nodes: any[], targetId: string, parent: any = null): any => {
    for (const node of nodes) {
      if (node.id === targetId) return parent;
      if (node.children) {
        const found = findParent(node.children, targetId, node);
        if (found) return found;
      }
    }
    return null;
  };

  const handleSelect = (id: string, isChecked: boolean) => {
    const node = findNode(mockAreas, id);
    if (!node) return;

    const affectedIds = getAllDescendantIds(node);
    let newSelected = [...selectedAreas];

    if (isChecked) {
      // Add all descendants that aren't already selected
      affectedIds.forEach(affectedId => {
        if (!newSelected.includes(affectedId)) newSelected.push(affectedId);
      });

      // Bubble up: check if parent should be selected
      let currentParent = findParent(mockAreas, id);
      while (currentParent) {
        const allChildrenSelected = currentParent.children.every((child: any) => newSelected.includes(child.id));
        if (allChildrenSelected) {
          if (!newSelected.includes(currentParent.id)) {
            newSelected.push(currentParent.id);
          }
          currentParent = findParent(mockAreas, currentParent.id);
        } else {
          break;
        }
      }
    } else {
      // Remove all descendants
      newSelected = newSelected.filter(sid => !affectedIds.includes(sid));

      // Bubble up: remove all ancestors
      let currentParent = findParent(mockAreas, id);
      while (currentParent) {
        if (newSelected.includes(currentParent.id)) {
          newSelected = newSelected.filter(sid => sid !== currentParent.id);
          currentParent = findParent(mockAreas, currentParent.id);
        } else {
          break;
        }
      }
    }
    onSelectionChange(newSelected);
  };

  return (
    <div>
      {/* Single Areas Card */}
      <Card
        className={`shadow-sm ${isDarkMode ? 'border-white' : ''}`}
        style={{ background: isDarkMode ? '#212529' : '#f8f9fa' }}
      >
        <Card.Header className={`${isDarkMode ? 'border-bottom border-white text-white' : 'bg-white border-bottom'} fw-bold`}>
          Areas
        </Card.Header>
        <Card.Body className="p-3" style={{ background: isDarkMode ? '#282828' : '#fff' }}>
          <div className="mb-3">
            <Form.Select
              className="mb-2"
              defaultValue="Niagara"
              style={{
                backgroundColor: isDarkMode ? '#212529' : '#fff',
                color: isDarkMode ? '#fff' : '#6c757d',
                border: isDarkMode ? '1px solid #495057' : '1px solid #ced4da'
              }}
            >
              <option value="Niagara">Niagara</option>
            </Form.Select>
            <div className="position-relative">
              <Form.Control
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="ps-2"
                style={{
                  fontSize: '0.9rem',
                  backgroundColor: isDarkMode ? '#212529' : '#fff',
                  color: isDarkMode ? '#fff' : '#000',
                  border: isDarkMode ? '1px solid #495057' : '1px solid #ced4da'
                }}
              />
            </div>
          </div>

          <div
            style={{ maxHeight: '400px', overflowY: 'auto', background: isDarkMode ? '#212529' : '#FFF' }}
            className="rounded p-2"
          >
            {mockAreas.map(area => (
              <TreeNode
                key={area.id}
                node={area}
                selectedAreas={selectedAreas}
                onSelect={handleSelect}
                filter={searchTerm}
              />
            ))}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AreasSelection;
