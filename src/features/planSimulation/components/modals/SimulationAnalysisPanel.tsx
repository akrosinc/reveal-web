import { ActionDialog } from '../../../../components/Dialogs';
import { Button } from 'react-bootstrap';

import React, { BaseSyntheticEvent, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { AnalysisLayer } from '../Simulation';
import { hex } from 'color-convert';
import { Color } from 'react-color-palette';

import SimulationAnalysisPanelContent from './SimulationAnalysisPanelContent';

interface Props {
  closeHandler: (close: boolean) => void;
  setLayerDetail: (analysisLayer: AnalysisLayer) => void;
  submitHandler: (formData: AnalysisLayer) => void;
}

const SimulationAnalysisPanel = ({ closeHandler, setLayerDetail, submitHandler }: Props) => {
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
    [closeHandler, setLayerDetail, submitHandler]
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
