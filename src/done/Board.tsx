import { NodeComponent } from "./Flow";
import { useState } from "react";

type Node = {
  id: string;
  position: Position;
};
type Position = {
  x: number;
  y: number;
};
export function Board() {
  const [nodes, setNodes] = useState<Node[]>([
    {
      id: "node1",
      position: { x: 100, y: 100 },
    },
    {
      id: "node2",
      position: { x: 400, y: 100 },
    },
  ]);

  return (
    <>
      <div className="bord">
        {nodes.map((node) => (
          <NodeComponent key={node.id} id={node.id} position={node.position} />
        ))}
      </div>
    </>
  );
}
