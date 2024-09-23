import { Handle, Position } from "reactflow";

interface NodeData {
  label: string;
  opacity: number;
}

const NodeStyle = ({ data }: { data: NodeData }) => {
  const opacityPercentage = Math.round(data.opacity * 100);

  return (
    <div
      className={`w-32 p-4 rounded-lg shadow-lg transition-all duration-300 ease-in-out
                    bg-gradient-to-br from-blue-400 to-blue-600
                    transform hover:scale-105 hover:shadow-xl`}
      style={{
        clipPath: "polygon(0 0, 50% 0, 75% 15%, 100% 15%, 100% 100%, 0% 100%)",
        opacity: data.opacity,
      }}
    >
      <div className="relative z-10">
        <div className="text-lg font-semibold text-white break-words">
          {data.label}
        </div>
        <div className="text-xs text-blue-100 mt-1">
          Relevance: {opacityPercentage}%
        </div>
      </div>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-blue-300"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-blue-300"
      />
    </div>
  );
};

export default NodeStyle;
