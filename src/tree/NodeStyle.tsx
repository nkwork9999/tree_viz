import { Handle, Position } from "reactflow";

//
const NodeStyle = ({ data }: any) => {
  // const handleSliderChange = (event: any, newValue: number) => {
  //   setOpacity(newValue);
  // };
  return (
    <div
      style={{
        width: 100,
        padding: 16,
        background: `rgba(94, 156, 211,${data.opacity})`, // 背景色をrgbaで設定し、透明度を反映
        // border: "1px solid #ddd",
        // opacity: data.opacity,
        borderRadius: "10px",
        clipPath: "polygon(0 0, 50% 0, 75% 15%, 100% 15%, 100% 100%, 0% 100%)", // Macフォルダの形状を再現
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
  );
};

export default NodeStyle;
