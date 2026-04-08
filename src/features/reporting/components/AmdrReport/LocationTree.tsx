import { Collapse, Form } from "react-bootstrap";
import {LocationNode} from "../../../AmdrImport/type";
import {Option} from "./types";
import {useMemo} from "react";

interface LocationTreeProps {
  nodes: LocationNode[];
  selectedLocations: string[];
  onToggle: (id: string) => void;
  expandedNodes: Record<string, boolean>;
  toggleNode: (id: string) => void;
  geoLevels:Option[];
  geoLevel:Option | null;
}

const LocationTree: React.FC<LocationTreeProps> = ({
                                                     nodes,
                                                     selectedLocations,
                                                     onToggle,
                                                     expandedNodes,
                                                     toggleNode,
                                                     geoLevels,
                                                     geoLevel
                                                   }) => {

  const countAllChildren = (node: LocationNode): number => {
    if (!node.children || node.children.length === 0) return 0;
    return node.children.length + node.children.reduce((sum, c) => sum + countAllChildren(c), 0);
  };

// Count all selected descendants recursively
  const countSelectedChildren = (node: LocationNode, selectedIds: string[]): number => {
    if (!node.children || node.children.length === 0) return 0;
    return node.children.reduce(
        (sum, c) =>
            sum +
            (selectedIds.includes(c.id) ? 1 : 0) +
            countSelectedChildren(c, selectedIds),
        0
    );
  };

  const allowedLevels = useMemo(() => {
    if (!geoLevel) return geoLevels.map(g => g.value);

    const selectedIndex = geoLevels.findIndex(g => g.value === geoLevel.value);

    return geoLevels
    .slice(0, selectedIndex + 1)
    .map(g => g.value);
  }, [geoLevels, geoLevel]);

  const filterTree = (nodes: LocationNode[]): LocationNode[] => {
    return nodes
    .map(node => {
      // Filter children first
      const filteredChildren = node.children
          ? filterTree(node.children)
          : [];

      // Keep node if:
      // - its level is allowed
      // OR
      // - it has children that are allowed (to preserve structure)
      if (
          allowedLevels.includes(node.geoLevel) ||
          filteredChildren.length > 0
      ) {
        return {
          ...node,
          children: filteredChildren
        };
      }

      return null;
    })
    .filter(Boolean) as LocationNode[];
  };

  const selectableLevel = geoLevel?.value;

  return (
      <div className="ms-2">
        {nodes.map((node) => {
          const hasChildren = node.children && node.children.length > 0;
          const isChecked = selectedLocations.includes(node.id);
          const isOpen = expandedNodes[node.id] || false;

          return (
              <div key={node.id}>
                <div className="d-flex align-items-center gap-2">
                  {hasChildren ? (
                      <button
                          type="button"
                          className="btn btn-sm btn-light p-0"
                          onClick={() => toggleNode(node.id)}
                          style={{ width: 20, height: 20 }}
                      >
                        {isOpen ? "−" : "+"}
                      </button>
                  ) : (
                      <span style={{ width: 20 }}></span>
                  )}

                  <Form.Check
                      className={node.geoLevel !== selectableLevel ? "text-muted" : ""}
                      type="checkbox"
                      label={
                        <span>
      {node.name}
                          {hasChildren && (
                              <small className="text-muted ms-2">
                                ({countSelectedChildren(node, selectedLocations)}/
                                {countAllChildren(node)})
                              </small>
                          )}
    </span>
                      }
                      checked={
                        selectableLevel === node.geoLevel
                            ? selectedLocations.includes(node.id)
                            : false
                      }
                      disabled={node.geoLevel !== selectableLevel}
                      onChange={() => onToggle(node.id)}
                  />
                </div>

                {hasChildren && isOpen && (
                    <LocationTree
                        nodes={node.children!}
                        selectedLocations={selectedLocations}
                        onToggle={onToggle}
                        expandedNodes={expandedNodes}
                        toggleNode={toggleNode}
                        geoLevels={geoLevels}
                        geoLevel={geoLevel}
                    />
                )}
              </div>
          );
        })}
      </div>
  );
};
export default LocationTree;
