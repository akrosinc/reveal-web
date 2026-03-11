import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Card, Form, Collapse, Button, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { useAppSelector } from '../../../../store/hooks';
import { datasetsByHierarchy, hierarchyOptions, AreaNode } from './mockLargeDataset';
import { getHierarchy } from '../../../planSimulation/components/SimulationMapView/api/hierarchyAPI';
import { getLocationHierarchyList, getLocationListByHierarchyId, getLocationById } from '../../../location/api';
import { toast } from 'react-toastify';
interface Options {
  value: string;
  label: string;
  nodeOrder?: string[];
}
interface Props {
  selectedHierarchy?: string;
  selectedAreas: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

const mapLocationToAreaNode = (loc: any): AreaNode => ({
  identifier: loc.identifier,
  children: loc.children ? loc.children.map(mapLocationToAreaNode) : [],
  properties: {
    name: loc.properties.name,
    geographicLevel: loc.properties.geographicLevel,
    assigned: loc.properties.assigned,
    parentIdentifier: loc.properties.parentIdentifier,
    childrenNumber: loc.properties.childrenNumber,
    simulationSearchResult: false
  }
});

interface TreeNodeProps {
  node: AreaNode;
  selectedAreas: string[];
  onSelect: (id: string, checked: boolean) => void;
  filter: string;
  depth?: number;
  expandedNodeIds: string[];
  onToggleExpand: (nodeId: string) => void;
  inheritedMatch?: boolean;
}

// Custom comparison for memo to prevent nodes from re-rendering unless relevant state changed
const TreeNode = React.memo<TreeNodeProps>(({ 
  node, 
  selectedAreas, 
  onSelect, 
  filter, 
  depth = 0, 
  expandedNodeIds, 
  onToggleExpand, 
  inheritedMatch = false 
}) => {
  // We'll use a Set locally for ultra-fast lookup if passed as a prop, 
  // but since we are optimizing the parent, we'll expect an array here for compatibility 
  // and convert it or use the Set if we change the prop type.
  // For now, let's stick to the parent providing the optimization.
  const [childrenLoaded, setChildrenLoaded] = useState(false); // Track if children are loaded
  const [isVisible, setIsVisible] = useState(depth === 0); // Top level always visible
  const isDarkMode = useAppSelector((state: any) => state.darkMode.value);
  const checkboxRef = useRef<HTMLInputElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  const isSelected = selectedAreas.includes(node.identifier);
  const hasChildren = !!(node.children && node.children.length > 0);

  // Single accordion logic: check if this node matches the expanded one
  // If filter is active, we expand if matching children found, essentially ignoring single-accordion restriction for search
  // But if the user request implies strict single accordion even during search, we might need adjustments.
  // However, usually search results should show all matches.
  // Let's keep expanded if filter matches OR if expandedNodeId matches.
  const isExpandedByFilter = !!(filter && (inheritedMatch || node.properties.name.toLowerCase().includes(filter.toLowerCase()) || (hasChildren && node.children?.some(c => JSON.stringify(c).toLowerCase().includes(filter.toLowerCase())))));
  const expanded = isExpandedByFilter || expandedNodeIds.includes(node.identifier);

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

  // Get leaf IDs recursively for cascading selection
  const getLeafIds = useCallback((n: AreaNode): string[] => {
    let ids: string[] = [];
    if (n.children && n.children.length > 0) {
      n.children.forEach(child => {
        ids = [...ids, ...getLeafIds(child)];
      });
    } else {
      ids.push(n.identifier);
    }
    return ids;
  }, []);

  // Calculate selection state based on leaf descendants
  const getDescendantSelectionState = useCallback((n: AreaNode): { total: number; selected: number } => {
    let total = 0;
    let selected = 0;

    const leaves = getLeafIds(n);
    total = leaves.length;
    selected = leaves.filter(id => selectedAreas.includes(id)).length;

    return { total, selected };
  }, [selectedAreas, getLeafIds]);

  const { total, selected } = getDescendantSelectionState(node);
  const isFullySelected = !!(hasChildren && total > 0 && selected === total);
  const indeterminate = !!(hasChildren && selected > 0 && selected < total);


  // Set indeterminate property on checkbox
  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }); // Run on every render to ensure indeterminate state persists

  // Filter logic
  const parentMatches = node.properties.name.toLowerCase().includes(filter.toLowerCase());
  
