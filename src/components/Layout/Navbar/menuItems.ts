import { HOME_PAGE, PLANS, MANAGEMENT } from "../../../constants";

export const MAIN_MENU = [
    {
      pageTitle: "Home",
      route: HOME_PAGE,
      roles: []
    },
    {
      pageTitle: "Plan",
      route: "#",
      roles: ["plan_view"],
      dropdown: [
        {
          pageTitle: "Manage Plans",
          route: PLANS,
          roles: []
        },
        {
          pageTitle: "Planning tools",
          route: "",
          roles: []
        },
      ],
    },
    {
      pageTitle: "Assign",
      route: "#",
      roles: []
    },
    {
      pageTitle: "Monitor",
      route: "#",
      roles: [],
      dropdown: [
        {
          pageTitle: "IRS Reporting",
          route: "#",
          roles: []
        },
        {
          pageTitle: "SMC Reporting",
          route: "#",
          roles: []
        },
      ],
    },
    {
      pageTitle: "Admin",
      route: "/admin",
      roles: ["manage-users"],
      dropdown: [
        {
          pageTitle: "Management",
          route: MANAGEMENT,
          roles: ["manage-users"]
        },
      ],
    }
  ];