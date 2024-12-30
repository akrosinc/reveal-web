import { useEffect, useState } from 'react';
import styles from './Hierarchy.module.css';
import search from '../../../../assets/svgs/search.svg';
import remove from '../../../../assets/svgs/remove.svg';
import HierarchyItem from './HierarchyItem/HierarchyItem';
import useSelectedPolygons from '../../../../hooks/useSelectedPolygons';

export interface HierarchyItemProps {
  identifier: string;
  properties: { name: string };
  isOpen?: boolean;
  children?: HierarchyItemProps[];
}

interface HierarchyProps {
  data: HierarchyItemProps[];
  clickHandler: (id: string) => void;
}

function Hierarchy({ data, clickHandler }: HierarchyProps) {
  const [filteredData, setFilteredData] = useState<HierarchyItemProps[]>(data);
  const [searchTerm, setSearchTerm] = useState('');

  const { selectedPolygons, setSelectedPolygons } = useSelectedPolygons();

  // REAFCTOR: Use useEffect to handle selectedPolygons
  useEffect(() => {
    console.log('selectedPolygons', selectedPolygons);

    if (selectedPolygons && selectedPolygons.externalId) {
      toggleExpanded(selectedPolygons.externalId);
      // handleSearch(selectedPolygons.name);
    }
  }, [selectedPolygons]);

  const toggleExpanded = (id: string) => {
    if (selectedPolygons) {
      console.log(id);
    }

    const updateIsOpen = (items: HierarchyItemProps[]): HierarchyItemProps[] => {
      return items.map(item => {
        if (item.identifier === id) {
          return { ...item, isOpen: !item.isOpen };
        }
        if (item.children) {
          return { ...item, children: updateIsOpen(item.children) };
        }
        return item;
      });
    };

    setFilteredData(prevData => updateIsOpen(prevData));
  };

  const filterData = (items: HierarchyItemProps[], term: string): HierarchyItemProps[] => {
    return items
      .map(item => {
        const itemName = item.properties.name.toLowerCase();
        const searchTerm = term.toLowerCase();

        // Check if the item matches the search term
        if (itemName.startsWith(searchTerm)) {
          return {
            ...item,
            isOpen: true, // Expand this item
            children: item.children ? filterData(item.children, term) : undefined
          };
        }

        // Check if any children match the search term
        if (item.children) {
          const filteredChildren = filterData(item.children, term);
          if (filteredChildren.length > 0) {
            return {
              ...item,
              isOpen: true, // Expand this item since a child matches
              children: filteredChildren
            };
          }
        }

        return null;
      })
      .filter(Boolean) as HierarchyItemProps[];
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term === '') {
      setFilteredData(data.map(item => ({ ...item, isOpen: false }))); // Collapse all items
    } else {
      setFilteredData(filterData(data, term));
    }
  };

  return (
    <div className={styles.hierarchy}>
      <div className={styles.search}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={e => handleSearch(e.target.value)}
        />
        <div className={styles.searchBarWrapper}>
          {searchTerm.length > 0 ? (
            <img src={remove} alt="Remove" className={styles.removeButton} onClick={() => handleSearch('')} />
          ) : (
            <img src={search} alt="Search" />
          )}
        </div>
      </div>
      {filteredData.map(item => (
        <HierarchyItem key={item.identifier} item={item} toggleExpanded={toggleExpanded} clickHandler={clickHandler} />
      ))}
    </div>
  );
}

export default Hierarchy;
