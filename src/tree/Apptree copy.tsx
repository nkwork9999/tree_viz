import { invoke } from "@tauri-apps/api/tauri";
import React, { useState } from "react";

import { ReactFlow } from "@xyflow/react";

import "@xyflow/react/dist/style.css";
const initialNodes = [
  { id: "1", position: { x: 0, y: 0 }, data: { label: "1" } },
  { id: "2", position: { x: 0, y: 100 }, data: { label: "2" } },
];
const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

export const Apptree = () => {
  const [directoryStructure, setDirectoryStructure] = useState("");

  function excuteCommands() {
    invoke<string>("tree2")
      .then((response) => {
        setDirectoryStructure(response);
        const dirStructure = JSON.parse(response);
      })
      .catch((error) => {
        console.error(error);
        setDirectoryStructure("Error: " + error);
      });
  }

  return (
    <div>
      <p>Apptree</p>
      <button onClick={excuteCommands}>simple command</button>
      <div style={{ width: "100vw", height: "100vh" }}>
        <ReactFlow nodes={initialNodes} edges={initialEdges} />
      </div>
      {/* <pre>{directoryStructure}</pre> */}
    </div>
  );
};
