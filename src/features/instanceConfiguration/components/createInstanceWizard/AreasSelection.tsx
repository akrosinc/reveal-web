import React, { useState } from 'react';
import { Card, Form, Collapse } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronDown, faSearch } from '@fortawesome/free-solid-svg-icons';
import { useAppSelector } from '../../../../store/hooks';

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
          { id: 'la1', label: 'LG 1' },
          { id: 'la2', label: 'LG 2' }
        ]
      }
    ]
  }
];

interface Props {
  selectedAreas: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

const TreeNode = ({ node, selectedAreas, onSelect, readOnly, filter }: any) => {
  const [expanded, setExpanded] = useState(true);
  const isDarkMode = useAppSelector((state: any) => state.darkMode.value);

  const isSelected = selectedAreas.includes(node.id);
  const hasChildren = node.children && node.children.length > 0;

  // If readOnly (Selected View), only render if self or descendant is selected
  if (readOnly) {
    const hasSelectedDescendant = (n: any): boolean => {
      if (selectedAreas.includes(n.id)) return true;
      if (n.children) return n.children.some((c: any) => hasSelectedDescendant(c));
      return false;
    };
    if (!selectedAreas.includes(node.id) && !hasSelectedDescendant(node)) {
      return null;
    }
  }

  // Filter logic (for search in Left View)
  // If filter is active, only show if self matches or child matches
  if (!readOnly && filter) {
    const matches = node.label.toLowerCase().includes(filter.toLowerCase());
    const childMatches =
      node.children &&
      node.children.some((c: any) => {
        // crude check, ideally deeply recursive but 'TreeNode' handles recursion.
        // For prop drilling filter, we need to know if we should render THIS node.
        // Simplified: Render if self matches OR if any child renders.
        return JSON.stringify(c).toLowerCase().includes(filter.toLowerCase());
      });
    if (!matches && !childMatches) return null;
  }

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    onSelect(node.id, e.target.checked);
  };

  return (
    <div className="ms-3 mb-1 " style={{ background: isDarkMode ? '#212529' : '' }}>
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
            className="form-check-input"
            type="checkbox"
            id={`${readOnly ? 'ro' : 'edit'}-${node.id}`}
            checked={isSelected}
            onChange={handleCheck}
            disabled={readOnly}
            style={{ cursor: readOnly ? 'default' : 'pointer' }}
          />
          <label
            className="form-check-label"
            htmlFor={`${readOnly ? 'ro' : 'edit'}-${node.id}`}
            style={{ cursor: readOnly ? 'default' : 'pointer', userSelect: 'none' }}
          >
            {node.label}
          </label>
        </div>
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
                readOnly={readOnly}
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

  //#ffffff2c
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
    <div className="d-flex flex-column flex-md-row gap-4">
      {/* Areas Tree */}
      <Card
        className={`flex-fill shadow-sm ${isDarkMode ? 'border-white' : ''}`}
        style={{ background: isDarkMode ? '#212529' : '', minWidth: 300 }}
      // style={{ minWidth: '300px' }}
      >
        <Card.Header className={`${isDarkMode ? 'border-bottom border-white text-white' : 'bg-light'} fw-bold`}>
          All Areas
        </Card.Header>
        <Card.Body className="p-3">
          <div className="mb-3">
            <Form.Select className="mb-2 border-0 bg-white" defaultValue="Niagara">
              <option value="Niagara">Niagara</option>
            </Form.Select>
            <div className="position-relative">
              <Form.Control
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="ps-2"
                style={{ fontSize: '0.9rem' }}
              />
            </div>
          </div>

          <div
            style={{ maxHeight: '400px', overflowY: 'auto', background: isDarkMode ? '#212529' : '#FFF' }}
            className=" rounded p-2"
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

      {/* Selected Areas */}
      <Card
        className={`flex-fill shadow-sm ${isDarkMode ? 'border-white' : ''}`}
        style={{ minWidth: '300px', background: isDarkMode ? '#212529' : '' }}
      >
        <Card.Header className={`${isDarkMode ? 'border-bottom border-white text-white' : 'bg-light'} fw-bold`}>
          Selected Areas
        </Card.Header>
        <Card.Body className="p-3">
          <div style={{ background: isDarkMode ? '#212529' : '#FFF' }} className="mb-3">
            {/* Initial View often mirrors top level unless filtered, mimicking screenshot layout 'Niagara' */}
            <div className="p-2 fw-bold text-secondary">Niagara</div>
          </div>

          <div
            style={{ maxHeight: '435px', overflowY: 'auto', background: isDarkMode ? '#212529' : '' }}
            className="rounded p-2"
          >
            {selectedAreas.length === 0 && <span className="text-muted text-center d-block mt-3">No areas selected</span>}
            {mockAreas.map(area => (
              // In Selected View, we render the tree but filtering out unselected nodes (handled by TreeNode readOnly logic)
              <TreeNode key={area.id} node={area} selectedAreas={selectedAreas} onSelect={() => { }} readOnly={true} />
            ))}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AreasSelection;
