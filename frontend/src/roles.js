const BASE_NAVIGATION_ITEMS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/machines", label: "Maschinen" },
  { to: "/analysis", label: "Analyse / Trends" },
  { to: "/system-status", label: "Systemstatus" },
];

const OPERATOR_NAVIGATION_ITEMS = [
  { to: "/sensor-data", label: "Sensordaten" },
  { to: "/maintenance", label: "Wartung" },
];

const ADMIN_NAVIGATION_ITEMS = [{ to: "/users", label: "Benutzer / Rollen" }];

const ROUTE_ROLE_RULES = [
  { prefix: "/users", allowedRoles: ["admin"] },
  { prefix: "/sensor-data", allowedRoles: ["admin", "technician"] },
  { prefix: "/maintenance", allowedRoles: ["admin", "technician"] },
];

export function getDefaultPathForRole(role) {
  if (role === "admin" || role === "technician" || role === "viewer") {
    return "/dashboard";
  }

  return "/dashboard";
}

export function getNavigationItemsForRole(role) {
  if (role === "admin") {
    return [...BASE_NAVIGATION_ITEMS, ...OPERATOR_NAVIGATION_ITEMS, ...ADMIN_NAVIGATION_ITEMS];
  }

  if (role === "technician") {
    return [...BASE_NAVIGATION_ITEMS, ...OPERATOR_NAVIGATION_ITEMS];
  }

  return [...BASE_NAVIGATION_ITEMS];
}

export function canAccessPath(role, pathname) {
  const matchingRule = ROUTE_ROLE_RULES.find((rule) => pathname.startsWith(rule.prefix));

  if (!matchingRule) {
    return true;
  }

  return matchingRule.allowedRoles.includes(role);
}