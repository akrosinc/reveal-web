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

// Hardcoded N-level test set
export const deepDataset: AreaNode[] = [
    {
        identifier: 'lvl1-a',
        properties: { name: 'Level 1 - Alpha' },
        children: [
            {
                identifier: 'lvl2-a',
                properties: { name: 'Level 2 - Alpha' },
                children: [
                    {
                        identifier: 'lvl3-a',
                        properties: { name: 'Level 3 - Alpha' },
                        children: [
                            {
                                identifier: 'lvl4-a',
                                properties: { name: 'Level 4 - Alpha' },
                                children: [
                                    { identifier: 'lvl5-a-1', properties: { name: 'Level 5 - Leaf 1' } },
                                    { identifier: 'lvl5-a-2', properties: { name: 'Level 5 - Leaf 2' } }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }
];

// Nigeria Dataset from snippet
export const nigeriaDataset: AreaNode[] = [
    {
        identifier: "e933eee2-f47b-491f-a417-7184d0afb978",
        properties: {
            name: "Akuku Toru",
            geographicLevel: "admin2",
            assigned: false,
            parentIdentifier: "00000000-0000-0000-0000-000000000000",
            childrenNumber: 0,
            simulationSearchResult: false
        },
        children: [
            {
                identifier: "da6eeeb7-5b74-4313-a74b-a3465f1125d7",
                properties: {
                    name: "Aktward 1",
                    geographicLevel: "admin3",
                    assigned: false,
                    parentIdentifier: "e933eee2-f47b-491f-a417-7184d0afb978",
                    childrenNumber: 0,
                    simulationSearchResult: false
                },
                children: []
            },
            {
                identifier: "b07fa3b9-2359-4cdd-860a-3fdd8f9fea9f",
                properties: {
                    name: "Aktward 3",
                    geographicLevel: "admin3",
                    assigned: false,
                    parentIdentifier: "e933eee2-f47b-491f-a417-7184d0afb978",
                    childrenNumber: 0,
                    simulationSearchResult: false
                },
                children: []
            }
        ]
    },
    {
        identifier: "627e0983-a64b-4db4-877f-d3b3ed0c3c21",
        properties: {
            name: "Nigeria",
            geographicLevel: "admin0",
            assigned: false,
            parentIdentifier: "00000000-0000-0000-0000-000000000000",
            childrenNumber: 0,
            simulationSearchResult: false
        },
        children: [
            {
                identifier: "b5f6b41c-918f-4316-bb21-4491da03de74",
                properties: {
                    name: "Fct",
                    geographicLevel: "admin1",
                    assigned: false,
                    parentIdentifier: "627e0983-a64b-4db4-877f-d3b3ed0c3c21",
                    childrenNumber: 0,
                    simulationSearchResult: false
                },
                children: [
                    {
                        identifier: "60618440-a441-4f03-bc91-6206f526165d",
                        properties: {
                            name: "Abaji",
                            geographicLevel: "admin2",
                            assigned: false,
                            parentIdentifier: "b5f6b41c-918f-4316-bb21-4491da03de74",
                            childrenNumber: 0,
                            simulationSearchResult: false
                        },
                        children: [
                            {
                                identifier: "06f93cfe-a45d-4014-acba-095ecd0ac4f9",
                                properties: {
                                    name: "Gawu",
                                    geographicLevel: "admin3",
                                    assigned: false,
                                    parentIdentifier: "60618440-a441-4f03-bc91-6206f526165d",
                                    childrenNumber: 0,
                                    simulationSearchResult: false
                                },
                                children: []
                            }
                        ]
                    }
                ]
            }
        ]
    }
];

// Small dataset for normal use
export const smallDataset: AreaNode[] = [
    {
        identifier: 'boko',
        properties: { name: 'Boko' },
        children: [
            { identifier: 'ph1', properties: { name: 'PH 1' } },
            { identifier: 'ph2', properties: { name: 'PH 2' } }
        ]
    }
];

// Dataset by hierarchy (for dropdown selection)
export const datasetsByHierarchy: Record<string, AreaNode[]> = {
    'Global': [],
    'Niagara': smallDataset,
    'Nigeria (New Format)': nigeriaDataset,
    'Ontario': [
        {
            identifier: 'toronto',
            properties: { name: 'Toronto' },
            children: [
                { identifier: 'dt1', properties: { name: 'Downtown 1' } }
            ]
        }
    ],
    'Hardcoded 5-Level Deep': deepDataset,
    'Large Random N-Level': generateLargeDataset(5, 2, 4, 5)
};

export const hierarchyOptions = Object.keys(datasetsByHierarchy);
