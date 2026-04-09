import { Color } from 'react-color-palette';
import { DualRangeSlider } from '../../../../components/DualRangeSlider/DualRangeSlider';
import SwitchButton from '../../../../components/SwitchButton/SwitchButton';
import { useState } from 'react';

interface DatasetProps {
  dataset: {
    name: string;
    color: Color;
  };
  color?: Color;
}

function Dataset({ dataset, color }: DatasetProps) {
  const [checked, setChecked] = useState(false);

  return (
    <>
      <SwitchButton
        id={dataset.name}
        isOn={checked}
        title={'Filter'}
        handleToggle={() => setChecked(!checked)}
        colorOne={color && color.hex}
      />
      <DualRangeSlider
        min={0}
        max={100}
        //step={25}
        defaultMinValue={25}
        defaultMaxValue={75}
        inactive={checked}
        color={checked ? color : undefined}
      />
    </>
  );
}

export default Dataset;
