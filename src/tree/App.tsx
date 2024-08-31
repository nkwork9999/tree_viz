import App2 from "../audio/App2.tsx";

import { open } from "@tauri-apps/api/dialog";

import Simpletree from "./Simpletree.tsx";
import { Appfireworks } from "./Appfireworks.tsx";

import AppTree, { Apptree2 } from "./Apptreecommand.tsx";
import Switch from "./switch.tsx";
import { Apptreeav } from "./Apptree.tsx";

export default function App() {
  function openDialog() {
    open().then((files) => console.log(files));
  }
  function render() {
    const num = 1;
    return <div>number of {num}.</div>;
  }
  return (
    <div>
      {/* <Simpletree /> */}
      {/* <Apptree2 /> */}
      {/* <Switch /> */}
      {/* <Appfireworks /> */}
      <Apptreeav />
      {/* <App2 /> */}
    </div>
  );
}
