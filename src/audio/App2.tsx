import React from "react";
import ReactFlow, { Panel, ReactFlowProvider, Background } from "reactflow"; //Backgroundは背景

import { shallow } from "zustand/shallow"; //zustand浅い比較　軽量な状態管理
import { invoke } from "@tauri-apps/api/tauri";
import { useStore } from "./store"; //カスタムフック
import "reactflow/dist/style.css"; //デフォルトの見た目　必要
import { Osc } from "./Osc";

//オブジェクトマッピング　key value型
//reactやzustandで使用される

const selector = (store: any) => ({
  nodes: store.nodes,
  edges: store.edges,
  onNodesChange: store.onNodesChange,
  onEdgesChange: store.onEdgesChange,
  addEdge: store.addEdge,
  createNode: store.createNode,
});
const context = new window.AudioContext(); // 型と互換性を確保　　中核

const nodeTypes = {
  osc: Osc,
};
const osc = context.createOscillator(); //定常波を生成するオシレーター
const amp = context.createGain(); //gainを作成

// osc.connect(amp);　　　　　　　      //osc→amp　の接続となる。
// amp.connect(context.destination); //amp→オーディオコンテクストdestinationに(ユーザー出力)

// osc.start();　　　　　　　　　　　　　//音が出る

//reactイベントハンドラー　を受け取ってマウス位置によってパラメーター計算する
const updateValues = (e: React.MouseEvent<HTMLDivElement>) => {
  //e.clientXはピクセルx位置を取ってきている。　ブラウザウインドウサイズ
  //1/1000の単位　合わせ
  const freq = (e.clientX / window.innerWidth) * 1000;
  const gain = e.clientY / window.innerHeight;
  //オシレータの周波数値をfreqに設定している。
  //gainノードのゲインを設定
  osc.frequency.value = freq;
  amp.gain.value = gain;
};
function excuteCommands() {
  invoke("simple_command");
}

//停止と再生のボタン
const toggleAudio = () => {
  //context.stateが一時停止なら
  if (context.state === "suspended") {
    //resumeで再開する
    context.resume();
  } else {
    context.suspend();
  }
};
//React.FCはリアクト関数のコンポーネントの型
const App2: React.FC = () => {
  //selectorでstoreから取る,shallowが際レンダリングを防ぐ
  //useStoreからエラー　zustand/traditionalモジュールからcreateWithEqualityFnにする

  const store = useStore(selector, shallow);
  return (
    <div>
      <ReactFlowProvider>
        <div style={{ width: "100vw", height: "100vh" }}>
          <ReactFlow
            nodes={store.nodes}
            nodeTypes={nodeTypes}
            edges={store.edges}
            onNodesChange={store.onNodesChange}
            onEdgesChange={store.onEdgesChange}
            onConnect={store.addEdge}
            fitView
          >
            <Background />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
      <button onClick={excuteCommands}>simple command</button>
    </div>
  );
};

export default App2;
