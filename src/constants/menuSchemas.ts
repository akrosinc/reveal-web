import { INSTANE_MANAGEMENT_VIEW, LOCATION_VIEW, MENU_HOME_VIEW, REPORT_VIEW, REVEAL_SIMULATION, ROLE_MANAGE_USER, TAG_MANAGEMENT, METADATA_IMPORT_VIEW, GROUP_MANAGEMENT_VIEW, CAMPAIGN_MANAGEMENT, ASSIGNMENT_PLAN, REVEAL_SIMULATION_USER } from "../constants";

// superadmin
export const SUPERADMIN_MENU = [
    {
        name: "Home",
        key: MENU_HOME_VIEW,
    },
    {
        name: "Instance",
        children: [
            { name: "Data Viewer", key: REVEAL_SIMULATION },
            { name: "Instance Management", key: INSTANE_MANAGEMENT_VIEW },
        ],
    },
    {
        name: "Reporting",
        children: [
            { name: "Plan Reporting", key: REPORT_VIEW },
            { name: "Performance Reporting", key: REPORT_VIEW },
            { name: "Survey Reporting", key: REPORT_VIEW },
        ],
    },
    {
        name: "Admin",
        children: [
            { name: "User Management", key: ROLE_MANAGE_USER },
            { name: "Location Management", key: LOCATION_VIEW },
            { name: "Tag Management", key: TAG_MANAGEMENT },
            { name: "Metadata Import", key: METADATA_IMPORT_VIEW },
        ],
    },
];

// standard user (admin)
export const STANDARD_ADMIN_MENU = [
    {
        name: "Home",
        key: MENU_HOME_VIEW,
    },
    {
        name: "Plan",
        children: [
            { name: "Campaign Management", key: CAMPAIGN_MANAGEMENT },
            { name: "Assignment", key: ASSIGNMENT_PLAN },
        ],
    },
    {
        name: "Group",
        children: [
            { name: "Group Management", key: GROUP_MANAGEMENT_VIEW },
        ],
    },
    {
        name: "Reporting",
        children: [
            { name: "Plan Reporting", key: REPORT_VIEW },
            { name: "Performance Reporting", key: REPORT_VIEW },
            { name: "Survey Reporting", key: REPORT_VIEW },
        ],
    },
    {
        name: "Admin",
        children: [
            {
                name: "User Management",
                key: ROLE_MANAGE_USER,
                note: "Use group dropdown instead of role tabs",
            },
        ],
    },
];

//standard user (normal user)
export const STANDARD_USER_MENU = [
    {
        name: "Plan",
        children: [
            { name: "Simulations", key: REVEAL_SIMULATION_USER },
        ],
    },
];