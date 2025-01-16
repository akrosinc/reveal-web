import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from '../Hierarchy.module.css';
import { HierarchyItemProps } from '../Hierarchy';
import itemStyle from './HierarchyItem.module.css';

// CONTEXT
import { usePolygonContext } from '../../../../../contexts/PolygonContext';
import { useMemo, useRef, useState } from 'react';

const HierarchyItem = ({
  item,
  toggleExpanded,
  clickHandler
}: {
  item: HierarchyItemProps;
  toggleExpanded: (id: string) => void;
  clickHandler: (id: string) => void;
}) => {
  const { isOpen, children, properties, identifier } = item;
  const { state, dispatch } = usePolygonContext();
  const itemRef = useRef<HTMLDivElement | null>(null);

  const singleSelect = state.selected;

  const [selectedState, setSelectedState] = useState(singleSelect);

  useMemo(() => {
    setSelectedState(singleSelect);
  }, [singleSelect]);

  if (selectedState?.externalId === identifier && itemRef.current) {
    itemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  return (
    <div ref={itemRef} className={styles.hierarchyItem}>
      <div
        className={`${styles.itemHeader} ${isOpen && itemStyle.selected} ${
          selectedState?.externalId === identifier && itemStyle.selected
        }`}
        onClick={() => {
          clickHandler(identifier);
          dispatch({
            type: 'SELECT_SINGLE',
            payload: {
              properties: {
                assigned: false,
                childrenNumber: properties.childrenNumber,
                externalId: identifier,
                geographicLevel: '',
                name: properties.name,
                parentIdentifier: properties.parentIdentifier,
                simulationSearchResult: false,
                status: ''
              }
            }
          });
        }}
      >
        <span>{properties.name}</span>
        {selectedState?.externalId === identifier && <s></s>}
        {children && children.length > 0 && (
          <div
            onClick={e => {
              e.stopPropagation();
              toggleExpanded(identifier);
            }}
            className={styles.expandButton}
          >
            <FontAwesomeIcon className={styles.icon} icon={isOpen ? 'chevron-down' : 'chevron-right'} />
          </div>
        )}
      </div>
      {isOpen && children && (
        <div className={styles.children}>
          {children.map(child => (
            <HierarchyItem
              key={child.identifier}
              item={child}
              toggleExpanded={toggleExpanded}
              clickHandler={clickHandler}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HierarchyItem;
