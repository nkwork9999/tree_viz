import React from "react";
import ReactDOM from "react-dom/client";
import App from "./tree/App";
import "./styles.css";

//document.getElementById('root') index.htmlにrootがあると有効になるらしい　DOM操作　javascriptでrootのhtmlうあるを持ってくる
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
