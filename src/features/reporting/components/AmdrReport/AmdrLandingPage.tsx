import React, {useEffect, useState} from 'react';

import {getLandingPageResponse} from "./index";
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
        text: layout.title.text
      },
      xaxis: {
        type: layout.xaxis?.type,
        tickvals: layout.xaxis?.tickvals,
        ticktext: layout.xaxis?.ticktext,
        fixedrange: layout.xaxis?.fixedrange
      },

      yaxis: {
        title: layout.yaxis?.title
            ? {text: layout.yaxis.title}
            : undefined
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
      <Container fluid>
        {amdrTotalsLandingPageData && (
            <Row className="mb-5 justify-content-center">
              {(Object.entries(amdrTotalsLandingPageData) as [
                keyof AmdrTotalsLandingPageData,
                number
              ][]).map(([key, value]) => (
                  <Col
                      md={3}
                      xl={2}
                      key={key}
                      className="d-flex justify-content-center"
                  >
                    <div
                        className="p-3 my-1 border border-1 rounded text-center w-100 d-flex flex-column justify-content-center"
                        style={{minHeight: "100px"}}
                    >
                      <h6 className="mb-2 text-wrap">{TOTAL_TITLES[key]}</h6>
                      <h5 className="mb-0">{value}</h5>
                    </div>
                  </Col>
              ))}
            </Row>
        )}

        <Row className="g-3">
          <Col md={6} className="d-flex">
            <div style={{width: "100%", minWidth: 0}}>
              <Plot
                  data={parasitologyTraces}
                  layout={{
                    ...parasitologyLayout,
                    autosize: true,
                  }}
                  style={{width: "100%", height: "400px"}}
                  useResizeHandler
                  config={{displayModeBar: true, displaylogo: false,
                    modeBarButtons: [
                      ["resetScale2d","zoomIn2d","zoomOut2d","pan2d"], // only zoom, pan, reset

                    ]}}
              />
            </div>
          </Col>

          <Col md={6} className="d-flex">
            <div style={{width: "100%", minWidth: 0}}>
              <Plot
                  data={importTraces}
                  layout={{
                    ...importLayout,
                    autosize: true,
                  }}
                  style={{width: "100%", height: "400px"}}
                  useResizeHandler
                  config={{displayModeBar: true, displaylogo: false,
                    modeBarButtons: [
                      ["resetScale2d","zoomIn2d","zoomOut2d","pan2d"], // only zoom, pan, reset

                    ]}}
              />
            </div>
          </Col>
        </Row>

        <Row className="g-3" style={{ minHeight: "400px" }}>
          {/* Left Plot */}
          <Col md={6} className="d-flex">
            <div style={{ width: "100%", minWidth: 0 }}>
              <Plot
                  data={paraImportTraces}
                  layout={paraImportLayout}
                  style={{ width: "100%", height: "100%" }}
                  useResizeHandler
                  config={{ displayModeBar: true, displaylogo: false,
                    modeBarButtons: [
                      ["resetScale2d","zoomIn2d","zoomOut2d","pan2d"], // only zoom, pan, reset

                    ]}}

              />
            </div>
          </Col>

          {amdrTotalsPercentageLandingPageData && (
              <Col md={6} className="d-flex">
                <div className="d-flex flex-column justify-content-center w-100">
                  <Row className="g-3 justify-content-center">
                    {(Object.entries(amdrTotalsPercentageLandingPageData) as [
                      keyof AmdrTotalsPercentageLandingPageData,
                      number
                    ][]).map(([key, value]) => {
                      const percent = Math.round(value * 100);

                      // Determine circle color based on rules
                      let circleColor = "#dc3545"; // default red
                      if (percent > 70) circleColor = "#28a745" // green
                      else if (percent > 29) circleColor = "#ffc107"; // yellow

                      return (
                          <Col
                              md={4}
                              key={key}
                              className="d-flex flex-column align-items-center justify-content-center"
                          >
                            <div
                                className="indicator-card d-flex flex-column align-items-center justify-content-center"
                                style={{ minHeight: "180px" }}
                            >
                              <h6 className="mb-2 text-center">{PERCENTAGE_TITLES[key]}</h6>

                              <div
                                  style={{
                                    ...circularIndicatorStyle,
                                    background: `conic-gradient(${circleColor} ${percent * 3.6}deg, #d6d6d6 0deg)`,
                                  }}
                                  className="mb-2"
                              >
                                <span style={indicatorTextStyle}>{percent}%</span>
                              </div>
                            </div>
                          </Col>
                      );
                    })}
                  </Row>
                </div>
              </Col>
          )}

        </Row>
      </Container>
  );
};

export default AmdrLandingPage;
