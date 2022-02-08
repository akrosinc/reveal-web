import React from 'react';
import { Pie, Doughnut } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { Col, Row } from 'react-bootstrap';
Chart.register(...registerables);

const Dashboard = () => {
  const data = {
    labels: ['Users', 'Organizations', 'Plans'],
    datasets: [
      {
        label: 'My First Dataset',
        data: [6, 3, 5],
        backgroundColor: ['#198754', '#34568B', 'rgb(255, 205, 86)'],
        hoverOffset: 4
      }
    ]
  };

  const dougData = {
    labels: ['Active Plans', 'Active Organizations'],
    datasets: [
      {
        label: '# of Votes',
        data: [2, 3],
        backgroundColor: ['#198754', '#34568B']
      }
    ]
  };

  return (
    <>
      <h4 className="my-4">Dashboard</h4>
      <Row>
        <Col md={6}>
          <Pie
            data={data}
            height="450px"
            width="450px"
            options={{
              maintainAspectRatio: false
            }}
          />
        </Col>
        <Col md={6}>
          <Doughnut
            data={dougData}
            height="450px"
            width="450px"
            options={{
              maintainAspectRatio: false,
              rotation: 270,
              circumference: 180,
              cutout: 120
            }}
          />
        </Col>
      </Row>
    </>
  );
};

export default Dashboard;
