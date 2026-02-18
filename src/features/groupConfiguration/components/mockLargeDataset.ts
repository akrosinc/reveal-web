// Mock large dataset generator for testing lazy loading
export interface AreaNode {
    id: string;
    label: string;
    children?: AreaNode[];
}

// Generate large mock dataset for testing
export const generateLargeDataset = (
    numParents: number = 100,
    minChildren: number = 5,
    maxChildren: number = 20
): AreaNode[] => {
    const areas: AreaNode[] = [];

    for (let i = 1; i <= numParents; i++) {
        const numChildren = Math.floor(Math.random() * (maxChildren - minChildren + 1)) + minChildren;
        const children: AreaNode[] = [];

        for (let j = 1; j <= numChildren; j++) {
            children.push({
                id: `area-${i}-child-${j}`,
                label: `Zone ${i}-${j}`
            });
        }

        areas.push({
            id: `area-${i}`,
            label: `Region ${i}`,
            children
        });
    }

    return areas;
};

// Small dataset for normal use
export const smallDataset: AreaNode[] = [
    {
        id: 'boko',
        label: 'Boko',
        children: [
            { id: 'ph1', label: 'PH 1' },
            { id: 'ph2', label: 'PH 2' },
            { id: 'ph3', label: 'PH 3' },
            { id: 'ph4', label: 'PH 4' }
        ]
    },
    {
        id: 'laka',
        label: 'Laka',
        children: [
            { id: 'lg1', label: 'LG 1' },
            { id: 'lg2', label: 'LG 2' }
        ]
    }
];

// Dataset by hierarchy (for dropdown selection)
export const datasetsByHierarchy: Record<string, AreaNode[]> = {
    'Niagara': smallDataset,
    'Ontario': [
        {
            id: 'toronto',
            label: 'Toronto',
            children: [
                { id: 'dt1', label: 'Downtown 1' },
                { id: 'dt2', label: 'Downtown 2' },
                { id: 'dt3', label: 'Downtown 3' }
            ]
        },
        {
            id: 'ottawa',
            label: 'Ottawa',
            children: [
                { id: 'ot1', label: 'Central 1' },
                { id: 'ot2', label: 'Central 2' }
            ]
        }
    ],
    'Quebec': [
        {
            id: 'montreal',
            label: 'Montreal',
            children: [
                { id: 'mt1', label: 'District 1' },
                { id: 'mt2', label: 'District 2' },
                { id: 'mt3', label: 'District 3' },
                { id: 'mt4', label: 'District 4' }
            ]
        }
    ],
    'Large Test Dataset': generateLargeDataset(100, 10, 30)
};

export const hierarchyOptions = Object.keys(datasetsByHierarchy);
