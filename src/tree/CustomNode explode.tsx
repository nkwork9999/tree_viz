import React from "react";
import { motion } from "framer-motion";
import { Handle, Position } from "reactflow";

const CustomNode = ({ data, style, colorIntensity }: any) => {
  const depthRatio = data.level / colorIntensity;
  const opacity = Math.max(0.1, 1 - depthRatio);
  return (
    <motion.div
      initial={{ x: 0, y: 0, scale: 0.5, opacity: 0 }} // 初期位置を中心に設定し、スケールと透明度を低くする
      animate={{ x: data.x, y: data.y, scale: 1, opacity: 1 }} // 最終的に各ノードの位置に移動し、スケールと透明度を上げる
      transition={{ duration: 0.8, delay: data.level * 0.1 }} // レベルに応じて遅延を設定
      style={{
        ...style,
        position: "absolute", // 位置を絶対指定することでフロー上での配置を調整
        opacity: opacity, // 透明度を設定
      }}
    >
      <div
        style={{
          width: 100,
          padding: 10,
          background: "#fff",
          border: "1px solid #ddd",
          borderRadius: 5,
        }}
      >
        <div
          style={{ fontSize: "10px", wordWrap: "break-word", color: "#000" }}
        >
          {data.label}
        </div>

        <Handle type="target" position={Position.Top} />
        <Handle type="source" position={Position.Bottom} />
      </div>
    </motion.div>
  );
};

export default CustomNode;
