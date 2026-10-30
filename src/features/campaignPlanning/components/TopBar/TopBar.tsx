import { Fragment, memo, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { BsArrowLeftRight, BsChevronDown, BsMoon, BsPerson } from 'react-icons/bs';
import { Link, useLocation } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import 'flag-icons/css/flag-icons.css';
import logo from '../../../../assets/logos/reveal-logo.png';
import logoWhite from '../../../../assets/logos/reveal-logo-white.png';
import AuthorizedElement from '../../../../components/AuthorizedElement';
import { getMainMenu } from '../../../../components/Layout/Navbar/menuItems';
import SwitchInstanceModal from '../../../../components/Layout/Navbar/SwitchInstanceModal';
import { CAMPAIGN_PLANNING_PAGE, CAMPAIGN_PLANNING_VIEW, HOME_PAGE } from '../../../../constants';
import { SUPER_ADMIN } from '../../../../constants/userRoles';
import i18n, { LOCALES } from '../../../../i18n';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { setToBrowser } from '../../../../utils';
import { setDarkMode } from '../../../reducers/darkMode';
import { clearCurrentInstance } from '../../../reducers/instanceContext';
import { HierarchyNode } from '../../providers/types';
import styles from './TopBar.module.css';

const NAV_MENUS = ['Instance', 'Group', 'Admin'];

interface Props {
  path?: HierarchyNode[];
  // Shown above the other pages instead of floating over the Campaign Planning map
  isStatic?: boolean;
}

// The app header: page links and menus, instance switch, user menu, language and theme, like the old main navbar
const TopBar = ({ path = [], isStatic }: Props) => {
  const { t } = useTranslation();
  const { keycloak } = useKeycloak();
  const dispatch = useAppDispatch();
  const instanceContext = useAppSelector(state => state.instanceContext);
  const selectedInstance = instanceContext.selectedInstance;
  const isDarkMode = useAppSelector(state => state.darkMode.value);
  const { pathname } = useLocation();
  const navMenus = getMainMenu(instanceContext).filter(item => NAV_MENUS.includes(item.pageTitle));
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const isSuperAdmin = ((keycloak.tokenParsed as any)?.groups || []).includes(SUPER_ADMIN);
  const username = (keycloak.tokenParsed as any)?.preferred_username;
  const currentLocale = LOCALES.find(locale => locale.name === i18n.language) ?? LOCALES[0];

  const instanceName =
    isSuperAdmin && !selectedInstance?.identifier
      ? t('campaignPlanning.globalInstance')
      : selectedInstance?.name ?? t('topNav.switchInstance');

  const logout = () => {
    dispatch(clearCurrentInstance());
    keycloak.logout();
  };

  const changeLanguage = (locale: string) => {
    i18n.changeLanguage(locale);
    setToBrowser('locale', locale);
  };

  const toggleTheme = () => {
    dispatch(setDarkMode(!isDarkMode));
    document.body.classList.add('dark-transition');
    setTimeout(() => document.body.classList.remove('dark-transition'), 1000);
  };

  const isActiveRoute = (route: string) => pathname.startsWith(route.split('?')[0]);

  return (
    <header className={isStatic ? `${styles.topBar} ${styles.static}` : styles.topBar}>
      <Link to={HOME_PAGE} className={styles.brand}>
        <img src={isDarkMode ? logoWhite : logo} alt="Reveal" className={styles.logo} />
      </Link>
      <div className={styles.crumb}>
        {path.map((node, index) => (
          <Fragment key={node.identifier}>
            {index > 0 && <span className={styles.separator}>/</span>}
            <span className={index === path.length - 1 ? styles.current : undefined}>{node.properties.name}</span>
          </Fragment>
        ))}
      </div>
      <nav className={styles.nav}>
        <Link
          to={HOME_PAGE}
          id="campaign-planning-home-link"
          className={pathname === HOME_PAGE ? `${styles.link} ${styles.active}` : styles.link}
        >
          {t('campaignPlanning.navDashboard')}
        </Link>
        {instanceContext.isLoading && <span className={styles.navLoading} aria-hidden />}
        <AuthorizedElement roles={[CAMPAIGN_PLANNING_VIEW]}>
          <Link
            to={CAMPAIGN_PLANNING_PAGE}
            id="campaign-planning-link"
            className={isActiveRoute(CAMPAIGN_PLANNING_PAGE) ? `${styles.link} ${styles.active}` : styles.link}
          >
            {t('campaignPlanning.navCampaignPlanning')}
          </Link>
        </AuthorizedElement>
        {navMenus.map(menu => (
          <AuthorizedElement key={menu.pageTitle} roles={menu.roles}>
            <Dropdown drop="down-centered">
              <Dropdown.Toggle
                as="button"
                id={`campaign-planning-${menu.pageTitle.toLowerCase()}-dropdown`}
                className={
                  menu.dropdown?.some(item => isActiveRoute(item.route))
                    ? `${styles.navButton} ${styles.active}`
                    : styles.navButton
                }
              >
                {t('topNav.' + menu.pageTitle)}
                <BsChevronDown />
              </Dropdown.Toggle>
              <Dropdown.Menu className={`${styles.menu} ${styles.navMenu}`}>
                {menu.dropdown?.map(item => (
                  <AuthorizedElement key={item.route} roles={item.roles}>
                    <Dropdown.Item as={Link} to={item.route} className={styles.menuItem}>
                      {t('topNav.' + item.pageTitle)}
                    </Dropdown.Item>
                  </AuthorizedElement>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </AuthorizedElement>
        ))}
      </nav>

      <div className={styles.account}>
        <button
          type="button"
          id="campaign-planning-switch-instance-button"
          className={styles.accountButton}
          title={t('topNav.switchInstance')}
          onClick={() => setShowSwitchModal(true)}
        >
          <BsArrowLeftRight />
          <span className={styles.instanceName}>{instanceName}</span>
        </button>

        {username && (
          <Dropdown align="end">
            <Dropdown.Toggle as="button" id="campaign-planning-user-dropdown" className={styles.accountButton}>
              <BsPerson />
              {username}
            </Dropdown.Toggle>
            <Dropdown.Menu className={styles.menu}>
              <Dropdown.Item id="campaign-planning-logout-button" className={styles.menuItem} onClick={logout}>
                {t('topNav.logOut')}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        )}

        <Dropdown align="end">
          <Dropdown.Toggle
            as="button"
            id="campaign-planning-language-dropdown"
            className={styles.accountButton}
            aria-label={currentLocale.name.toUpperCase()}
          >
            <span className={currentLocale.flag} />
          </Dropdown.Toggle>
          <Dropdown.Menu className={styles.menu}>
            {LOCALES.map(locale => (
              <Dropdown.Item
                key={locale.name}
                id={`campaign-planning-${locale.name}-button`}
                className={styles.menuItem}
                active={locale.name === currentLocale.name}
                onClick={() => changeLanguage(locale.name)}
              >
                <span className={`${locale.flag} me-2`} />
                {locale.name.toUpperCase()}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>

        <button
          type="button"
          id="campaign-planning-theme-button"
          className={styles.accountButton}
          title={isDarkMode ? t('darkMode.off') : t('darkMode.on')}
          aria-label={isDarkMode ? t('darkMode.off') : t('darkMode.on')}
          onClick={toggleTheme}
        >
          <BsMoon />
        </button>
      </div>

      <SwitchInstanceModal
        show={showSwitchModal}
        onClose={() => setShowSwitchModal(false)}
        redirectTo={CAMPAIGN_PLANNING_PAGE}
      />
    </header>
  );
};

export default memo(TopBar);
