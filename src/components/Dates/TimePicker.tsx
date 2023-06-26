import { Col, Form, Modal, Row } from 'react-bootstrap';
import Select, { Options } from 'react-select';
import React, { useEffect, useState } from 'react';

interface Props {
  title: string;
  onChange: (event: any) => void;
  label: string;
}

const TimePicker = ({ title, onChange, label }: Props) => {
  const getRange = (start: number, max: number) => {
    let arr = [];
    for (let i = start; i <= max; i++) {
      arr.push({ label: i.toString(), value: i.toString() });
    }
    return arr;
  };
  const [hour, setHour] = useState<string>();
  const [minute, setMinute] = useState<string>();
  const [theDate, setTheDate] = useState<string>();
  const [showModal, setShowModal] = useState<boolean>(false);
  useEffect(() => {
    setTheDate(
      (hour != null ? hour?.padStart(2, '0') : '00')
        .concat(':')
        .concat(minute != null ? minute?.padStart(2, '0') : '00')
    );
    onChange(
      (hour != null ? hour?.padStart(2, '0') : '00')
        .concat(':')
        .concat(minute != null ? minute?.padStart(2, '0') : '00')
    );
    // setTime(
    //   (hour != null ? hour?.padStart(2, '0') : '00')
    //     .concat(':')
    //     .concat(minute != null ? minute?.padStart(2, '0') : '00')
    // );
  }, [hour, minute]);

  return (
    <>
      <Form.Group className="mb-2">
        <Form.Label>{label}</Form.Label>
        <Form.Control
          type="text"
          placeholder={'click to select time'}
          onClick={_ => setShowModal(true)}
          defaultValue={new Date()
            .getHours()
            .toString()
            .padStart(2, '0')
            .concat(':')
            .concat(new Date().getMinutes().toString().padStart(2, '0'))}
          value={theDate}
        />
      </Form.Group>

      <Modal
        show={showModal}
        centered
        backdrop="static"
        dialogClassName="modal-30w"
        contentClassName={'bg-white'}
        onHide={() => setShowModal(false)}
      >
        <Modal.Header closeButton={true}>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col>
              <Form.Label>Hour</Form.Label>
              <Select options={getRange(1, 24)} onChange={e => setHour(e?.value)} />
            </Col>
            <Col>
              <Form.Label>Minute</Form.Label>
              <Select options={getRange(1, 59)} onChange={e => setMinute(e?.value)} />
            </Col>
            <Col>
              <Form.Label>Selected Time</Form.Label>
              <p>{theDate}</p>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>
    </>
  );
};
export default TimePicker;
