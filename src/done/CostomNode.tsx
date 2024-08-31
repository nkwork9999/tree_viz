import { Node, NodeProps } from "reactflow";

type NodeData = {
  value: number;
};

type CustomNode = Node<NodeData>;

function CustomNode({ data }: NodeProps<NodeData>) {
  return <div>big number:{data.value}</div>;
}
