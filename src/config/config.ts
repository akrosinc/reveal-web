type AppConfig = {
  API_BASE_URL: string | undefined ;
  KEYCLOAK_URL: string | undefined;
  DASHBOARD_API_URL: string | undefined;
};

declare global {
  interface Window {
    APP_CONFIG?: Partial<AppConfig>;
  }
}

export const config: AppConfig = {
  API_BASE_URL:
      window.APP_CONFIG?.API_BASE_URL ||
      process.env.REACT_APP_API_URL,
  KEYCLOAK_URL:
      window.APP_CONFIG?.KEYCLOAK_URL ||
      process.env.REACT_APP_KEYCLOAK_URL,
  DASHBOARD_API_URL:
      window.APP_CONFIG?.DASHBOARD_API_URL ||
      process.env.REACT_APP_DASHBOARD_API_URL
};
