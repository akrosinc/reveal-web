import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from '../Hierarchy.module.css';
import { HierarchyItemProps } from '../Hierarchy';

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

  return (
    <div className={styles.hierarchyItem}>
      <div className={styles.itemHeader} onClick={() => clickHandler(identifier)}>
        <span>{properties.name}</span>
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
