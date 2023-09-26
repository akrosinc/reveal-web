import { ActionDialog } from '../../../../components/Dialogs';
import { Button, Container, Form, Row, Table } from 'react-bootstrap';

import React, { BaseSyntheticEvent, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AnalysisLayer } from '../Simulation';
import { hex, hsl } from 'color-convert';
import { Color } from 'react-color-palette';
import { getBackgroundStyle } from '../SimulationMapView/SimulationMapView';
import SimulationAnalysisPanelContent from './SimulationAnalysisPanelContent';

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
  const [color] = useState<Color>(INITIAL_FILL_COLOR);
  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors }
  } = useForm<AnalysisLayer>();

  const setLayerDetailSubmit = useCallback(
    (formData: AnalysisLayer, e: BaseSyntheticEvent | undefined) => {
      let formVal: any = formData;

      let rgb = hex.rgb(formVal['colorHex'].replace('#', ''));
      let hsv = hex.hsv(formVal['colorHex'].replace('#', ''));

      let color: Color = {
        hex: formVal['colorHex'],
        rgb: { r: rgb[0], g: rgb[1], b: rgb[2] },
        hsv: { h: hsv[0], s: hsv[1], v: hsv[2] }
      };

      formData.color = color;

      setLayerDetail(formData);

      closeHandler(false);
      submitHandler(formData);
    },
    [color, closeHandler, setLayerDetail, submitHandler]
  );

  return (
    <ActionDialog
      title={'Analysis'}
      closeHandler={closeHandler}
      element={
        <SimulationAnalysisPanelContent
          formControls={{
            handleSubmit,
            register,
            setValue,
            formState: { errors }
          }}
        />
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
