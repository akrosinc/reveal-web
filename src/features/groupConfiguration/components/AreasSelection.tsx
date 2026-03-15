import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Card, Form, Collapse, Button, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronDown, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { useAppSelector } from '../../../store/hooks';
import { datasetsByHierarchy, AreaNode } from './mockLargeDataset';
import { getAssignedAreaTree } from '../api';
import { toast } from 'react-toastify';
import SelectTeamModal from './SelectTeamModal';

interface Props {
  isTeamMode: boolean;
  selectedHierarchy?: string;
  selectedAreas: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  areaTeams: Record<string, string>;
  onAreaTeamChange: (areaId: string, team: string) => void;
}

interface TreeNodeProps {
  node: AreaNode;
  selectedSet: Set<string>;
  onSelect: (id: string, checked: boolean) => void;
  filter: string;
  depth?: number;
  expandedNodeIds: string[];
  onToggleExpand: (nodeId: string) => void;
  inheritedMatch?: boolean;
  isTeamMode?: boolean;
  areaTeams?: Record<string, string>;
  onTeamClick?: (id: string) => void;
  isDarkMode: boolean;
}

const TreeNode = React.memo<TreeNodeProps>(({ 
  node, 
  selectedSet, 
  onSelect, 
  filter, 
  depth = 0, 
  expandedNodeIds, 
  onToggleExpand, 
  inheritedMatch = false ,
  isTeamMode = false,
  areaTeams = {},
  onTeamClick,
  isDarkMode
}) => {
  const [childrenLoaded, setChildrenLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const checkboxRef = useRef<HTMLInputElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  const isSelected = selectedSet.has(node.identifier);
  const hasChildren = !!(node.children && node.children.length > 0);

  // Use pre-calculated stats from enriched node
  const { total, selected, _isMatch, _hasChildMatch } = (node as any)._stats || { 
    total: hasChildren ? 0 : 1, 
    selected: isSelected ? 1 : 0,
    _isMatch: true,
    _hasChildMatch: false
  };

  const isExpandedByFilter = !!(filter && (inheritedMatch || _isMatch || _hasChildMatch));
  const expanded = isExpandedByFilter || expandedNodeIds.includes(node.identifier);

  useEffect(() => {
    if (!nodeRef.current) return;

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
        rootMargin: '200px', // More margin for smoother scrolling
        threshold: 0.01
      }
    );

    observer.observe(nodeRef.current);
    return () => observer.disconnect();
  }, [depth, filter]);

  useEffect(() => {
    if ((expanded || filter) && hasChildren && !childrenLoaded) {
      setTimeout(() => {
        setChildrenLoaded(true);
      }, 0);
    }
  }, [expanded, filter, hasChildren, childrenLoaded]);

  const isFullySelected = !!(hasChildren && total > 0 && selected === total);
  const indeterminate = !!(hasChildren && selected > 0 && selected < total);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  });

  // 1. First check if we should prune this node based on filter
  if (filter && !inheritedMatch && !_isMatch && !_hasChildMatch) {
    return null;
  }

  // 2. Then check if we should render a placeholder (lazy loading)
  if (!isVisible) {
    return <div ref={nodeRef} style={{ height: '40px', background: isDarkMode ? '#212529' : '' }} />;
  }

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand(node.identifier);
  };

  const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelect(node.identifier, e.target.checked);
  };

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
                  id={`area-${node.identifier}`}
                  checked={isSelected}
                  onChange={handleCheck}
                  style={{ cursor: 'pointer' }}
                />
                <label
                  className="form-check-label"
                  htmlFor={`area-${node.identifier}`}
                  style={{ cursor: 'pointer', userSelect: 'none', color: isDarkMode ? '#fff' : '#000' }}
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

        <div className="d-flex align-items-center">
          {hasChildren && (
            <Button
              variant="link"
              size="sm"
              className="p-0 text-decoration-none me-2 h-auto"
              style={{ fontSize: '0.75rem' }}
              onClick={() => onSelect(node.identifier, selected < total)}
            >
              {isFullySelected ? 'Deselect All' : 'Select All'}
            </Button>
          )}

          {isTeamMode && !hasChildren && (
            <div className={`d-flex align-items-center gap-2 ${!isSelected ? 'opacity-25' : ''}`}>
              <span className="text-muted small">{areaTeams[node.identifier] || ''}</span>
              <FontAwesomeIcon
                icon={faEllipsisV}
                className={`text-secondary ${isSelected ? 'cursor-pointer' : ''} ms-2`}
                onClick={() => isSelected && onTeamClick?.(node.identifier)}
              />
            </div>
          )}
        </div>
      </div>
      {hasChildren && (
        <Collapse in={expanded} unmountOnExit>
          <div className="ms-2 border-start border-secondary-subtle">
            {childrenLoaded ? (
              node.children!.map((child) => (
                <TreeNode
                  key={child.identifier}
                  node={child}
                  selectedSet={selectedSet}
                  onSelect={onSelect}
                  filter={filter}
                  depth={depth + 1}
                  expandedNodeIds={expandedNodeIds}
                  onToggleExpand={onToggleExpand}
                  inheritedMatch={inheritedMatch || _isMatch}
                  isTeamMode={isTeamMode}
                  areaTeams={areaTeams}
                  onTeamClick={onTeamClick}
                  isDarkMode={isDarkMode}
                />
              ))
            ) : (
              <div className="text-muted small p-2 d-flex align-items-center gap-2">
                <Spinner animation="border" size="sm" variant="primary" style={{ borderWidth: '2px' }} />
                <span>Loading...</span>
              </div>
            )}
          </div>
        </Collapse>
      )}
    </div>
  )
});

