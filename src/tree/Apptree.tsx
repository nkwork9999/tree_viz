import { invoke } from "@tauri-apps/api/tauri";
import React, { useEffect, useState } from "react";

import { ReactFlow, ReactFlowProvider, Node, Edge } from "reactflow";

import "reactflow/dist/style.css";
import NodeStyle from "./NodeStyle";
import { Checkbox, FormControlLabel, Slider } from "@mui/material";

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

const ONE_MONTH_IN_MS = 30 * 24 * 60 * 60 * 1000;

const getNodeOpacity = (
  lastModified: number,
  monthsAgo: number,
  baseOpacity: number
) => {
  const now = Date.now();
  const diff = now - lastModified;
  const monthsDiff = diff / ONE_MONTH_IN_MS;
  console.log(
    `Node: lastModified=${lastModified}, monthsDiff=${monthsDiff}, monthsAgo=${monthsAgo}`
  );
  if (monthsDiff > monthsAgo) {
    return baseOpacity;
  }
  const opacity =
    baseOpacity + (1 - baseOpacity) * (1 - monthsDiff / monthsAgo);
  console.log(`Calculated opacity: ${opacity}`);
  return Math.max(baseOpacity, Math.min(1, opacity));
};

//最初はparentId はnull となる
const buildFlowData = (
  dirNode: DirNode,
  parentId: string | null = null,
  level = 0,
  side = 0,
  monthsAgo: number,
  baseOpacity: number
) => {
  let nodes: Node[] = [];
  let edges: Edge[] = [];
  //親ID があれば 親IDとくっつける　なしならそのまま
  const nodeId = parentId ? `${parentId}-${dirNode.name}` : dirNode.name;
  const opacity = getNodeOpacity(dirNode.last_modified, monthsAgo, baseOpacity);

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
      monthsAgo,
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
  const [monthsAgo, setMonthsAgo] = useState<number>(12);
  const [dirStructure, setDirStructure] = useState<DirNode | null>(null);
  const baseOpacity = 1;
  const [highlightRecent, setHighlightRecent] = useState<boolean>(true);
  const onNodeClick = (event: React.MouseEvent, node: Node) => {
    console.log("Node clicked:", node);

    const dirPath = node.data.path;

    if (dirPath) {
      invoke("open_directory", { path: dirPath }).catch((error) =>
        console.error("faild", error)
      );
    }
  };
  const handleMonthsAgoChange = (event: Event, newValue: number | number[]) => {
    const months = Array.isArray(newValue) ? newValue[0] : newValue;
    setMonthsAgo(newValue as number);
    updateNodesOpacity(newValue as number);
  };

  const updateNodesOpacity = (months: number) => {
    if (dirStructure) {
      const { nodes: updatedNodes, edges: updatedEdges } = buildFlowData(
        dirStructure,
        null,
        0,
        0,
        months,
        baseOpacity
      );
      console.log("updated", updatedNodes);
      setNodes(updatedNodes);
      setEdges(updatedEdges);
    }
  };
  const handleCommandExecution = async () => {
    console.log("Confirm dialog is about to open.");
    const userConfirmed = await window.confirm("treeコマンドを実行しますか？");
    console.log("User confirmed:", userConfirmed);
    if (userConfirmed) {
      console.log("Executing commands...");
      excuteCommands();
    }
  };

  async function excuteCommands() {
    try {
      const response = await invoke<string>("tree");
      const parsedDirStructure: DirNode = JSON.parse(response);
      setDirStructure(parsedDirStructure);
      // const dirStructure: DirNode = JSON.parse(response);
      const { nodes, edges } = buildFlowData(
        parsedDirStructure,
        null,
        0,
        0,
        monthsAgo,
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
    if (dirStructure) {
      updateNodesOpacity(monthsAgo);
    }
  }, [dirStructure]);
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

        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            zIndex: 10,
            backgroundColor: "white",
            padding: "10px",
            borderRadius: "5px",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
            width: "250px", // スライダーの幅を調整
          }}
        >
          <button onClick={handleCommandExecution}>Execute tree command</button>

          <div>
            <p>Base Opacity:</p>
            <Slider
              value={monthsAgo}
              min={0}
              max={12}
              step={2}
              onChange={handleMonthsAgoChange}
              onChangeCommitted={(event, newValue) => {
                // スライダーの操作が完了したときに確実に更新
                handleMonthsAgoChange(event, newValue);
              }}
              valueLabelDisplay="auto"
              aria-labelledby="months-ago-slider"
            />
          </div>
        </div>
      </div>
    </ReactFlowProvider>
  );
};
