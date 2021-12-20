import { HOME_PAGE, PLANS, USER_MANAGEMENT } from "../../../constants";

export const MAIN_MENU = [
    {
      pageTitle: "Home",
      route: HOME_PAGE,
    },
    {
      pageTitle: "Plan",
      route: "#",
      dropdown: [
        {
          pageTitle: "Manage Plans",
          route: PLANS,
        },
        {
          pageTitle: "Planning tools",
          route: "",
        },
      ],
    },
    {
      pageTitle: "Assign",
      route: "#",
    },
    {
      pageTitle: "Monitor",
      route: "#",
      dropdown: [
        {
          pageTitle: "IRS Reporting",
          route: "#",
        },
        {
          pageTitle: "SMC Reporting",
          route: "#",
        },
      ],
    },
    {
      pageTitle: "Admin",
      route: "/admin",
      dropdown: [
        {
          pageTitle: "User Management",
          route: USER_MANAGEMENT,
        },
      ],
    }
  ];