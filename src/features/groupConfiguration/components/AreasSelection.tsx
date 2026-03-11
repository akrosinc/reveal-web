import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Card, Form, Collapse, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronDown, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { useAppSelector } from '../../../store/hooks';
import { datasetsByHierarchy, AreaNode } from './mockLargeDataset';
import { getLocationHierarchyList, getLocationListByHierarchyId } from '../../location/api';
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
  selectedAreas: string[];
  onSelect: (id: string, checked: boolean) => void;
  filter: string;
  depth?: number;
  expandedNodeIds: string[];
  onToggleExpand: (nodeId: string) => void;
  inheritedMatch?: boolean;
  isTeamMode?: boolean;
  areaTeams?: Record<string, string>;
  onTeamClick?: (id: string) => void;
}

const TreeNode = React.memo<TreeNodeProps>(({ 
  node, 
  selectedAreas, 
  onSelect, 
  filter, 
  depth = 0, 
  expandedNodeIds, 
  onToggleExpand, 
  inheritedMatch = false ,
  isTeamMode = false,
  areaTeams = {},
  onTeamClick
}) => {
  const [childrenLoaded, setChildrenLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(depth === 0);
  const isDarkMode = useAppSelector((state: any) => state.darkMode.value);
  const checkboxRef = useRef<HTMLInputElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  const isSelected = selectedAreas.includes(node.identifier);
  const hasChildren = !!(node.children && node.children.length > 0);

  const isExpandedByFilter = !!(filter && (inheritedMatch || node.properties.name.toLowerCase().includes(filter.toLowerCase()) || (hasChildren && node.children?.some(c => JSON.stringify(c).toLowerCase().includes(filter.toLowerCase())))));
  const expanded = isExpandedByFilter || expandedNodeIds.includes(node.identifier);

  useEffect(() => {
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

  useEffect(() => {
    if ((expanded || filter) && hasChildren && !childrenLoaded) {
      setTimeout(() => {
        setChildrenLoaded(true);
      }, 0);
    }
  }, [expanded, filter, hasChildren, childrenLoaded]);

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

  const getDescendantSelectionState = useCallback((n: AreaNode): { total: number; selected: number } => {
    const leaves = getLeafIds(n);
    const total = leaves.length;
    const selectedCount = leaves.filter(id => selectedAreas.includes(id)).length;
    return { total, selected: selectedCount };
  }, [selectedAreas, getLeafIds]);

  const { total, selected } = getDescendantSelectionState(node);
  const isFullySelected = !!(hasChildren && total > 0 && selected === total);
  const indeterminate = !!(hasChildren && selected > 0 && selected < total);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  });

  const parentMatches = node.properties.name.toLowerCase().includes(filter.toLowerCase());
  if (filter && !inheritedMatch && !parentMatches) {
    const anyChildMatches = node.children && node.children.some(c => JSON.stringify(c).toLowerCase().includes(filter.toLowerCase()));
    if (!anyChildMatches) return null;
  }

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand(node.identifier);
  };

  const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelect(node.identifier, e.target.checked);
  };

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
                  expandedNodeIds={expandedNodeIds}
                  onToggleExpand={onToggleExpand}
                  inheritedMatch={inheritedMatch || parentMatches}
                  isTeamMode={isTeamMode}
                  areaTeams={areaTeams}
                  onTeamClick={onTeamClick}
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
  const displayHierarchy = selectedHierarchy || 'Niagara';
  const [currentAreas, setCurrentAreas] = useState<AreaNode[]>(datasetsByHierarchy[displayHierarchy] || []);
  const [expandedNodeIds, setExpandedNodeIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeAreaId, setActiveAreaId] = useState<string | null>(null);

  const toggleNodeExpansion = useCallback((nodeId: string) => {
    setExpandedNodeIds(prev => prev.includes(nodeId) ? prev.filter(id => id !== nodeId) : [...prev, nodeId]);
  }, []);

  const loadData = useCallback(
    (size: number, page: number, searchData?: string, sortField?: string, sortDirection?: boolean) => {
      setIsLoading(true);
      getLocationHierarchyList(0, 0, true)
        .then((res: any) => {
          if (res.content && res.content.length > 0) {
            const hierarchyId = res.content[0].identifier;
            getLocationListByHierarchyId(size, page, hierarchyId!, true, searchData, sortField, sortDirection)
              .then((locRes: any) => {
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

  useEffect(() => {
    if (displayHierarchy === 'Global' || displayHierarchy === 'f470addc-9251-46a5-8e1e-45ba45082da4'){
      loadData(10, 0);
    } else {
      setCurrentAreas(datasetsByHierarchy[displayHierarchy] || []);
    }
  }, [displayHierarchy, loadData]);

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
    const node = findNode(currentAreas, id);
    if (!node) return;
    const leafIds = getAllLeafIds(node);
    let newSelected = [...selectedAreas];
    if (isChecked) {
      leafIds.forEach(leafId => {
        if (!newSelected.includes(leafId)) newSelected.push(leafId);
      });
    } else {
      newSelected = newSelected.filter(sid => !leafIds.includes(sid));
    }
    onSelectionChange(newSelected);
  }, [currentAreas, selectedAreas, findNode, getAllLeafIds, onSelectionChange]);

  const handleTeamClick = (id: string) => {
    setActiveAreaId(id);
    setShowModal(true);
  };

  const handleTeamSelect = (team: string) => {
    if (activeAreaId) onAreaTeamChange(activeAreaId, team);
  };

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
                  <span className="fw-bold">{displayHierarchy}</span>
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
                          <small className="text-muted d-block mt-1">Searching...</small>
                        )}
                      </div>
                    </div>

                    <div
                      style={{ maxHeight: '400px', overflowY: 'auto', background: isDarkMode ? '#212529' : '#FFF' }}
                      className="rounded p-2 area-selection-tree"
                    >
                      {isLoading ? (
                        <div className="text-muted text-center p-3">Loading global data...</div>
                      ) : (
                        currentAreas.map((area: any) => (
                          <TreeNode
                            key={area.identifier}
                            node={area}
                            selectedAreas={selectedAreas}
                            onSelect={handleSelect}
                            filter={debouncedSearchTerm}
                            depth={0}
                            expandedNodeIds={expandedNodeIds}
                            onToggleExpand={toggleNodeExpansion}
                            isTeamMode={isTeamMode}
                            areaTeams={areaTeams}
                            onTeamClick={handleTeamClick}
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

export default AreasSelection;
