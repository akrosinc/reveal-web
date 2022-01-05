import React, { CSSProperties } from 'react';
import { Col, Image, Row } from 'react-bootstrap';
import logo from '../../assets/logos/Reveal_logo_400.png';
import devicesImage from '../../assets/images/reveal-devices.png';

import Container from 'react-bootstrap/Container';
import { useTranslation } from 'react-i18next';

const imageTextStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  alignContent: 'center',
  flexWrap: 'wrap',
  justifyContent: 'center'
};

function PublicPage() {
  const { t } = useTranslation();

  return (
    <Container className="text-center my-5 py-3">
      <Row>
        <Col style={imageTextStyle} md={6}>
          <Image src={logo} alt="Reveal logo" fluid />
          <p className="lead">{t('publicPage.description')}</p>
        </Col>
        <Col md={6}>
          <Image src={devicesImage} alt="Reveal devices" fluid />
        </Col>
      </Row>
      <Row className="mt-5 pt-2">
        <Col md={6}>
          <iframe
            width="100%"
            height="315"
            src="https://www.youtube.com/embed/JvKghi2F1ZY"
            title="YouTube video player"
            frameBorder={0}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </Col>
        <Col style={{ textAlign: 'left' }} md={6}>
          <h1 style={{ fontWeight: '700' }}>{t('publicPage.question')}</h1>
          <p className="lead text-secondary">
            {t('publicPage.firstPartAbout')}{' '}
            <a
              href="https://digitalsquare.org/resourcesrepository/global-goods-guidebook"
              target="_blank"
              rel="noreferrer"
              className="text-decoration-none"
              style={{ color: '#8cc63e' }}
            >
              GLOBAL GOOD
            </a>{' '}
            {t('publicPage.secondPartAbout')}{' '}
            <a
              href="https://digitalhealthatlas.org/en/-/"
              target="_blank"
              rel="noreferrer"
              className="text-decoration-none"
              style={{ color: '#8cc63e' }}
            >
              DIGITAL HEALTH ATLAS
            </a>
            .
          </p>
          <p className="text-secondary">{t('publicPage.about')}</p>
        </Col>
      </Row>
    </Container>
  );
}

export default PublicPage;
