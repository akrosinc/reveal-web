import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, Form, Collapse } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { useAppSelector } from '../../../../store/hooks';
import { datasetsByHierarchy, hierarchyOptions, AreaNode } from './mockLargeDataset';

interface Props {
  selectedAreas: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

interface TreeNodeProps {
  node: AreaNode;
  selectedAreas: string[];
  onSelect: (id: string, checked: boolean) => void;
  filter: string;
  depth?: number;
  expandedNodeId: string | null;
  onToggleExpand: (nodeId: string | null) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, selectedAreas, onSelect, filter, depth = 0, expandedNodeId, onToggleExpand }) => {
  const [childrenLoaded, setChildrenLoaded] = useState(false); // Track if children are loaded
  const [isVisible, setIsVisible] = useState(depth === 0); // Top level always visible
  const isDarkMode = useAppSelector((state: any) => state.darkMode.value);
  const checkboxRef = useRef<HTMLInputElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  const isSelected = selectedAreas.includes(node.id);
  const hasChildren = node.children && node.children.length > 0;

  // Single accordion logic: check if this node matches the expanded one
  // If filter is active, we expand if matching children found, essentially ignoring single-accordion restriction for search
  // But if the user request implies strict single accordion even during search, we might need adjustments.
  // However, usually search results should show all matches.
  // Let's keep expanded if filter matches OR if expandedNodeId matches.
  const isExpandedByFilter = !!(filter && hasChildren && node.children?.some(c => JSON.stringify(c).toLowerCase().includes(filter.toLowerCase())));
  const expanded = isExpandedByFilter || expandedNodeId === node.id;

  // Auto-expand logic handled by isExpandedByFilter derivation above
  // but if we need to update state for single accordion when filter clears?
  // Actually, we don't need local state for expansion anymore if we rely on props.
  // But wait, if filter clears, we want to go back to previous state? Or closed?
  // The user said "by default all accordions are closed".

  // Lazy loading with Intersection Observer (only for nested items)
  useEffect(() => {
    // Disable lazy loading when filtering to prevent whitespace gaps
    if (filter) {
      setIsVisible(true);
      return;
    }

    if (depth === 0 || !nodeRef.current) return; // Skip for top-level items

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
      // Simulate async loading (in real app, this could be an API call)
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
  }); // Run on every render to ensure indeterminate state persists

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

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Toggle: if already expanded, close it (pass null); otherwise open this one (pass id)
    onToggleExpand(expandedNodeId === node.id ? null : node.id);
  };

  const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelect(node.id, e.target.checked);
  };

  // Render placeholder until visible (lazy loading for nested items)
  // DISABLE placeholder if filtering
  if (!isVisible && depth > 0 && !filter) {
    return <div ref={nodeRef} style={{ height: '40px' }} />;
  }

  return (
    <div ref={nodeRef} className="mb-1" style={{ background: isDarkMode ? '#212529' : '' }}>
      <div className="d-flex align-items-center justify-content-between">

        <div className="form-check mb-0">
          <input
            ref={checkboxRef}
            className={`form-check-input ${hasChildren ? 'parent-checkbox' : 'child-checkbox'}`}
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
      </div>
      {hasChildren && (
        <Collapse in={expanded}>
          <div className="ms-4">
            {childrenLoaded ? (
              node.children!.map((child) => (
                <TreeNode
                  key={child.id}
                  node={child}
                  selectedAreas={selectedAreas}
                  onSelect={onSelect}
                  filter={filter}
                  depth={depth + 1}
                  expandedNodeId={expandedNodeId} // Pass down, though children usually don't have expanded logic if 2 levels
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

// Custom hook for debounced search
const useDebounce = (value: string, delay: number = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const AreasSelection: React.FC<Props> = ({ selectedAreas, onSelectionChange }) => {
  const isDarkMode = useAppSelector((state: any) => state.darkMode.value);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // 300ms debounce
  const [selectedHierarchy, setSelectedHierarchy] = useState('Niagara');
  const [currentAreas, setCurrentAreas] = useState<AreaNode[]>(datasetsByHierarchy['Niagara']);
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null); // State for single expanded node

  // Update areas when hierarchy changes
  useEffect(() => {
    setCurrentAreas(datasetsByHierarchy[selectedHierarchy] || []);
    // Clear selections when changing hierarchy
    onSelectionChange([]);
    // Clear search when changing hierarchy
    setSearchTerm('');
    // Reset expanded state
    setExpandedNodeId(null);
  }, [selectedHierarchy, onSelectionChange]);

  const getAllDescendantIds = useCallback((node: AreaNode): string[] => {
    let ids = [node.id];
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
          newSelected = newSelected.filter(sid => sid !== currentParent.id);
          currentParent = findParent(currentAreas, currentParent.id);
        } else {
          break;
        }
      }
    }
    onSelectionChange(newSelected);
  }, [currentAreas, selectedAreas, findNode, getAllDescendantIds, findParent, onSelectionChange]);

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
              value={selectedHierarchy}
              onChange={(e) => setSelectedHierarchy(e.target.value)}
              style={{
                backgroundColor: isDarkMode ? '#212529' : '#fff',
                color: isDarkMode ? '#fff' : '#6c757d',
                border: isDarkMode ? '1px solid #495057' : '1px solid #ced4da'
              }}
            >
              {hierarchyOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
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
              {searchTerm && searchTerm !== debouncedSearchTerm && (
                <small className="text-muted d-block mt-1">Searching...</small>
              )}
            </div>
          </div>

          <div
            style={{ maxHeight: '400px', overflowY: 'auto', background: isDarkMode ? '#212529' : '#FFF' }}
            className="rounded p-2 area-selection-tree"
          >
            {currentAreas.length === 0 ? (
              <div className="text-muted text-center p-3">No areas available</div>
            ) : (
              currentAreas.map(area => (
                <TreeNode
                  key={area.id}
                  node={area}
                  selectedAreas={selectedAreas}
                  onSelect={handleSelect}
                  filter={debouncedSearchTerm}
                  expandedNodeId={expandedNodeId}
                  onToggleExpand={setExpandedNodeId}
                />
              ))
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AreasSelection;
