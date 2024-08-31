import { invoke } from "@tauri-apps/api/tauri";

interface Scene {
  text: string;
  character: string;
  background: string;
}

document.addEventListener("DOMContentLoaded", async () => {
  const textBox = document.getElementById("text-box") as HTMLDivElement;
  const character = document.getElementById("character") as HTMLImageElement;

  let scenes: Scene[] = [];
  try {
    scenes = await invoke<Scene[]>("get_scenes");
  } catch (e) {
    console.error(e);
  }

  let currentSceneIndex = 0;

  function showScene(sceneIndex: number) {
    const scene = scenes[sceneIndex];
    textBox.textContent = scene.text;
    character.src = scene.character;
    (
      document.getElementById("background") as HTMLDivElement
    ).style.backgroundImage = `url(${scene.background})`;
  }

  function nextScene() {
    currentSceneIndex = (currentSceneIndex + 1) % scenes.length;
    showScene(currentSceneIndex);
  }

  textBox.addEventListener("click", nextScene);

  // 初期シーンの表示
  if (scenes.length > 0) {
    showScene(currentSceneIndex);
  } else {
    textBox.textContent = "Failed to load scenes.";
  }
});
