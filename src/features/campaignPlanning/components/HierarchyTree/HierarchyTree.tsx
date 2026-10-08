import { Fragment, useEffect, useState } from 'react';
import { TREE_INDENT } from '../../constants';
import { HierarchyNode } from '../../providers/types';
import { findPath } from '../../utils/hierarchyTree';
import styles from './HierarchyTree.module.css';

interface Props {
  nodes: HierarchyNode[];
  selectedId?: string;
  expandAll: boolean;
  onSelect: (node: HierarchyNode) => void;
}

const HierarchyTree = ({ nodes, selectedId, expandAll, onSelect }: Props) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Selection can come from outside the tree (bottom table), so open its ancestors to keep it visible
  useEffect(() => {
    if (!selectedId) return;
    const ancestorIds = findPath(nodes, selectedId)
      .slice(0, -1)
      .map(node => node.identifier);
    setExpandedIds(prev =>
      ancestorIds.every(id => prev.has(id)) ? prev : new Set(Array.from(prev).concat(ancestorIds))
    );
  }, [selectedId, nodes]);

  // First click selects and expands; clicking the selected node toggles it
  const clickHandler = (node: HierarchyNode) => {
    const isSelected = node.identifier === selectedId;
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (isSelected && next.has(node.identifier)) next.delete(node.identifier);
      else next.add(node.identifier);
      return next;
    });
    if (!isSelected) onSelect(node);
  };

  const renderNodes = (items: HierarchyNode[], depth: number): JSX.Element[] =>
    items.map(node => (
      <Fragment key={node.identifier}>
        <button
          type="button"
          className={node.identifier === selectedId ? `${styles.node} ${styles.selected}` : styles.node}
          style={{ paddingLeft: depth * TREE_INDENT }}
          title={node.properties.name}
          onClick={() => clickHandler(node)}
        >
          {node.properties.name}
        </button>
        {(expandAll || expandedIds.has(node.identifier)) && node.children && renderNodes(node.children, depth + 1)}
      </Fragment>
    ));

  return <div>{renderNodes(nodes, 0)}</div>;
};

export default HierarchyTree;
