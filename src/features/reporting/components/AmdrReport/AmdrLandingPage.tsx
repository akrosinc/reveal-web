import React, {useEffect, useState} from 'react';

import {getLandingPageResponse} from "./api";
import Container from "react-bootstrap/Container";
import {
  AmdrTotalsLandingPageData,
  AmdrTotalsPercentageLandingPageData,
  Layout,
  Trace
} from "./types";
import Plotly, {Data} from "plotly.js";
import Plot from "react-plotly.js";
import {Col, Row} from "react-bootstrap";
import './amdrlanding.css';

const TOTAL_TITLES = {
  passiveCases: "Passive Cases",
  rcdCases: "RCD Cases",
  cases: "Total Cases",
  parasitologyReports: "Parasitology Reports",
  importedSequences: "Imported Sequences"
}

const PERCENTAGE_TITLES = {
  parasitologyToCasesPercentage: "Total Parasitology Reports vs Total Cases",
  importToCasesPercentage: "Total Imported Sequences vs Total Cases",
  importToParasitologyPercentage: "Total Imported Sequences vs Total Parasitology Reports"
}

const AmdrLandingPage = () => {
  const [parasitologyTraces, setParasitologyTraces] = useState<Data[]>([]);
  const [parasitologyLayout, setParasitologyLayout] = useState<Partial<Plotly.Layout>>({});

  const [importTraces, setImportTraces] = useState<Data[]>([]);
  const [importLayout, setImportLayout] = useState<Partial<Plotly.Layout>>({});

  const [paraImportTraces, setParaImportTraces] = useState<Data[]>([]);
  const [paraImportLayout, setParaImportLayout] = useState<Partial<Plotly.Layout>>({});

  const [amdrTotalsLandingPageData, setAmdrTotalsLandingPageData] = useState<AmdrTotalsLandingPageData>()

  const [amdrTotalsPercentageLandingPageData, setAmdrTotalsPercentageLandingPageData] = useState<AmdrTotalsPercentageLandingPageData>()

  useEffect(
      () => {
        getLandingPageResponse().then(res => {
          console.log(res)
          let parasitologyData = toPlotlyTraces(res.parasitologyData.data);
          setParasitologyTraces(parasitologyData);
          let parasitologyLayout = toPlotlyLayout(res.parasitologyData.layout);
          setParasitologyLayout(parasitologyLayout);

          let importData = toPlotlyTraces(res.importData.data);
          setImportTraces(importData);
          let importLayout = toPlotlyLayout(res.importData.layout);
          setImportLayout(importLayout);

          let parasitologyImportData = toPlotlyTraces(res.parasitologyImportData.data);
          setParaImportTraces(parasitologyImportData);
          let parasitologyImportLayout = toPlotlyLayout(res.parasitologyImportData.layout);
          setParaImportLayout(parasitologyImportLayout)

          setAmdrTotalsLandingPageData(res.amdrTotalsLandingPageData);

          setAmdrTotalsPercentageLandingPageData(res.amdrTotalsPercentageLandingPageData);
        });
      },
      []
  );

  function toPlotlyTraces(traces: Trace[]): Partial<Data>[] {
    return traces.map(trace => ({
      ...trace
    }));
  }


  function toPlotlyLayout(layout: Layout): Partial<Plotly.Layout> {
    return {
      barmode: layout.barmode,
      bargap: layout.bargap,
      title: {
        text: layout.title.text,
        font: {
          size: layout.title.font.size
        }
      },
      legend: layout.legend,
      xaxis: {
        type: layout.xaxis?.type,
        tickvals: layout.xaxis?.tickvals,
        ticktext: layout.xaxis?.ticktext,
        tickfont:  layout.xaxis?.tickfont,
        fixedrange: layout.xaxis?.fixedrange
      },
      yaxis: {
        title: layout.yaxis.title,
        tickfont:  layout.yaxis?.tickfont,
      },
      margin: {
        t: 32,   // 👈 reduce this (default is ~100)
        l: 50,
        r: 20,
        b: 40
      }
    };
  }


// Styles for the circular indicator container
  const circularIndicatorStyle: React.CSSProperties = {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    backgroundColor: "#d6d6d6", // gray trail
  };

// Styles for the text inside the circle
  const indicatorTextStyle: React.CSSProperties = {
    position: "absolute",
    fontWeight: "bold",
    fontSize: "24px",
    color: "#ffffff", // white for visibility
  };

  return (
      <Container fluid style={{ width: "75%", margin: "0 auto" }}>
        {/* Top totals row */}
        {amdrTotalsLandingPageData ? (
            <Row className="mb-4 g-3 justify-content-center">
              {(Object.entries(amdrTotalsLandingPageData) as [
                keyof AmdrTotalsLandingPageData,
                number
              ][]).map(([key, value]) => (
                  <Col md={3} xl={2} key={key}>
                    <div
                        className="p-3 border rounded text-center w-100 d-flex flex-column justify-content-center"
                        style={{ minHeight: "100px" }}
                    >
                      <div
                          className="mb-2 text-wrap fw-semibold"
                          style={{ fontSize: "0.65rem", lineHeight: 1.2 }}
                      >
                        {TOTAL_TITLES[key]}
                      </div>
                      <div
                          className="mb-2 text-wrap fw-semibold"
                          style={{ fontSize: "0.75rem", lineHeight: 1.2 }}
                      >
                        {value}
                      </div>

                    </div>
                  </Col>
              ))}
            </Row>
        ) : (
            <Row className="mb-4 g-5 justify-content-center">
              <Col xl={2}>
                <div className="border d-flex justify-content-center align-items-center h-100 w-100">
                  loading...
                </div>
              </Col>
            </Row>
        )}

        {/* Plots row */}
        <Row className="g-5 mb-4">
          <Col md={6}>
            <div className="d-flex border hover-enlarge w-100" style={{ height: "200px" }}>
              <div style={{ width: "100%", minWidth: 0 }} className={"m-3"}>
                {parasitologyTraces.length > 0 ? (
                    <Plot
                        data={parasitologyTraces}
                        layout={{ ...parasitologyLayout, autosize: true }}
                        style={{ width: "100%", height: "100%" }}
                        useResizeHandler
                        config={{
                          displayModeBar: true,
                          displaylogo: false,
                          modeBarButtons: [["resetScale2d", "zoomIn2d", "zoomOut2d", "pan2d"]]
                        }}
                    />
                ) : (
                    <div className="d-flex justify-content-center align-items-center h-100 w-100">
                      loading...
                    </div>
                )}
              </div>
            </div>
          </Col>

          <Col md={6}>
            <div className="d-flex border hover-enlarge w-100" style={{ height: "200px" }}>
              <div style={{ width: "100%", minWidth: 0 }} className={"m-3"}>
                {importTraces.length > 0 ? (
                    <Plot
                        data={importTraces}
                        layout={{ ...importLayout, autosize: true }}
                        style={{ width: "100%", height: "100%" }}
                        useResizeHandler
                        config={{
                          displayModeBar: true,
                          displaylogo: false,
                          modeBarButtons: [["resetScale2d", "zoomIn2d", "zoomOut2d", "pan2d"]]
                        }}
                    />
                ) : (
                    <div className="d-flex justify-content-center align-items-center h-100 w-100">
                      loading...
                    </div>
                )}
              </div>
            </div>
          </Col>
        </Row>

        {/* Second row with plot + indicators */}
        <Row className="g-5" style={{ minHeight: "250px" }}>
          <Col md={6}>
            <div className="d-flex border hover-enlarge w-100" style={{ height: "200px" }}>
              <div style={{ width: "100%", minWidth: 0 }} className={"m-3"}>
                {paraImportTraces.length > 0 ? (
                    <Plot
                        data={paraImportTraces}
                        layout={paraImportLayout}
                        style={{ width: "100%", height: "100%" }}
                        useResizeHandler
                        config={{
                          displayModeBar: true,
                          displaylogo: false,
                          modeBarButtons: [["resetScale2d", "zoomIn2d", "zoomOut2d", "pan2d"]]
                        }}
                    />
                ) : (
                    <div className="d-flex justify-content-center align-items-center h-100 w-100">
                      loading...
                    </div>
                )}
              </div>
            </div>
          </Col>

          <Col md={6}>
            <div className="d-flex border hover-enlarge w-100" style={{ height: "200px" }}>
              {amdrTotalsPercentageLandingPageData ? (
                  <div className="d-flex flex-column justify-content-center w-100 m-2">
                    <Row className="g-3">
                      {(Object.entries(amdrTotalsPercentageLandingPageData) as [
                        keyof AmdrTotalsPercentageLandingPageData,
                        number
                      ][]).map(([key, value]) => {
                        const percent = Math.round(value * 100);
                        let circleColor = "#dc3545";
                        if (percent > 70) circleColor = "#28a745";
                        else if (percent > 29) circleColor = "#ffc107";

                        return (
                            <Col md={4} key={key}>
                              <div
                                  className="indicator-card d-flex flex-column align-items-center justify-content-center"
                                  style={{ minHeight: "180px" }}
                              >
                                <div
                                    className="mb-2 text-center fw-semibold"
                                    style={{ fontSize: "0.65rem" }}
                                >
                                  {PERCENTAGE_TITLES[key]}
                                </div>
                                <div
                                    style={{
                                      ...circularIndicatorStyle,
                                      background: `conic-gradient(${circleColor} ${
                                          percent * 3.6
                                      }deg, #d6d6d6 0deg)`
                                    }}
                                    className="mb-2 d-flex align-items-center justify-content-center"
                                >
                                  <span style={indicatorTextStyle}>{percent}%</span>
                                </div>
                              </div>
                            </Col>
                        );
                      })}
                    </Row>
                  </div>
              ) : (
                  <div className="d-flex justify-content-center align-items-center h-100 w-100">
                    loading...
                  </div>
              )}
            </div>
          </Col>
        </Row>
      </Container>

  );
};

export default AmdrLandingPage;
