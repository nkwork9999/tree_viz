import React, { useState } from "react";
import { motion } from "framer-motion";
import { Handle, Position } from "reactflow";

//
const CustomNode = ({ data, style, onExpandComplete }: any) => {
  //レベルが高いほどノードは深く　レベルが高いほど透明
  // const initialOpacity = Math.max(1 - data.level * 0.3, 0.1);
  // const [opacity, setOpacity] = useState(initialOpacity);
  const [opacity, setOpacity] = useState(1);
  const handleSliderChange = (event: any, newValue: number) => {
    setOpacity(newValue);
  };
  return (
    <motion.div
      initial={{ x: 0, y: 0, scale: 0, opacity: 0 }} // 初期位置を中心に、スケールと透明度も最小
      animate={{ x: data.x, y: data.y, scale: 1, opacity: 1 }} // 最終的に各ノードの位置に移動し、スケールと透明度を元に戻す
      transition={{ duration: 0.9, delay: data.level * 0.1 }} // レベルに応じて遅延を設定
      style={{
        ...style,
        position: "absolute", // 位置を絶対指定　位置固定？
      }}
    >
      <div
        style={{
          width: 100,
          padding: 16,
          background: `rgba(94, 156, 211, ${opacity})`, // 背景色をrgbaで設定し、透明度を反映
          // border: "1px solid #ddd",
          borderRadius: "10px",
          clipPath:
            "polygon(0 0, 50% 0, 75% 15%, 100% 15%, 100% 100%, 0% 100%)", // Macフォルダの形状を再現
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", // 影を追加して浮いているように見せる
        }}
      >
        <div
          //長い単語を見返すword wrap 100で折る
          style={{ fontSize: "20px", wordWrap: "break-word", color: "#fff" }}
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
