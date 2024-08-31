import { invoke } from "@tauri-apps/api";
import { useState, useEffect } from "react";
import { ReactFlow, ReactFlowProvider, Node, Edge } from "reactflow";
import "reactflow/dist/style.css";

interface DirNode {
  name: string;
  path: string;
  last_modified: number;
  children: DirNode[];
}

//最初はparentId はnull となる
const buildFlowData = (
  dirNode: DirNode,
  parentId: string | null = null,
  level = 0,
  side = 0
) => {
  let nodes: Node[] = [];
  let edges: Edge[] = [];
  //親ID があれば 親IDとくっつける　なしならそのまま
  const nodeId = parentId ? `${parentId}-${dirNode.name}` : dirNode.name;

  //
  nodes.push({
    id: nodeId,
    type: "custom",
    position: { x: side * 150, y: level * 70 },
    data: { label: dirNode.name },
  });

  if (parentId) {
    edges.push({
      id: `e-${parentId}-${nodeId}`,
      source: parentId,
      target: nodeId,
    });
  }

  //indexでnameごとにディレクトリごとにずらす
  dirNode.children.forEach((child: any, index: any) => {
    const { nodes: childNodes, edges: childEdges } = buildFlowData(
      child,
      nodeId,
      level + 2,
      side + index + 1
    );

    nodes = nodes.concat(childNodes);
    edges = edges.concat(childEdges);
  });

  return { nodes, edges };
};

// const nodeTypes = {
//   custom: CustomNodeComponent // CustomNodeComponentはカスタムノードコンポーネントの例
// };

export const Apptree2 = () => {
  const [nodes, setNodes] = useState<Node[]>();
  const [edges, setEdges] = useState<Edge[]>();

  useEffect(() => {
    excuteCommands();
  }, []);

  async function excuteCommands() {
    try {
      const response = await invoke<string>("tree");
      const dirStructure: DirNode = JSON.parse(response);
      const { nodes, edges } = buildFlowData(dirStructure);
      setNodes(nodes);
      setEdges(edges);
    } catch (error) {
      console.error("Error fetching directory structure:", error);
      // ユーザーにエラーメッセージを表示するなどの処理
    }
  }

  return (
    <ReactFlowProvider>
      <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
        <div style={{ width: "100%", height: "100%" }}>
          <ReactFlow nodes={nodes} edges={edges} />
        </div>
        {/* コントロールパネルなど */}
      </div>
    </ReactFlowProvider>
  );
};

export default Apptree2;
