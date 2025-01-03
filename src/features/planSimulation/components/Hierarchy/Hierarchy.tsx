import { useMemo, useState } from 'react';
import styles from './Hierarchy.module.css';
import search from '../../../../assets/svgs/search.svg';
import remove from '../../../../assets/svgs/remove.svg';
import HierarchyItem from './HierarchyItem/HierarchyItem';
import { usePolygonContext } from '../../../../contexts/PolygonContext';
export interface HierarchyItemProps {
  identifier: string;
  properties: {
    assigned: false;
    childrenNumber: number;
    geographicLevel: string;
    name: string;
    parentIdentifier: string;
    simulationSearchResult: boolean;
  };
  isOpen?: boolean;
  children?: HierarchyItemProps[];
}

interface HierarchyProps {
  // data: HierarchyItemProps[];
  clickHandler: (id: string) => void;
}

function Hierarchy({ clickHandler }: HierarchyProps) {
  const { state } = usePolygonContext();

  const data = state.polygons;

  const [filteredData, setFilteredData] = useState<HierarchyItemProps[]>(data);

  const [searchTerm, setSearchTerm] = useState('');

  // const toggleExpanded = (id: string) => {
  //   const updateIsOpen = (items: HierarchyItemProps[]): HierarchyItemProps[] => {
  //     return items.map(item => {
  //       if (item.identifier === id) {
  //         return { ...item, isOpen: !item.isOpen };
  //       }
  //       if (item.children) {
  //         return { ...item, children: updateIsOpen(item.children) };
  //       }
  //       return item;
  //     });
  //   };

  //   setFilteredData(prevData => updateIsOpen(prevData));
  // };

  const toggleExpanded = (id: string) => {
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

  useMemo(() => {
    setFilteredData(data);
  }, [data]);

  useMemo(() => {
    if (state.selected?.parentIdentifier) {
      setFilteredData(prevData => {
        const updateData = (items: HierarchyItemProps[]): HierarchyItemProps[] => {
          return items.map(item => {
            if (item.identifier === state.selected?.parentIdentifier) {
              return { ...item, isOpen: true };
            }
            if (item.children) {
              return { ...item, children: updateData(item.children) };
            }
            return item;
          });
        };

        return updateData(prevData);
      });
    }
  }, [state.selected?.parentIdentifier]);

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
      setFilteredData(data.map((item: any) => ({ ...item, isOpen: false }))); // Collapse all items
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
