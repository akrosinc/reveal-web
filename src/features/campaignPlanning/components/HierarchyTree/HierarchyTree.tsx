import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsChevronRight } from 'react-icons/bs';
import { HierarchyNode } from '../../providers/types';
import { findPath } from '../../utils/hierarchyTree';
import styles from './HierarchyTree.module.css';

interface Props {
  nodes: HierarchyNode[];
  selectedId?: string;
  expandAll: boolean;
  onSelect: (node: HierarchyNode) => void;
}

// Parent/child tree like the Simulation page: chevron to open/close, children indented behind a vertical line
const HierarchyTree = ({ nodes, selectedId, expandAll, onSelect }: Props) => {
  const { t } = useTranslation();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const treeRef = useRef<HTMLDivElement>(null);
  const scrolledId = useRef<string>();

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

  // The tree scrolls inside a fixed height, so bring a newly selected row into view (also when picked from the table).
  // Once per selection: its row may only appear after the ancestors open, and later chevron clicks shouldn't jump back.
  useEffect(() => {
    if (!selectedId || scrolledId.current === selectedId) return;
    const row = treeRef.current?.querySelector('[aria-current="true"]');
    if (!row) return;
    row.scrollIntoView({ block: 'nearest' });
    scrolledId.current = selectedId;
  }, [selectedId, expandedIds]);

  const toggle = (id: string, open?: boolean) =>
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (open ?? !next.has(id)) next.add(id);
      else next.delete(id);
      return next;
    });

  // Name: first click selects and expands, clicking the selected node toggles it; chevron only opens/closes
  const clickHandler = (node: HierarchyNode) => {
    const isSelected = node.identifier === selectedId;
    toggle(node.identifier, isSelected ? undefined : true);
    if (!isSelected) onSelect(node);
  };

  const renderNodes = (items: HierarchyNode[]): JSX.Element[] =>
    items.map(node => {
      const hasChildren = !!node.children?.length;
      const isOpen = hasChildren && (expandAll || expandedIds.has(node.identifier));
      return (
        <div key={node.identifier}>
          <div
            className={node.identifier === selectedId ? `${styles.row} ${styles.selected}` : styles.row}
            aria-current={node.identifier === selectedId}
          >
            <button
              type="button"
              className={styles.name}
              title={node.properties.name}
              onClick={() => clickHandler(node)}
            >
              {node.properties.name}
            </button>
            {hasChildren && (
              <button
                type="button"
                className={styles.chevron}
                aria-expanded={isOpen}
                aria-label={t(isOpen ? 'campaignPlanning.collapseArea' : 'campaignPlanning.expandArea', {
                  name: node.properties.name
                })}
                onClick={() => toggle(node.identifier)}
              >
                <BsChevronRight className={isOpen ? styles.open : undefined} />
              </button>
            )}
          </div>
          {isOpen && <div className={styles.children}>{renderNodes(node.children ?? [])}</div>}
        </div>
      );
    });

  return <div ref={treeRef}>{renderNodes(nodes)}</div>;
};

export default HierarchyTree;