const useDebounce = (value: string, delay: number = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
    return () => { clearTimeout(handler); };
  }, [value, delay]);
  return debouncedValue;
};

const AreasSelection: React.FC<Props> = ({ 
  isTeamMode, 
  selectedHierarchy, 
  selectedAreas, 
  onSelectionChange, 
  areaTeams, 
  onAreaTeamChange 
}) => {
  const isDarkMode = useAppSelector((state: any) => state.darkMode.value);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [hierarchyOpen, setHierarchyOpen] = useState(false);
  const displayLabel = useMemo(() => {
    return selectedHierarchy || 'Location Hierarchy';
  }, [selectedHierarchy]);

  const [currentAreas, setCurrentAreas] = useState<AreaNode[]>([]);
  const [expandedNodeIds, setExpandedNodeIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeAreaId, setActiveAreaId] = useState<string | null>(null);

  // Optimized lookup Set
  const selectedSet = useMemo(() => new Set(selectedAreas), [selectedAreas]);

  // Recursively enrich nodes with their leaf IDs, stats, AND search match results
  const enrichedAreas = useMemo(() => {
    const searchLower = debouncedSearchTerm.toLowerCase();
    
    const enrich = (node: AreaNode): any => {
      let leafIds: string[] = [];
      let mappedChildren: any[] = [];
      let hasChildMatch = false;
      let totalCount = 0;
      let selectedCount = 0;
      
      const isMatch = node.properties.name.toLowerCase().includes(searchLower);
      
      if (node.children && node.children.length > 0) {
        for (let i = 0; i < node.children.length; i++) {
          const enrichedChild = enrich(node.children[i]);
          leafIds.push(...enrichedChild._leafIds); 
          mappedChildren.push(enrichedChild);
          totalCount += enrichedChild._stats.total;
          selectedCount += enrichedChild._stats.selected;
          if (enrichedChild._stats._isMatch || enrichedChild._stats._hasChildMatch) {
            hasChildMatch = true;
          }
        }
      } else {
        leafIds = [node.identifier];
        totalCount = 1;
        selectedCount = selectedSet.has(node.identifier) ? 1 : 0;
      }
      
      return {
        ...node,
        children: mappedChildren,
        _leafIds: leafIds,
        _stats: { 
          total: totalCount, 
          selected: selectedCount,
          _isMatch: isMatch,
          _hasChildMatch: hasChildMatch
        }
      };
    };

    return currentAreas.map(enrich);
  }, [currentAreas, selectedSet, debouncedSearchTerm]);

  const toggleNodeExpansion = useCallback((nodeId: string) => {
    setExpandedNodeIds(prev => prev.includes(nodeId) ? prev.filter(id => id !== nodeId) : [...prev, nodeId]);
  }, []);

  const loadData = useCallback(
    () => {
      setIsLoading(true);
      getAssignedAreaTree()
        .then((res: any) => {
          if (res && res.length > 0) {
            setCurrentAreas(res);
          } else {
            setCurrentAreas([]);
          }
          setIsLoading(false);
        })
        .catch(err => {
          toast.error(err.message || 'Error fetching areas');
          setIsLoading(false);
        });
    },
    []
  );



  useEffect(() => {
    loadData();
  }, [loadData]);

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

  const handleSelect = useCallback((id: string, isChecked: boolean) => {
    const node = findNode(enrichedAreas, id);
    if (!node) return;
    
    const leafIds = (node as any)._leafIds;
    const currentSelectedSet = new Set(selectedAreas);
    
    if (isChecked) {
      // O(L) instead of O(L*S)
      const toAdd = leafIds.filter((leafId: string) => !currentSelectedSet.has(leafId));
      if (toAdd.length > 0) {
        onSelectionChange([...selectedAreas, ...toAdd]);
      }
    } else {
      // O(S) instead of O(S*L)
      const toRemoveSet = new Set(leafIds);
      onSelectionChange(selectedAreas.filter(sid => !toRemoveSet.has(sid)));
    }
  }, [enrichedAreas, selectedAreas, findNode, onSelectionChange]);

  const handleTeamClick = useCallback((id: string) => {
    setActiveAreaId(id);
    setShowModal(true);
  }, []);

  const handleTeamSelect = useCallback((team: string) => {
    if (activeAreaId) onAreaTeamChange(activeAreaId, team);
  }, [activeAreaId, onAreaTeamChange]);

  return (
    <div>
      <Card className={`shadow-sm ${isDarkMode ? 'border-white' : ''}`} style={{ background: isDarkMode ? '#212529' : '#f8f9fa' }}>
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
                  style={{ cursor: 'pointer', fontSize: '1rem', color: isDarkMode ? '#fff' : '#000' }}
                >
                  <span className="fw-bold">{displayLabel}</span>
                  <FontAwesomeIcon icon={hierarchyOpen ? faChevronDown : faChevronRight} size="xs" className="text-secondary" />
                </div>
                <Collapse in={hierarchyOpen}>
                  <div>
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
                        <div className="text-muted text-center p-5 d-flex flex-column align-items-center gap-3">
                          <Spinner animation="border" variant="primary" />
                          <span>Loading hierarchy data...</span>
                        </div>
                      ) : (
                        enrichedAreas.map((area: any) => (
                          <TreeNode
                            key={area.identifier}
                            node={area}
                            selectedSet={selectedSet}
                            onSelect={handleSelect}
                            filter={debouncedSearchTerm}
                            depth={0}
                            expandedNodeIds={expandedNodeIds}
                            onToggleExpand={toggleNodeExpansion}
                            isTeamMode={isTeamMode}
                            areaTeams={areaTeams}
                            onTeamClick={handleTeamClick}
                            isDarkMode={isDarkMode}
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
      <SelectTeamModal show={showModal} onHide={() => setShowModal(false)} onSelect={handleTeamSelect} />
    </div>
  );
};

export default React.memo(AreasSelection);
