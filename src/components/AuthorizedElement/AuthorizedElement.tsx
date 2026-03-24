import { useKeycloak } from '@react-keycloak/web';
import { useAppSelector } from '../../store/hooks';
import { STANDARD_ADMIN_MENU, STANDARD_USER_MENU, SUPERADMIN_MENU } from '../../constants/menuSchemas';

interface Props {
  children: JSX.Element;
  roles?: string[];
  /** Pass the nav item's own route so visibility is checked against it, not the current URL */
  path?: string;
}
 const extractKeys = (menu:any) => {
  let keys:any = [];

  menu.forEach((item:any) => {
    // ✅ collect current key
    if (item.key) {
      keys.push(item.key);
    }

    // ✅ recursively collect from children
    if (item.children && item.children.length > 0) {
      keys = keys.concat(extractKeys(item.children));
    }
  });

  return keys;
};
// ─── PREVIOUS CODE (commented out) ───────────────────────────────────────────
const AuthorizedElement = ({ roles, children }: Props) => {
  const { keycloak } = useKeycloak();
  const ctx = useAppSelector(state => state.instanceContext);

  const permissions = ctx?.role?.permissions || [];
  console.log('User permissions from context:', permissions);
// console.log(extractKeys(SUPERADMIN_MENU))
// console.log(extractKeys(STANDARD_ADMIN_MENU))
// console.log(extractKeys(STANDARD_USER_MENU))
  const isAuthorized = (roles: string[], clientResource?: string) => {
    if (!roles || roles.length === 0) return true;
    // return roles?.some(r=>extractKeys(STANDARD_ADMIN_MENU).includes(r)) ? true : false
    return roles.some((r) => {
      // ✅ Check Keycloak roles
      const hasRealmRole = keycloak?.hasRealmRole(r);
      const hasResourceRole = keycloak?.hasResourceRole(r, 'realm-management');

      // ✅ Check backend permissions
      const hasPermission = permissions.includes(r);

      return hasRealmRole || hasResourceRole || hasPermission;
    });
  };

  return isAuthorized(roles) ? children : null;
};
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Exact routes (or prefixes) that superadmin is allowed to see.
 *
 * Standard users (/standard_user) always see everything.
 *
 * For superadmin:
 *   - Home
 *   - Plan Management parent dropdown  ('/plan'  — parent route in menuItems)
 *     └─ Data Viewer / Simulation only ('/plans/simulation')
 *   - Reporting ('/reports')
 *   - Admin parent dropdown            ('/admin')
 *     └─ User Management               ('/admin/management')
 *     └─ Location Management           ('/admin/location')
 *     └─ Tag Management                ('/admin/tag-management')
 *     └─ Metadata Import               ('/admin/metadata-import')
 */
// const SUPERADMIN_VISIBLE_PATH_PREFIXES = [
//   '/',                          // Home
//   '/plan',                      // Plan Management parent dropdown (shows with filtered children)
//   '/plans/simulation',          // Data Viewer (call simulation) — only allowed Plan child
//   '/instance-configuration',    // Instance Configuration (standalone page)
//   // '/reports',                   // Reporting — HIDDEN as per request
//   '/admin',                     // Admin parent dropdown
//   '/admin/management',          // User Management
//   '/admin/location',            // Location Management
//   '/admin/tag-management',      // Tag Management
//   '/admin/metadata-import',     // Metadata Import
// ];

// /**
//  * Paths hidden from superadmin (even if the parent prefix matches).
//  * These stop superadmin from seeing unwanted Plan Management children
//  * and certain Admin sub-sections.
//  */
// const SUPERADMIN_HIDDEN_PATH_PREFIXES = [
//   '/plans/manage',                              // Plans list — hidden for superadmin
//   '/plans/assign',                              // Assign — hidden for superadmin
//   '/plans/resource-planning',                   // Resource Planning — hidden for superadmin
//   '/plans/campaign-management',                 // Campaign Management — hidden for superadmin
//   '/admin/management/group-configuration',      // Group Configuration — hidden for superadmin
//   '/reports',                                   // Reporting — HIDDEN
//   // '/instance-configuration'                  // Now visible as standalone page
//   '/admin/kafka-messaging',                     // Data Processing Progress — hidden for superadmin
// ];

// const AuthorizedElement = ({ roles = [], path, children }: Props) => {
//   const { keycloak } = useKeycloak();

//   const isStandardUser = ((keycloak?.tokenParsed as any)?.groups || [])?.includes('/standard_user');

//   const isVisible = (): boolean => {
//     // If no path hint is provided, show the element (safe fallback for non-nav usages)
//     if (path === undefined) return true;

//     const p = path;

//     // Standard user: hide Instance Configuration
//     if (isStandardUser && p === '/instance-configuration') return false;

//     // Standard users see all other elements
//     if (isStandardUser) return true;

//     // Explicitly hidden paths take priority for superadmin
//     if (SUPERADMIN_HIDDEN_PATH_PREFIXES.some(hidden => p.startsWith(hidden))) return false;

//     // Check against allowed prefixes for superadmin
//     return SUPERADMIN_VISIBLE_PATH_PREFIXES.some(prefix =>
//       prefix === '/' ? p === '/' : p.startsWith(prefix)
//     );
//   };

//   return isVisible() ? children : null;
// };

export default AuthorizedElement;
