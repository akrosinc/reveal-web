import { HOME_PAGE } from "../../../constants";
import { USER_MANAGEMENT } from "../../../constants";

export const MAIN_MENU = [
    {
      pageTitle: "Home",
      route: HOME_PAGE,
    },
    {
      pageTitle: "Plan",
      route: "/plan",
      dropdown: [
        {
          pageTitle: "Manage Plans",
          route: "",
        },
        {
          pageTitle: "Planning tools",
          route: "",
        },
      ],
    },
    {
      pageTitle: "Assign",
      route: "",
    },
    {
      pageTitle: "Monitor",
      route: "/monitor",
      dropdown: [
        {
          pageTitle: "IRS Reporting",
          route: "",
        },
        {
          pageTitle: "SMC Reporting",
          route: "",
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