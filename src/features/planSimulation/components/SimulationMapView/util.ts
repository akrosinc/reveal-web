// finds ids of all the levels of provided node list, except the ones with geoLevel = structure
export const  getIdsByGeographicLevel = (nodes: any[] | undefined): string[] => {
    if (!Array.isArray(nodes)) return [];
    return nodes.reduce<string[]>((ids, node) => {
      if (node.properties?.geographicLevel !== "structure") {
        ids.push(node.identifier);
      }
      return ids.concat(getIdsByGeographicLevel(node.children ?? []));
    }, []);
  }

  export const findNodeById = (nodes: any[] | undefined, targetId: string): any | undefined => {
    if (!Array.isArray(nodes)) return undefined;
    for (const node of nodes) {
      if (node.identifier === targetId) return node;
      const found = findNodeById(node.children, targetId);
      if (found) return found;
    }
    return undefined;
  }