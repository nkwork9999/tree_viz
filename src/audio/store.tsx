import { applyNodeChanges, applyEdgeChanges } from "reactflow";
import { nanoid } from "nanoid";
import create, { createWithEqualityFn } from "zustand/traditional";
import { updateAudioNode, isRunning, toggleAudio,createAudioNode } from "./audio";

type State = {
  nodes: any[];
  edges: any[];
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  addEdge: (data: any) => void;
  isRunning: any;
};

createAudioNode(type){
  const id = nanoid();
  switch(type){
    case 'osc' :{
      const data ={ frequency: 440,type:'sine'}
      const position ={x:0,y:0};

      createAudioNode(id,type,data);
      set({nodes:[...get().nodes,{id,type,data,position}]})

      break;
    }
  

  case 'amp' :{
    const data = {gain:0.5};
    const position = { x:0,y:0};

    createAudioNode(id,type,data);
    set({nodes:[...get.nodes,{id,type,data,position}]});

    break;
  }
}
//set:selector,get:shallow
//equality functionに基づいて変更検出
//createWithEqualityFnでzustandストアを作成している
//特定の条件で状態の変更を検出
export const useStore = createWithEqualityFn<State>((set, get) => ({
  //初期状態　空
  isRunning: isRunning(),

  toggleAudio().then(() => {
    set({ isRunning: isRunning() });
  }),

  nodes: [
    {
      id: "a",
      data: { frequency: 220, type: "square" },
      position: { x: 0, y: 0 },
    },
    { id: "b", data: { label: "gain" }, position: { x: 50, y: 50 } },
    { id: "c", data: { label: "output" }, position: { x: -50, y: 100 } },
  ],
  edges: [],
  //変更ノードの情報を受け取る
  //applyNodeChangesで現在のノードへの変更
  onNodesChange(changes: any) {
    set({
      //オブジェクト型はunknownであるget().nodes
      //get関数の戻り値の型を指定する必要がある。
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  //zustandのonEdgesChange　エッジ変更時に呼ばれる
  //changesは変更内容
  //setはstoreの状態の更新
  //applyEdgeChanges はreactflowライブラリ　changesとエッジリストget().edgesを引数
  //変更後のエッジリストを返している
  onEdgesChange(changes: any) {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  //新規エッジができた時にどうするか nanoid　で任意のidを発行する
  //6文字のid
  //...dataですべてのデータを取得

  addEdge(data) {
    const id = nanoid(6);
    const edge = { id, ...data };
    //ストアの状態を更新している
    //get関数で現在のエッジリストを取得する
    //edgeを既存のエッジリストの先頭に
    set({ edges: [edge, ...get().edges] });
  },

  updateNode(id, data) {
    updateAudioNode(id, data);

    set({
      nodes: get().nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
      ),
    });
  },
}));
