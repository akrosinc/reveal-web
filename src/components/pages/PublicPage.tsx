import React, { CSSProperties } from "react";
import { Col, Image, Row } from "react-bootstrap";
import logo from "../../assets/logos/Reveal_logo_400.png";
import devicesImage from "../../assets/images/reveal-devices.png";

import Container from "react-bootstrap/Container";

const imageTextStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  alignContent: "center",
  flexWrap: "wrap",
  justifyContent: "center",
};

function PublicPage() {
  return (
    <Container className="text-center my-5 py-3">
      <Row>
        <Col style={imageTextStyle} md={6}>
          <Image src={logo} alt="Reveal logo" fluid />
          <p className="lead">
            Reveal is a Global Good and an open-source platform taht uses
            spatial intelligence to drive delivery of live-saving interventions
          </p>
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
        <Col style={{ textAlign: "left" }} md={6}>
          <h1 style={{ fontWeight: "700" }}>WHAT IS REVEAL?</h1>
          <p className="lead text-secondary">
            REVEAL IS AN APPROVED{" "}
            <a
              href="https://digitalsquare.org/resourcesrepository/global-goods-guidebook"
              target="_blank"
              rel="noreferrer"
              className="text-success text-decoration-none"
              style={{color: '#8cc63e'}}
            >
              GLOBAL GOOD
            </a>{" "}
            THROUGH DIGITAL SQUARE AND IS FEATURED IN THE WORLD HEALTH
            ORGANIZATION’S <a
              href="https://digitalsquare.org/resourcesrepository/global-goods-guidebook"
              target="_blank"
              rel="noreferrer"
              className="text-decoration-none"
              style={{color: '#8cc63e'}}
            >DIGITAL HEALTH ATLAS</a>.
          </p>
          <p className="text-secondary">
            Reveal supports decision makers and intervention managers by guiding
            and tracking delivery of in-field activities with precision and
            holding field teams accountable for action. Reveal uses smart maps
            and technology appropriate for low-resource settings to monitor
            coverage of interventions as they happen. Modeled on the mSpray and
            DiSARM tool, Reveal helps to optimize available resources and ensure
            no one is missed in the process.
          </p>
        </Col>
      </Row>
    </Container>
  );
}

export default PublicPage;
