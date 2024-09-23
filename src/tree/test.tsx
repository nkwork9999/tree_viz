import { invoke } from "@tauri-apps/api/tauri";
import { useEffect, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Node,
  Edge,
  OnNodeClick,
} from "reactflow";
import "reactflow/dist/style.css";
import NodeStyle from "./NodeStyle";
import { Slider, TextField, Box } from "@mui/material";

const nodeType = {
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
): number => {
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
): { nodes: Node[]; edges: Edge[] } => {
  let nodes: Node[] = [];
  let edges: Edge[] = [];
  const nodeId = parentId ? `${parentId}-${dirNode.name}` : dirNode.name;
  const opacity = getNodeOpacity(dirNode.last_modified, monthsAgo, baseOpacity);

  nodes.push({
    id: nodeId,
    type: "custom",
    position: { x: side * 150, y: level * 70 },
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

export const Apptreeav: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [monthsAgo, setMonthsAgo] = useState<number>(12);
  const [dirStructure, setDirStructure] = useState<DirNode | null>(null);
  const [directorySearchQuery, setDirectorySearchQuery] = useState<string>("");
  const [fileSearchQuery, setFileSearchQuery] = useState<string>("");
  const baseOpacity = 1;

  const onNodeClick: OnNodeClick = (_event, node) => {
    console.log("Node clicked:", node);
    const dirPath = node.data.path;
    if (dirPath) {
      invoke("open_directory", { path: dirPath }).catch((error) =>
        console.error("failed", error)
      );
    }
  };

  const handleMonthsAgoChange = (
    _event: Event,
    newValue: number | number[]
  ) => {
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
      setNodes(updatedNodes);
      setEdges(updatedEdges);
    }
  };

  const handleCommandExecution = async () => {
    const userConfirmed = await window.confirm("treeコマンドを実行しますか？");
    if (userConfirmed) {
      executeCommands();
    }
  };

  const executeCommands = async () => {
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
    }
  };

  const filterNodes = (
    nodes: Node[],
    directoryQuery: string,
    fileQuery: string
  ): Node[] => {
    return nodes.filter((node) => {
      const isDirectory = !node.data.label.includes(".");
      if (isDirectory) {
        return node.data.label
          .toLowerCase()
          .includes(directoryQuery.toLowerCase());
      } else {
        return node.data.label.toLowerCase().includes(fileQuery.toLowerCase());
      }
    });
  };

  useEffect(() => {
    if (dirStructure) {
      updateNodesOpacity(monthsAgo);
    }
  }, [dirStructure]);

  const filteredNodes = filterNodes(
    nodes,
    directorySearchQuery,
    fileSearchQuery
  );

  return (
    <ReactFlowProvider>
      <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
        <div style={{ width: "100vw", height: "100vh" }}>
          <ReactFlow
            nodes={filteredNodes}
            edges={edges}
            onNodeClick={onNodeClick}
            nodeTypes={nodeType}
          />
        </div>

        <Box
          sx={{
            position: "absolute",
            top: "10px",
            right: "10px",
            zIndex: 10,
            backgroundColor: "white",
            padding: "10px",
            borderRadius: "5px",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
            width: "250px",
          }}
        >
          <button onClick={handleCommandExecution}>Execute tree command</button>

          <TextField
            label="Search Directories"
            variant="outlined"
            fullWidth
            margin="normal"
            value={directorySearchQuery}
            onChange={(e) => setDirectorySearchQuery(e.target.value)}
          />

          <TextField
            label="Search Files"
            variant="outlined"
            fullWidth
            margin="normal"
            value={fileSearchQuery}
            onChange={(e) => setFileSearchQuery(e.target.value)}
          />

          <div>
            <p>Base Opacity:</p>
            <Slider
              value={monthsAgo}
              min={0}
              max={12}
              step={2}
              onChange={handleMonthsAgoChange}
              valueLabelDisplay="auto"
              aria-labelledby="months-ago-slider"
            />
          </div>
        </Box>
      </div>
    </ReactFlowProvider>
  );
};
