import { invoke } from "@tauri-apps/api/tauri";
import { useEffect, useState } from "react";
import ReactFlow, {
  ReactFlowProvider,
  Node,
  Edge,
  Background,
  Controls,
} from "reactflow";
import "reactflow/dist/style.css";
import NodeStyle from "./NodeStyle";

const nodeTypes = {
  custom: NodeStyle,
};

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
  if (monthsDiff > monthsAgo) {
    return baseOpacity;
  }
  const opacity =
    baseOpacity + (1 - baseOpacity) * (1 - monthsDiff / monthsAgo);
  return Math.max(baseOpacity, Math.min(1, opacity));
};

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
  const nodeId = parentId ? `${parentId}-${dirNode.name}` : dirNode.name;
  const opacity = getNodeOpacity(dirNode.last_modified, monthsAgo, baseOpacity);

  nodes.push({
    id: nodeId,
    type: "custom",
    position: { x: side * 180, y: level * 100 },
    data: { label: dirNode.name, path: dirNode.path, opacity: opacity },
  });

  if (parentId) {
    edges.push({
      id: `e-${parentId}-${nodeId}`,
      source: parentId,
      target: nodeId,
    });
  }

  dirNode.children.forEach((child, index) => {
    const { nodes: childNodes, edges: childEdges } = buildFlowData(
      child,
      nodeId,
      level + 1,
      side + index,
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const baseOpacity = 0.3;

  const onNodeClick = (_event: React.MouseEvent, node: Node) => {
    const dirPath = node.data.path;
    if (dirPath) {
      invoke("open_directory", { path: dirPath }).catch((error) =>
        console.error("Failed to open directory", error)
      );
    }
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
      setNodes(updatedNodes);
      setEdges(updatedEdges);
    }
  };

  const handleCommandExecution = async () => {
    setIsLoading(true);
    try {
      const response = await invoke<string>("tree");
      const parsedDirStructure: DirNode = JSON.parse(response);
      setDirStructure(parsedDirStructure);
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
      // Show error message to user
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (dirStructure) {
      updateNodesOpacity(monthsAgo);
    }
  }, [dirStructure, monthsAgo]);

  const timeRanges = [
    { label: "1M", value: 1 },
    { label: "3M", value: 3 },
    { label: "6M", value: 6 },
    { label: "1Y", value: 12 },
  ];

  return (
    <ReactFlowProvider>
      <div className="relative w-screen h-screen bg-gray-100">
        <div className="absolute top-4 left-4 z-10 bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Directory Visualizer</h2>
          <button
            onClick={handleCommandExecution}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-200"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Visualize Directory"}
          </button>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Time Range:
            </p>
            <div className="flex space-x-2">
              {timeRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setMonthsAgo(range.value)}
                  className={`py-1 px-3 rounded text-sm ${
                    monthsAgo === range.value
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
};
