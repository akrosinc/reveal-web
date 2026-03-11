// Mock large dataset generator for testing lazy loading
export interface AreaNode {
    identifier: string;
    properties: {
        name: string;
        geographicLevel?: string;
        assigned?: boolean;
        parentIdentifier?: string;
        childrenNumber?: number;
        simulationSearchResult?: boolean;
    };
    children?: AreaNode[];
}

// Helper function for N-level deep mock dataset generation
const generateDeepChildren = (
    prefix: string,
    currentDepth: number,
    maxDepth: number,
    minChildren: number,
    maxChildren: number
): AreaNode[] => {
    if (currentDepth >= maxDepth) return [];

    const numChildren = Math.floor(Math.random() * (maxChildren - minChildren + 1)) + minChildren;
    const children: AreaNode[] = [];

    for (let j = 1; j <= numChildren; j++) {
        const identifier = `${prefix}-${j}`;
        const node: AreaNode = {
            identifier,
            properties: {
                name: `Zone ${identifier}`
            }
        };
        const nextChildren = generateDeepChildren(identifier, currentDepth + 1, maxDepth, minChildren, maxChildren);
        if (nextChildren.length > 0) {
            node.children = nextChildren;
        }
        children.push(node);
    }
    return children;
};

// Generate large N-level deep mock dataset for testing
export const generateLargeDataset = (
    numParents: number = 10,
    minChildren: number = 2,
    maxChildren: number = 5,
    maxDepth: number = 5
): AreaNode[] => {
    const areas: AreaNode[] = [];

    for (let i = 1; i <= numParents; i++) {
        const identifier = `area-${i}`;
        const children = generateDeepChildren(identifier, 1, maxDepth, minChildren, maxChildren);
        
        areas.push({
            identifier,
            properties: {
                name: `Region ${i}`
            },
            children: children.length > 0 ? children : undefined
        });
    }

    return areas;
};

// Small dataset for normal use
export const smallDataset: AreaNode[] = [
    {
        identifier: 'boko',
        properties: { name: 'Boko' },
        children: [
            { identifier: 'ph1', properties: { name: 'PH 1' } },
            { identifier: 'ph2', properties: { name: 'PH 2' } },
            { identifier: 'ph3', properties: { name: 'PH 3' } },
            { identifier: 'ph4', properties: { name: 'PH 4' } }
        ]
    },
    {
        identifier: 'laka',
        properties: { name: 'Laka' },
        children: [
            { identifier: 'lg1', properties: { name: 'LG 1' } },
            { identifier: 'lg2', properties: { name: 'LG 2' } }
        ]
    }
];

// Dataset by hierarchy (for dropdown selection)
export const datasetsByHierarchy: Record<string, AreaNode[]> = {
    'Niagara': smallDataset,
    'Ontario': [
        {
            identifier: 'toronto',
            properties: { name: 'Toronto' },
            children: [
                { identifier: 'dt1', properties: { name: 'Downtown 1' } },
                { identifier: 'dt2', properties: { name: 'Downtown 2' } },
                { identifier: 'dt3', properties: { name: 'Downtown 3' } }
            ]
        },
        {
            identifier: 'ottawa',
            properties: { name: 'Ottawa' },
            children: [
                { identifier: 'ot1', properties: { name: 'Central 1' } },
                { identifier: 'ot2', properties: { name: 'Central 2' } }
            ]
        }
    ],
    'Large Test Dataset': generateLargeDataset(100, 10, 30)
};

export const hierarchyOptions = Object.keys(datasetsByHierarchy);
