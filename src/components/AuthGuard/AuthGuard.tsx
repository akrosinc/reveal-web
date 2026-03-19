import { useKeycloak } from '@react-keycloak/web';
import { Navigate, useLocation } from 'react-router-dom';

interface Props {
  children: JSX.Element;
  roles?: string[];
}

// ─── PREVIOUS CODE (commented out) ───────────────────────────────────────────
// const AuthGuard = ({ children, roles }: Props) => {
//   const { keycloak } = useKeycloak();
//
//   const isAutherized = (realmRoles: string[]) => {
//     //If all provided roles match condition user has permissions
//     if (keycloak && realmRoles) {
//       let expectedRoles = realmRoles.filter(r => {
//         const realm = keycloak.hasRealmRole(r);
//         const managementResource = keycloak.hasResourceRole(r, 'realm-management');
//         return realm || managementResource;
//       });
//       if (expectedRoles.length === realmRoles.length) {
//         return true;
//       }
//     }
//     return false;
//   };
//
//   return isAutherized(roles) ? children : <Navigate to="/" />;
// };
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Routes accessible to superadmin (non-standard users).
 * Standard users (/standard_user) always pass through — all routes are accessible.
 *
 * Superadmin can access:
 *   Home / Plan Simulation / Reporting / Admin (User Mgmt, Location, Tag, Metadata)
 */
const SUPERADMIN_ALLOWED_PATH_PREFIXES = [
  '/',                          // Home
  '/plans/simulation',          // Data Viewer (call simulation)
  '/instance-configuration',    // Instance Configuration (standalone page)
  // '/reports',                // Reporting — HIDDEN as per request
  '/admin/management',          // User Management
  '/admin/location',            // Location Management
  '/admin/tag-management',      // Tag Management
  '/admin/metadata-import',     // Metadata Import
];

/**
 * Sub-paths blocked for superadmin even if parent prefix matches.
 */
const SUPERADMIN_BLOCKED_PATH_PREFIXES = [
  '/admin/management/group-configuration',      // Group Configuration
  '/reports',                                   // Reporting — BLOCKED
  // '/instance-configuration'                  // Allowed standalone page
  '/admin/kafka-messaging',                     // Data Processing Progress
];

const AuthGuard = ({ children, roles = [] }: Props) => {
  const { keycloak } = useKeycloak();
  const location = useLocation();

  const isStandardUser = ((keycloak?.tokenParsed as any)?.groups || [])?.includes('/standard_user');

  const isAuthorized = (): boolean => {
    const pathname = location.pathname;

    // Standard user: block Instance Configuration
    if (isStandardUser && pathname === '/instance-configuration') return false;

    // Standard users can access all other routes
    if (isStandardUser) return true;

    // Blocked sub-paths take priority for superadmin
    if (SUPERADMIN_BLOCKED_PATH_PREFIXES.some(p => pathname.startsWith(p))) return false;

    // Check against allowed prefixes for superadmin
    return SUPERADMIN_ALLOWED_PATH_PREFIXES.some(prefix =>
      prefix === '/' ? pathname === '/' : pathname.startsWith(prefix)
    );
  };

  return isAuthorized() ? children : <Navigate to="/" />;
};

export default AuthGuard;
