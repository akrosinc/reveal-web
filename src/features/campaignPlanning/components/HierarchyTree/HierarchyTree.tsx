import { memo, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsChevronRight, BsGeoAlt, BsPentagon } from 'react-icons/bs';
import { HierarchyNode, Site } from '../../providers/types';
import { findPath } from '../../utils/hierarchyTree';
import styles from './HierarchyTree.module.css';

interface Props {
  nodes: HierarchyNode[];
  selectedId?: string;
  expandAll: boolean;
  sitesByArea: Record<string, Site[]>;
  selectedSiteId?: string;
  onSelect: (node: HierarchyNode) => void;
  onSiteSelect: (node: HierarchyNode, site: Site) => void;
}

const NO_SITES: Site[] = [];

// Parent/child tree like the Simulation page: chevron to open/close, children indented behind a vertical line
const HierarchyTree = ({
  nodes,
  selectedId,
  expandAll,
  sitesByArea,
  selectedSiteId,
  onSelect,
  onSiteSelect
}: Props) => {
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
      const sites = sitesByArea[node.identifier] ?? NO_SITES;
      const hasChildren = !!node.children?.length || !!sites.length;
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
          {isOpen && (
            <div className={styles.children}>
              {renderNodes(node.children ?? [])}
              {sites.map(site => (
                <button
                  key={site.identifier}
                  type="button"
                  className={site.identifier === selectedSiteId ? `${styles.site} ${styles.siteSelected}` : styles.site}
                  title={site.name}
                  aria-pressed={site.identifier === selectedSiteId}
                  onClick={() => onSiteSelect(node, site)}
                >
                  {site.geometry === 'polygon' ? (
                    <BsPentagon className={styles.siteIcon} />
                  ) : (
                    <BsGeoAlt className={styles.siteIcon} />
                  )}
                  <span className={styles.siteName}>{site.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      );
    });

  return <div ref={treeRef}>{renderNodes(nodes)}</div>;
};

// Memoised: the left panel re-renders on every filter change, the tree only when its own props change
export default memo(HierarchyTree);
