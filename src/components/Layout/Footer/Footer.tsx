import { Row, Col } from 'react-bootstrap';
import { FOOTER_TEXT } from '../../../constants';
import revealLogo from '../../../assets/logos/reveal-logo.png';
import akrosLogo from '../../../assets/logos/akros-logo.png';

const Footer = () => (
  <footer>
    <hr className="p-0 m-0" />
    <Row className="align-items-center">
      <Col>
        <img src={revealLogo} alt="Reveal Logo" />
        &nbsp; &nbsp;supported by&nbsp; &nbsp;
        <img src={akrosLogo} alt="Akros Logo" />
      </Col>
      <Col className="text-end">&copy;{FOOTER_TEXT}</Col>
    </Row>
  </footer>
);

export default Footer;
