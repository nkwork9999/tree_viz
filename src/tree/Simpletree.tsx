import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import ReactFlow, { MiniMap, Controls, Background } from "reactflow";
import "reactflow/dist/style.css";

type Node = {
  id: string;
  position: { x: number; y: number };
  data: { label: string };
};

type Edge = {
  id: string;
  source: string;
  target: string;
};
const Simpletree = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    invoke<string>("tree2")
      .then((response) => {
        const treeData = JSON.parse(response);
        const { nodes, edges } = buildFlowData(treeData);
        setNodes(nodes);
        setEdges(edges);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const buildFlowData = (
    treeData: any,
    parentId: string | null = null,
    level = 0
  ) => {
    let nodes: Node[] = [];
    let edges: Edge[] = [];

    const nodeId = `${parentId !== null ? parentId + "-" : ""}${treeData.name}`;
    nodes.push({
      id: nodeId,
      position: { x: level * 200, y: nodes.length * 100 },
      data: { label: treeData.name },
    });

    if (parentId !== null) {
      edges.push({
        id: `e-${parentId}-${nodeId}`,
        source: parentId,
        target: nodeId,
      });
    }

    treeData.children.forEach((child: any) => {
      const { nodes: childNodes, edges: childEdges } = buildFlowData(
        child,
        nodeId,
        level + 1
      );
      nodes = nodes.concat(childNodes);
      edges = edges.concat(childEdges);
    });

    return { nodes, edges };
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow nodes={nodes} edges={edges} />
    </div>
  );
};

export default Simpletree;
