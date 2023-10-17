import { Container, Form, Row, Table } from 'react-bootstrap';

import React, { useState } from 'react';
import { UseFormHandleSubmit } from 'react-hook-form';

import { hex, hsl } from 'color-convert';
import { Color } from 'react-color-palette';
import { getBackgroundStyle } from '../SimulationMapView/SimulationMapView';
import { UseFormRegister, UseFormSetValue } from 'react-hook-form/dist/types/form';
import { FieldErrors } from 'react-hook-form/dist/types/errors';
const INITIAL_FILL_COLOR_STR = '#00FF00';
const INITIAL_FILL_COLOR: Color = {
  hex: INITIAL_FILL_COLOR_STR,
  rgb: { r: hex.rgb('00FF00')[0], g: hex.rgb('00FF00')[1], b: hex.rgb('00FF00')[2] },
  hsv: { h: hex.hsv('00FF00')[0], s: hex.hsv('00FF00')[1], v: hex.hsv('00FF00')[2] }
};

interface Props<TFieldValues> {
  formControls: {
    handleSubmit: UseFormHandleSubmit<TFieldValues>;
    register: UseFormRegister<TFieldValues>;
    setValue: UseFormSetValue<TFieldValues>;
    formState: {
      errors: FieldErrors<TFieldValues>;
    };
  };
}

const SimulationAnalysisPanelContent = ({ formControls }: Props<any>) => {
  const [color, setColor] = useState<Color>(INITIAL_FILL_COLOR);
  const [selectColor, setSelectColor] = useState<string>(INITIAL_FILL_COLOR_STR);

  const getButtons = () => {
    let stacks = [];
    for (let i = 0; i < 6; i++) {
      let colors = [];
      let skipFirst = false;
      for (let j = i * 60; j <= i * 60 + 60; j = j + 6) {
        if (skipFirst) {
          let hexValue = hsl.hex([j, 100, 50]);

          let rgbArr = hex.rgb(hexValue);
          let hsvArr = hex.hsv(hexValue);

          colors.push({ colr: j, hex: hexValue, rgb: rgbArr, hsv: hsvArr });
        }
        skipFirst = true;
      }
      stacks.push({ stack: i, col: colors });
    }
    return (
      <Table>
        {stacks.map((stack, index) => (
          <tr>
            {stack.col.map(col => (
              <td
                onClick={_ => {
                  setColor({
                    hex: '#' + col.hex,
                    rgb: { r: col.rgb[0], g: col.rgb[1], b: col.rgb[2] },
                    hsv: { h: col.hsv[0], s: col.hsv[1], v: col.hsv[2] }
                  });
                  setSelectColor('#' + col.hex);
                  formControls.setValue('colorHex', '#' + col.hex);
                }}
              >
                {color && color.hex === '#' + col.hex ? (
                  <div
                    style={{
                      backgroundColor: '#' + col.hex,
                      borderStyle: 'solid',
                      borderColor: 'black',
                      borderWidth: '1px'
                    }}
                  >
                    {' '}
                  </div>
                ) : (
                  <div
                    style={{
                      backgroundColor: '#' + col.hex,
                      borderStyle: 'solid',
                      borderColor: 'white',
                      borderWidth: '1px'
                    }}
                  >
                    {' '}
                  </div>
                )}
              </td>
            ))}
          </tr>
        ))}
      </Table>
    );
  };

  return (
    <Container>
      <Row className={'py-2'}>
        <Form.Group>
          <Form.Label>Layer Name</Form.Label>
          <Form.Control
            type={'text'}
            {...formControls.register('labelName', { required: 'Layer Label is required' })}
          />
          {formControls.formState.errors.labelName && (
            <Form.Label className="text-danger">{formControls.formState.errors.labelName.message}</Form.Label>
          )}
        </Form.Group>
      </Row>

      <Row className={'py-3'}>
        <Form.Label>Choose color</Form.Label>
      </Row>
      <Row>{getButtons()}</Row>

      <Row>
        <Form.Label>Outcome</Form.Label>
      </Row>
      <Row>
        <div
          style={{
            width: 100,
            height: 100,
            background: getBackgroundStyle({ r: color.rgb.r, g: color.rgb.g, b: color.rgb.b })
          }}
        />
      </Row>
      <Form.Control type={'hidden'} {...formControls.register('colorHex')} value={selectColor} />
    </Container>
  );
};
export default SimulationAnalysisPanelContent;
