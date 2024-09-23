import { invoke } from "@tauri-apps/api/tauri";
import { useEffect, useState } from "react";

import { ReactFlow, ReactFlowProvider, Node, Edge } from "reactflow";

import "reactflow/dist/style.css";
import NodeStyle from "./NodeStyle";

const nodeType: any = {
  custom: NodeStyle,
};
//再帰的
type DirNode = {
  name: string;
  path: string;
  last_modified: number;
  children: DirNode[];
};

const getNodeOpacity = (
  // lastModified: number,
  // monthsAgo: number,
  baseOpacity: number
) => {
  const opacity = baseOpacity;
  console.log(`Calculated opacity: ${opacity}`);
  return Math.max(baseOpacity, Math.min(1, opacity));
};

//最初はparentId はnull となる
const buildFlowData = (
  dirNode: DirNode,
  parentId: string | null = null,
  level = 0,
  side = 0,
  // monthsAgo: number,
  baseOpacity: number
) => {
  let nodes: Node[] = [];
  let edges: Edge[] = [];
  //親ID があれば 親IDとくっつける　なしならそのまま
  const nodeId = parentId ? `${parentId}-${dirNode.name}` : dirNode.name;
  const opacity = getNodeOpacity(baseOpacity);

  //
  nodes.push({
    id: nodeId,
    type: "custom",
    position: { x: side * 150, y: level * 70 },
    data: { label: dirNode.name, path: dirNode.path, opacity: opacity },
    //  style: { opacity: opacity },
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
      side + index + 1,
      // monthsAgo,
      baseOpacity
    );

    nodes = nodes.concat(childNodes);
    edges = edges.concat(childEdges);
  });

  return { nodes, edges };
};

export const Apptreeav = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  // const [monthsAgo, setMonthsAgo] = useState<number>(12);
  // const [dirStructure, setDirStructure] = useState<DirNode | null>(null);
  const baseOpacity = 1;
  const onNodeClick = (_event: React.MouseEvent, node: Node) => {
    // const onNodeClick = (event: React.MouseEvent, node: Node) => {
    console.log("Node clicked:", node);

    const dirPath = node.data.path;

    if (dirPath) {
      invoke("open_directory", { path: dirPath }).catch((error) =>
        console.error("faild", error)
      );
    }
  };
  // const handleMonthsAgoChange = (event: Event, newValue: number | number[]) => {

  async function excuteCommands() {
    try {
      const response = await invoke<string>("tree");
      const parsedDirStructure: DirNode = JSON.parse(response);
      // setDirStructure(parsedDirStructure);
      // const dirStructure: DirNode = JSON.parse(response);
      const { nodes, edges } = buildFlowData(
        parsedDirStructure,
        null,
        0,
        0,
        // monthsAgo,
        baseOpacity
      );
      setNodes(nodes);
      setEdges(edges);
    } catch (error) {
      console.error("Error fetching directory structure:", error);
      // ユーザーにエラーメッセージを表示するなどの処理
    }
  }
  useEffect(() => {
    excuteCommands();
  }, []);

  return (
    <ReactFlowProvider>
      <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
        <div style={{ width: "100vw", height: "100vh" }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodeClick={onNodeClick}
            nodeTypes={nodeType}
          />
        </div>
      </div>
    </ReactFlowProvider>
  );
};
