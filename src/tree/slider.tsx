import React, { useState } from "react";
import { Slider, Typography } from "@mui/material";
import { Appfireworks } from "./Appfireworkst"; // 既存のコンポーネント

export default function AppWithSlider() {
  const [depth, setDepth] = useState(1); // 初期の深さ

  const handleDepthChange = (event: any, newValue: any) => {
    setDepth(newValue);
  };

  return (
    <div>
      <Typography gutterBottom>ディレクトリの深さ: {depth}</Typography>
      <Slider
        value={depth}
        onChange={handleDepthChange}
        aria-labelledby="depth-slider"
        min={1}
        max={5} // 必要に応じて調整
        step={1}
        valueLabelDisplay="auto"
      />
      <Appfireworks depth={depth} />{" "}
      {/* Appfireworksコンポーネントに深さを渡す */}
    </div>
  );
}
