class LoadScene extends Phaser.Scene {
  preload() {
    this.load.image('pixel', 'src/assets/pixel.png')
  }

  create() {
    this.scene.start('menu')
  }
}
