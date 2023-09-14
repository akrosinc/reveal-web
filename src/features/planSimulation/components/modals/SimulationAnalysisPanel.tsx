import { ActionDialog } from '../../../../components/Dialogs';
import { Button, Container, Form, Row, Table } from 'react-bootstrap';

import React, { BaseSyntheticEvent, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AnalysisLayer } from '../Simulation';
import { hex, hsl } from 'color-convert';
import { Color } from 'react-color-palette';

interface Props {
  closeHandler: (close: boolean) => void;
  setLayerDetail: (analysisLayer: AnalysisLayer) => void;
  submitHandler: (formData: AnalysisLayer) => void;
}
const INITIAL_FILL_COLOR: Color = {
  hex: '#00FF00',
  rgb: { r: hex.rgb('00FF00')[0], g: hex.rgb('00FF00')[1], b: hex.rgb('00FF00')[2] },
  hsv: { h: hex.hsv('00FF00')[0], s: hex.hsv('00FF00')[1], v: hex.hsv('00FF00')[2] }
};

const SimulationAnalysisPanel = ({ closeHandler, setLayerDetail, submitHandler }: Props) => {
  const [color, setColor] = useState<Color>(INITIAL_FILL_COLOR);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<AnalysisLayer>();

  const setLayerDetailSubmit = useCallback(
    (formData: AnalysisLayer, e: BaseSyntheticEvent | undefined) => {
      let hexValue = color?.hex;
      let rgbArr = color?.rgb;
      let hsvArr = color.hsv;
      formData.color = {
        hex: hexValue,
        rgb: { r: rgbArr?.r, g: rgbArr.g, b: rgbArr.b },
        hsv: { h: hsvArr.h, s: hsvArr.s, v: hsvArr.v }
      };

      setLayerDetail(formData);

      closeHandler(false);
      submitHandler(formData);
    },
    [color, closeHandler, setLayerDetail, submitHandler]
  );
  const getButtons = () => {
    let stacks = [];
    for (let i = 0; i < 6; i++) {
      let colors = [];
      for (let j = i * 60; j <= i * 60 + 60; j = j + 6) {
        let hexValue = hsl.hex([j, 100, 50]);

        let rgbArr = hex.rgb(hexValue);
        let hsvArr = hex.hsv(hexValue);

        colors.push({ colr: j, hex: hexValue, rgb: rgbArr, hsv: hsvArr });
      }
      stacks.push({ stack: i, col: colors });
    }
    return (
      <Table>
        {stacks.map((stack, index) => (
          <tr>
            {stack.col.map(col => (
              <td
                onClick={_ =>
                  setColor({
                    hex: '#' + col.hex,
                    rgb: { r: col.rgb[0], g: col.rgb[1], b: col.rgb[2] },
                    hsv: { h: col.hsv[0], s: col.hsv[1], v: col.hsv[2] }
                  })
                }
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
    <ActionDialog
      title={'Analysis'}
      closeHandler={closeHandler}
      element={
        <>
          <Container>
            <Row className={'py-2'}>
              <Form.Group>
                <Form.Label>Layer Name</Form.Label>
                <Form.Control type={'text'} {...register('labelName', { required: 'Layer Label is required' })} />
                {errors.labelName && <Form.Label className="text-danger">{errors.labelName.message}</Form.Label>}
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
              <div style={{ width: 100, height: 100, backgroundColor: color.hex }} />
            </Row>
          </Container>
        </>
      }
      footer={
        <Button type={'submit'} onClick={handleSubmit(setLayerDetailSubmit)}>
          Search
        </Button>
      }
    />
  );
};
export default SimulationAnalysisPanel;
