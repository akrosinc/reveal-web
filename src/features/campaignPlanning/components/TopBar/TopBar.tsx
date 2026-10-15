import { Fragment, memo, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { BsArrowLeftRight, BsPerson } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import 'flag-icons/css/flag-icons.css';
import SwitchInstanceModal from '../../../../components/Layout/Navbar/SwitchInstanceModal';
import { CAMPAIGN_PLANNING_INSTANCE_SELECTION, CAMPAIGN_PLANNING_PAGE, HOME_PAGE } from '../../../../constants';
import { SUPER_ADMIN } from '../../../../constants/userRoles';
import { useAuthorization } from '../../../../hooks/useAuthorization';
import i18n, { LOCALES } from '../../../../i18n';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { setToBrowser } from '../../../../utils';
import { clearCurrentInstance } from '../../../reducers/instanceContext';
import { HierarchyNode } from '../../providers/types';
import styles from './TopBar.module.css';

interface Props {
  path: HierarchyNode[];
}

// Instance switch, user menu and language work like the main app navbar, which this full-screen page doesn't show
const TopBar = ({ path }: Props) => {
  const { t } = useTranslation();
  const { keycloak } = useKeycloak();
  const dispatch = useAppDispatch();
  const selectedInstance = useAppSelector(state => state.instanceContext.selectedInstance);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const canSwitchInstance = useAuthorization([CAMPAIGN_PLANNING_INSTANCE_SELECTION]);
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

  return (
    <header className={styles.topBar}>
      <Link to={HOME_PAGE} className={styles.brand}>
        Reveal
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
        <span className={styles.active}>{t('campaignPlanning.navCampaignPlanning')}</span>
        <Link to={HOME_PAGE} id="campaign-planning-home-link" className={styles.link}>
          {t('campaignPlanning.navDashboard')}
        </Link>
        <span>{t('campaignPlanning.navAdmin')}</span>
      </nav>

      <div className={styles.account}>
        {canSwitchInstance ? (
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
        ) : (
          <span className={`${styles.instanceName} ${styles.instanceLabel}`}>{instanceName}</span>
        )}

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
