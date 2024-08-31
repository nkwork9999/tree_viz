import React from "react";
import { Handle } from "@xyflow/react";
import { shallow } from "zustand/shallow";
import { useStore } from "./store";

const selector = (store) => ({
  isRunning: store.isRunning,
  toggleAudio: store.toggleAudio,
});

export const Out = (id, data) => {
  const { isRunning, toggleAudio } = useStore(selector, shallow);

  return (
    <div>
      <p>Output Node</p>

      <button onClick={toggleAudio}>
        {isRunning ? (
          <span role="img" aria-label="mute">
            スイッチオフ
          </span>
        ) : (
          <span role="img" aria-label="unmute">
            スイッチオン
          </span>
        )}
      </button>
    </div>
  );
};
