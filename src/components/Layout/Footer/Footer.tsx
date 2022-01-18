import { Row, Col } from 'react-bootstrap';
import { FOOTER_TEXT } from '../../../constants';
import revealLogo from '../../../assets/logos/reveal-logo.png';
import akrosLogo from '../../../assets/logos/akros-logo.png';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer>
      <hr className="p-0 m-0" />
      <Row className="align-items-center">
        <Col>
          <img src={revealLogo} style={{marginTop: '-10px'}} alt="Reveal Logo" />
          <span>&nbsp;&nbsp;{t('publicPage.supportedBy')}&nbsp;&nbsp;</span>
          <img src={akrosLogo} alt="Akros Logo" />
          <small className='text-muted'>&nbsp;&nbsp;{process.env.REACT_APP_VERSION}</small>
        </Col>
        <Col className="text-end">&copy;{FOOTER_TEXT}</Col>
      </Row>
    </footer>
  );
};

export default Footer;