  if (filter && !inheritedMatch && !parentMatches) {
    const anyChildMatches =
      node.children &&
      node.children.some((c) => {
        return JSON.stringify(c).toLowerCase().includes(filter.toLowerCase());
      });

    // If neither parent nor any child matches, don't show this node at all
    if (!anyChildMatches) {
      return null;
    }
  }

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Toggle: Add or remove this node's ID from the expanded array
    onToggleExpand(node.identifier);
  };

  const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelect(node.identifier, e.target.checked);
  };

  // Render placeholder until visible (lazy loading for nested items)
  // DISABLE placeholder if filtering
  if (!isVisible && depth > 0 && !filter) {
    return <div ref={nodeRef} style={{ height: '40px' }} />;
  }

  return (
    <div ref={nodeRef} className="mb-1" style={{ background: isDarkMode ? '#212529' : '', paddingLeft: depth === 0 ? 0 : '1rem' }}>
      <div className="d-flex align-items-center justify-content-between p-1 rounded" style={{ backgroundColor: isDarkMode && depth > 0 ? '#2c2c2c' : '' }}>
        <div className="d-flex align-items-center flex-grow-1">
          {hasChildren ? (
            <span
              onClick={handleExpand}
              style={{ cursor: 'pointer', width: '20px', display: 'inline-block', textAlign: 'center' }}
              className="me-2 text-secondary"
            >
              <FontAwesomeIcon icon={expanded ? faChevronDown : faChevronRight} size="xs" />
            </span>
          ) : (
            <span style={{ width: '20px', display: 'inline-block' }} className="me-2"></span>
          )}

          <div className="form-check mb-0 d-flex align-items-center">
            {!hasChildren ? (
              <>
                <input
                  ref={checkboxRef}
                  className="form-check-input child-checkbox me-2 mt-0"
                  type="checkbox"
                  id={`edit-${node.identifier}`}
                  checked={isSelected}
                  onChange={handleCheck}
                  style={{ cursor: 'pointer' }}
                />
                <label
                  className="form-check-label"
                  htmlFor={`edit-${node.identifier}`}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  {node.properties.name}
                </label>
              </>
            ) : (
              <div
                className="fw-bold"
                style={{ 
                  cursor: 'pointer', 
                  userSelect: 'none', 
                  fontSize: depth === 0 ? '1.1rem' : '1rem', 
                  color: (isFullySelected || indeterminate) ? '#0d6efd' : isDarkMode ? '#fff' : '#000' 
                }}
                onClick={handleExpand}
              >
                {node.properties.name}
                {(isFullySelected || indeterminate) && (
                  <span className="ms-2 badge rounded-pill bg-primary border-0" style={{ fontSize: '0.65rem', verticalAlign: 'middle' }}>
                    {selected} / {total}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {hasChildren && (
          <div className="d-flex align-items-center">
            <Button
              variant="link"
              size="sm"
              className="p-0 text-decoration-none me-2 h-auto"
              style={{ fontSize: '0.75rem' }}
              onClick={() => onSelect(node.identifier, selected < total)}
            >
              {isFullySelected ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
        )}
      </div>
      {hasChildren && (
        <Collapse in={expanded}>
          <div className="ms-2 border-start border-secondary-subtle">
            {childrenLoaded ? (
              node.children!.map((child) => (
                <TreeNode
                  key={child.identifier}
                  node={child}
                  selectedAreas={selectedAreas}
                  onSelect={onSelect}
                  filter={filter}
                  depth={depth + 1}
                  expandedNodeIds={expandedNodeIds} // Pass down the array of expanded ids
                  onToggleExpand={onToggleExpand}
                  inheritedMatch={inheritedMatch || parentMatches}
                />
              ))
            ) : (
              <div className="text-muted small p-2">Loading...</div>
            )}
          </div>
        </Collapse>
      )}
    </div>
  )
});

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

const AreasSelection: React.FC<Props> = ({ selectedHierarchy, selectedAreas, onSelectionChange }) => {
  const isDarkMode = useAppSelector((state: any) => state.darkMode.value);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // 300ms debounce
  const [hierarchyOpen, setHierarchyOpen] = useState(false);
  const [hierarchyList, setHierarchyList] = useState<Options[]>([]);
  const displayLabel = useMemo(() => {
    const found = hierarchyList.find(h => h.value === selectedHierarchy);
    if (found) return found.label;
    return selectedHierarchy || '';
  }, [hierarchyList, selectedHierarchy]);

  const [currentAreas, setCurrentAreas] = useState<AreaNode[]>(datasetsByHierarchy[selectedHierarchy || 'Niagara'] || []);
  const [expandedNodeIds, setExpandedNodeIds] = useState<string[]>([]); // State for multiple expanded nodes
  const [isLoading, setIsLoading] = useState(false);

  // Optimized lookup Set
  const selectedSet = useMemo(() => new Set(selectedAreas), [selectedAreas]);

  // Recursively enrich nodes with their leaf counts for O(1) render-time stats
  const enrichedAreas = useMemo(() => {
    const enrich = (node: AreaNode): AreaNode & { _leafIds: string[], _stats: { total: number, selected: number } } => {
      let leafIds: string[] = [];
      let mappedChildren: any[] = [];
      
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => {
          const enrichedChild = enrich(child);
          leafIds = [...leafIds, ...enrichedChild._leafIds];
          mappedChildren.push(enrichedChild);
        });
      } else {
        leafIds = [node.identifier];
      }

      const selectedCount = leafIds.filter(id => selectedSet.has(id)).length;
      
      return {
        ...node,
        children: mappedChildren,
        _leafIds: leafIds,
        _stats: { total: leafIds.length, selected: selectedCount }
      } as any;
    };

    return currentAreas.map(enrich);
  }, [currentAreas, selectedSet]);

  const toggleNodeExpansion = useCallback((nodeId: string) => {
    setExpandedNodeIds(prev => 
      prev.includes(nodeId) ? prev.filter(id => id !== nodeId) : [...prev, nodeId]
    );
  }, []);

  const loadData = useCallback(
    (size: number, page: number, searchData?: string, sortField?: string, sortDirection?: boolean) => {
      setIsLoading(true);
      getLocationHierarchyList(0, 0, true)
        .then(res => {
          if (res.content && res.content.length > 0) {
            const hierarchyId = res.content[0].identifier;
            getLocationListByHierarchyId(size, page, hierarchyId!, true, searchData, sortField, sortDirection)
              .then(locRes => {
                if (locRes.content && locRes.content.length > 0) {
                 setCurrentAreas(locRes?.content)
                  setIsLoading(false);
                } else {
                  setCurrentAreas([]);
                  setIsLoading(false);
                }
              })
              .catch(err => {
                toast.error(err.message || 'Error fetching locations');
                setIsLoading(false);
              });
          } else {
            setIsLoading(false);
          }
        })
        .catch(err => {
          toast.error(err.message || 'Error fetching hierarchies');
          setIsLoading(false);
        });
    },
    []
  );

  useEffect(()=>{
    Promise.all([getLocationHierarchyList(0, 0, true)])
          .then(([locationHierarchyList]) => {
            const hList = locationHierarchyList.content.map<Options>(el => ({
              label: el.name,
              value: el.identifier ?? '',
              nodeOrder: el.nodeOrder
            }));
            setHierarchyList(hList);           
          })
          .catch(err => toast.error(err));
  },[])
  
  // Update areas when hierarchy changes from parent
  useEffect(() => {
    // if (displayHierarchy === 'default') {
    const dh = selectedHierarchy || 'Niagara';
    if (dh === 'f470addc-9251-46a5-8e1e-45ba45082da4'){
      loadData(10, 0);
    } else {
      setCurrentAreas(datasetsByHierarchy[dh] || []);
    }
  }, [selectedHierarchy, loadData]);

  const getAllLeafIds = useCallback((node: AreaNode): string[] => {
    let ids: string[] = [];
    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        ids = [...ids, ...getAllLeafIds(child)];
      });
    } else {
      ids.push(node.identifier);
    }
    return ids;
  }, []);

  const findNode = useCallback((nodes: AreaNode[], targetId: string): AreaNode | null => {
    for (const node of nodes) {
      if (node.identifier === targetId) return node;
      if (node.children) {
        const found = findNode(node.children, targetId);
        if (found) return found;
      }
    }
    return null;
  }, []);

  const findParent = useCallback((nodes: AreaNode[], targetId: string, parent: AreaNode | null = null): AreaNode | null => {
    for (const node of nodes) {
      if (node.identifier === targetId) return parent;
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

    const leafIds = getAllLeafIds(node);
    let newSelected = [...selectedAreas];

    if (isChecked) {
      // Add all leaf descendants that aren't already selected
      leafIds.forEach(leafId => {
        if (!newSelected.includes(leafId)) newSelected.push(leafId);
      });
    } else {
      // Remove all leaf descendants
      newSelected = newSelected.filter(sid => !leafIds.includes(sid));
    }
    onSelectionChange(newSelected);
  }, [currentAreas, selectedAreas, findNode, getAllLeafIds, onSelectionChange]);

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
          <div className="area-selection-content">
            <div className="mb-3">
              <div className="mb-2">
                <div
                  onClick={() => setHierarchyOpen(!hierarchyOpen)}
                  className="d-flex align-items-center justify-content-between p-3 border-bottom"
                  style={{
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  <span className="fw-bold">
                    {displayLabel}
                  </span>
                  <FontAwesomeIcon icon={hierarchyOpen ? faChevronDown : faChevronRight} size="xs" className="text-secondary" />
                </div>
                <Collapse in={hierarchyOpen}>
                  <div
                    className=""
                  >
                    <div className="p-3 border-bottom">
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
                         <div className="d-flex align-items-center gap-2 mt-2">
                            <Spinner animation="border" size="sm" variant="primary" style={{ width: '0.8rem', height: '0.8rem', borderWidth: '1px' }} />
                            <small className="text-muted">Searching...</small>
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      style={{ maxHeight: '400px', overflowY: 'auto', background: isDarkMode ? '#212529' : '#FFF' }}
                      className="rounded p-2 area-selection-tree"
                    >
                      {isLoading ? (
                        <div className="text-muted text-center p-3">Loading global data...</div>
                      ) : enrichedAreas.length === 0 ? (
                        <div className="text-muted text-center p-3">No areas available</div>
                      ) : (
                        enrichedAreas.map(area => (
                          <TreeNode
                            key={area.identifier}
                            node={area}
                            selectedAreas={selectedAreas}
                            onSelect={handleSelect}
                            filter={debouncedSearchTerm}
                            depth={0}
                            expandedNodeIds={expandedNodeIds}
                            onToggleExpand={toggleNodeExpansion}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </Collapse>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AreasSelection;
