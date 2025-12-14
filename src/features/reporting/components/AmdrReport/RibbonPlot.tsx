import {useEffect, useState} from 'react';
import Plotly, {Data, Layout} from 'plotly.js';
import Plot from "react-plotly.js";

export interface Coords {
  x: number[];
  y: number[];
  z: number[];
  name:string;
}

export interface LayoutObj{
  xTickvals:number[];
  xTickNames:string[];
  yTickvals:number[];
  yTickNames:string[];
  lineWidth:number | undefined;
  isVertical: boolean;

}
export interface RibbonData{
  coords: Coords[];
  layout: LayoutObj;
  title: string;
}
interface Props {
  data: RibbonData;
}

const RibbonPlot = ({data}: Props) => {

  const [traces, setTraces] = useState<Data[]>([]);
  const [layout, setLayout] = useState<Partial<Plotly.Layout>>({})


  const isScatter3D = (trace: Data): trace is Data & { x: number[], y: number[], z: number[] } => {
    return trace.type === 'scatter3d' && Array.isArray(trace.x) && Array.isArray(trace.y) && Array.isArray(trace.z);
  };

  const isZeroLengthLine = (trace: Data) => {
    if (!isScatter3D(trace)) return false; // only process scatter3d

    const dz = Math.max(...trace.z) - Math.min(...trace.z);
    const dx = Math.max(...trace.x) - Math.min(...trace.x);
    const dy = Math.max(...trace.y) - Math.min(...trace.y);

    return dz === 0 && dx === 0 && dy === 0;
  };


  useEffect(() => {
    const traces: Data[] = data.coords.map((d: any) => {
      let obj:Data = {
        x: d.x,
        y: d.y,
        z: d.z,
        colorscale: d.colorscale,
        type: 'scatter3d',
        mode: "lines",
        showscale: false,
        name: d.name
      };
      if (data.layout.lineWidth && obj ){
        obj.line = {};
        obj.line.width = data.layout.lineWidth

        if (isZeroLengthLine(obj) && data.layout.isVertical){
          obj.mode = "markers"
        }
      }

      return obj
    });

    console.log(JSON.stringify(traces))

    const layout: Partial<Layout> = {
      scene: {
        xaxis: { title: {text: 'Year'},
          tickvals: data.layout.xTickvals,
          ticktext: data.layout.xTickNames},
        yaxis: { title:  {text: 'Location'} ,tickvals: data.layout.yTickvals,
          ticktext: data.layout.yTickNames},
        zaxis: { title:  {text: 'Prevalence'} },
      },
      title:  {text: data.title}
    };

    setTraces(traces);
    setLayout(layout);
  }, [data]);

  return <div style={{width: '100%', height: '80vh'}}>
    <Plot
        data={traces}
        layout={layout}
        style={{width: '100%', height: '100%'}}
        useResizeHandler
        config={{displayModeBar:true,displaylogo:false}}
    />;
  </div>

};

export default RibbonPlot;
