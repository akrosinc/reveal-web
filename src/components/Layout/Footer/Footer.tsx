import { Row, Col } from 'react-bootstrap';
import { FOOTER_TEXT } from '../../../constants';
import revealLogo from '../../../assets/logos/reveal-logo.png';
import revealLogoWhite from '../../../assets/logos/reveal-logo-white.png';
import akrosLogo from '../../../assets/logos/akros-logo.png';
import akrosLogoWhite from '../../../assets/logos/akros-logo-white.png';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../store/hooks';

const Footer = () => {
  const { t } = useTranslation();
  const isDarkMode = useAppSelector(state => state.darkMode.value);

  return (
    <footer>
      <hr className="p-0 m-0" />
      <Row className="align-items-center">
        <Col md={9}>
          <img src={isDarkMode ? revealLogoWhite : revealLogo} style={{marginTop: '-10px'}} width='140px' alt="Reveal Logo" />
          <span>&nbsp;&nbsp;{t('publicPage.supportedBy')}&nbsp;&nbsp;</span>
          <img src={isDarkMode ? akrosLogoWhite : akrosLogo} alt="Akros Logo" className='rounded' />
          <small className='text-muted'>&nbsp;&nbsp; Reveal Web: {process.env.REACT_APP_VERSION} | Reveal Server: {process.env.REACT_APP_REVEAL_SERVER_VERSION}</small>
        </Col>
        <Col md={3} className="text-end">&copy;{FOOTER_TEXT}</Col>
      </Row>
    </footer>
  );
};

export default Footer;
