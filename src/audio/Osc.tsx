import React from "react";
import { Handle, Position } from "@xyflow/react";
import { shallow } from "zustand/shallow";
import { useStore } from "./store";

//zustandという状態管理ライブリを使用して特定のアクションを取得する

const selector = (id: any) => (store: any) => ({
  setFrequency: (e: any) =>
    store.updateNode(id, { frequency: +e.target.value }),
  setType: (e: any) => store.updateNode(id, { type: e.target.value }),
});

type OscProps = {
  id: string;
  data: any;
};

//引数にanyを設定するには外で作成してつける
export const Osc: React.FC<OscProps> = ({ id, data }) => {
  //nodragを入れないとreactflowにインターセプトされる
  const { setFrequency, setType } = useStore(selector(id), shallow);
  return (
    <div>
      <div>
        <p>Oscillator Node</p>

        <label>
          <span>Frequency</span>
          <input
            className="nodrag"
            type="range"
            min="10"
            max="1000"
            value={data.frequency}
            onChange={setFrequency}
          />
          <span>{data.frequency}Hz</span>
        </label>

        <label>
          <span>Waveform</span>
          <select className="nodrag" value={data.type} onChange={setType}>
            <option value="sine">sine</option>
            <option value="triangle">triangle</option>
            <option value="sawtooth">sawtooth</option>
            <option value="square">square</option>
          </select>
        </label>

        <Handle type="source" position={Position.Bottom} />
      </div>
    </div>
  );
  //handle ノードに接続ハンドルを追加する
  //接続ハンドルのタイプ指定
  //source は他のノードに接続される側のハンドルである
  //position接続ハンドルの位置
  //position = "bottomは存在しない　handlerからインポートしてPosition.Bottomにする"
};
