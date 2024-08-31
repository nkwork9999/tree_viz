import "phaser";

class MainScene extends Phaser.Scene {
  constructor() {
    super({
      key: "Main",
    });
  }

  init(): void {
    console.log("init");
  }
  preload(): void {
    console.log("preload");
  }

  create(): void {
    console.log("create");
    this.add.text(10, 10, "hello,phaser");
  }
  update(): void {}
}
export default MainScene;
