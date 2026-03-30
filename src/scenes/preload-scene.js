import Phaser from 'phaser';
import { SCENE_KEY } from '../common/scene-key';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'PreloadScene'
    });
  }

  // All assets we need loaded
  preload() {
    this.load.spineJson('man', '/spine/man/skeleton.json');
    this.load.spineAtlas('manAtlas', '/spine/man/skeleton.atlas', true);
    this.load.audio('mainMusic', '/audio/MainMusic.mp3');
    this.load.json('animations', '/spine/man/animations.json');
  }

  /*
  Transition to GameScene once all assets are loaded
  */
  create() {
    console.log('PreloadScene created, moving to GameScene');
    this.scene.start(SCENE_KEY.GAME_SCENE);
  }
}