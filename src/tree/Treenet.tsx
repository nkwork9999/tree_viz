import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import ReactFlow, { MiniMap, Controls, Background } from "reactflow";
import "@xyflow/react/dist/style.css";

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
export const Treenet = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    invoke<string>("tree1")
      .then((response) => {
        const dirTree = JSON.parse(response);
        const { nodes, edges } = buildFlowData(dirTree);
        setNodes(nodes);
        setEdges(edges);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const buildFlowData = (
    dirTree: any,
    parentId: string | null = null,
    level = 0
  ) => {
    let nodes: Node[] = [];
    let edges: Edge[] = [];

    const nodeId = `${parentId !== null ? parentId + "-" : ""}${dirTree.name}`;
    nodes.push({
      id: nodeId,
      position: { x: level * 200, y: nodes.length * 100 },
      data: { label: dirTree.name },
    });

    if (parentId !== null) {
      edges.push({
        id: `e-${parentId}-${nodeId}`,
        source: parentId,
        target: nodeId,
      });
    }

    dirTree.children.forEach((child: any) => {
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
