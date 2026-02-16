export interface GroupModel {
    groupName: string;
    team: boolean;
}

export const MOCK_GROUPS: GroupModel[] = [
    {
        groupName: 'Group Boko',
        team: true
    },
    {
        groupName: 'Group Laka',
        team: false
    },
    {
        groupName: 'Group Lagos',
        team: true
    }
];
