import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/shell";
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Slider, Checkbox, FormControlLabel } from "@mui/material";
// import { Player } from "@lottiefiles/react-lottie-player";
// import Animation from "./animation.json";

import { ReactFlow, ReactFlowProvider, Node, Edge } from "reactflow";

import "reactflow/dist/style.css";
import CustomNode from "./CustomNode";
import "./blink.css";

const ONE_MONTH_IN_SECONDS = 30 * 24 * 60 * 60;
const marks = [
  { value: 0.1, label: "0.1" },
  { value: 0.3, label: "0.3" },
  { value: 0.5, label: "0.5" },
  { value: 0.7, label: "0.7" },
  { value: 1.0, label: "1.0" },
];

const getNodeStyle = (
  lastModified: number,
  opacity: number,
  onlyHighlightRecent: boolean
): React.CSSProperties => {
  const currentTime = Math.floor(Date.now() / 1000);
  const isOlderThanOneMonth = currentTime - lastModified > ONE_MONTH_IN_SECONDS;

  console.log("onlyHighlightRecent:", onlyHighlightRecent);
  console.log("isOlderThanOneMonth:", isOlderThanOneMonth);

  // チェックボックスがオンで、かつ古いノードの場合はオレンジ色に変更
  const backgroundColor =
    onlyHighlightRecent && isOlderThanOneMonth ? "orange" : "white";

  console.log("backgroundColor:", backgroundColor);

  return {
    backgroundColor: backgroundColor,
    border: "1px solid black",
    color: "white",
    padding: "10px",
    borderRadius: "5px",
    animation: isOlderThanOneMonth ? "blink 1s linear infinite" : "none",
    opacity: opacity,
  };
};

const onNodeClick = (event: React.MouseEvent, node: Node) => {
  console.log("Node clicked:", node);

  const dirPath = node.data.path;

  if (dirPath) {
    invoke("open_directory", { path: dirPath }).catch((error) =>
      console.error("faild", error)
    );
  }
};

const nodeTypes = {
  custom: CustomNode,
};

type DirNode = {
  name: string;
  path: string;
  last_modified: number;
  children: DirNode[];
};

const buildFlowData = (
  dirNode: DirNode,
  parentId: string | null = null,
  level = 0,
  angleStart = 0,
  angleEnd = 2 * Math.PI,
  opacity: number,
  onlyHighlightRecent: boolean
) => {
  let nodes: Node[] = [];
  let edges: Edge[] = [];
  const nodeId = parentId ? `${parentId}-${dirNode.name}` : dirNode.name;

  const radius = level * 200;
  const angle = (angleStart + angleEnd) / 2;
  const x = radius * Math.cos(angle);
  const y = radius * Math.sin(angle);

  nodes.push({
    id: nodeId,
    type: "custom",
    position: { x: 0, y: 0 },
    data: {
      label: `${dirNode.name}`,
      path: dirNode.path,
      level: level,
      x: x,
      y: y,
      opacity: opacity,
    },
    style: getNodeStyle(dirNode.last_modified, opacity, onlyHighlightRecent),
  });

  if (parentId) {
    edges.push({
      id: `e-${parentId}-${nodeId}`,
      source: parentId,
      target: nodeId,
    });
  }

  const numChildren = dirNode.children.length;
  dirNode.children.forEach((child, index) => {
    const childAngleStart =
      angleStart + (index * (angleEnd - angleStart)) / numChildren;
    const childAngleEnd =
      angleStart + ((index + 1) * (angleEnd - angleStart)) / numChildren;
    const { nodes: childNodes, edges: childEdges } = buildFlowData(
      child,
      nodeId,
      level + 1,
      childAngleStart,
      childAngleEnd,
      opacity,
      onlyHighlightRecent
    );

    nodes = nodes.concat(childNodes);
    edges = edges.concat(childEdges);
  });

  return { nodes, edges };
};

export const Appfireworks = () => {
  const [nodes, setNodes] = useState<Node[]>();
  const [edges, setEdges] = useState<Edge[]>();
  const [opacity, setOpacity] = useState<number>(1);
  const [dirStructure, setDirStructure] = useState<DirNode | null>(null);
  const [onlyHighlightRecent, setOnlyHighlightRecent] = useState(false);
  const [resetOpacity, setResetOpacity] = useState(false); // 透明度リセット用の状態
  useEffect(() => {
    excuteCommands();
  }, []);

  function excuteCommands() {
    if (window.confirm("treeコマンドを実行しますか？")) {
      setTimeout(() => {
        invoke<string>("tree")
          .then((response) => {
            const dirStructure: DirNode = JSON.parse(response);
            setDirStructure(dirStructure);
            const { nodes, edges } = buildFlowData(
              dirStructure,
              null,
              0,
              0,
              2 * Math.PI,
              opacity,
              onlyHighlightRecent
            );
            setNodes(nodes);
            setEdges(edges);
          })
          .catch((error) => {
            console.error(error);
          });
      }, 1000);
    }
  }

  const onNodeDrag = (event: any, node: Node) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === node.id ? { ...n, position: node.position } : n))
    );
  };
  const handleResetOpacityChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setResetOpacity(event.target.checked);
  };
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOnlyHighlightRecent(event.target.checked);
    if (dirStructure) {
      const { nodes: updatedNodes } = buildFlowData(
        dirStructure,
        null,
        0,
        0,
        2 * Math.PI,
        opacity,
        event.target.checked
      );
      setNodes(updatedNodes);
    }
  };
  return (
    <ReactFlowProvider>
      <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
        <div style={{ width: "100%", height: "100%" }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            onNodeDrag={onNodeDrag}
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
          <Slider
            value={opacity}
            min={0.1}
            max={1}
            step={0.1}
            marks={marks}
            onChange={(event, newValue) => {
              setOpacity(newValue as number);
              if (dirStructure) {
                const { nodes: updatedNodes } = buildFlowData(
                  dirStructure,
                  null,
                  0,
                  0,
                  2 * Math.PI,
                  newValue as number,
                  onlyHighlightRecent
                );
                setNodes(updatedNodes);
              }
            }}
            valueLabelDisplay="auto"
            aria-labelledby="opacity-slider"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={onlyHighlightRecent}
                onChange={handleCheckboxChange}
                color="primary"
              />
            }
            label="Highlight Recent"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={resetOpacity}
                onChange={handleResetOpacityChange}
                color="secondary"
              />
            }
            label="Reset Opacity"
          />
        </div>
        {/* <div>
          <Player
            autoplay
            loop
            src={Animation}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              height: "200px",
              width: "200px",
              zIndex: 1,
              pointerEvents: "none",
            }}
          />
        </div> */}
      </div>
    </ReactFlowProvider>
  );
};
