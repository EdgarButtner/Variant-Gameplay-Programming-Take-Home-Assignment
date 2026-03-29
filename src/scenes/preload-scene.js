import Phaser from 'phaser';
import { SpinePlugin } from '@esotericsoftware/spine-phaser-v4';
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
  }

  create() {
    console.log('PreloadScene created, moving to GameScene');
    this.scene.start(SCENE_KEY.GAME_START);
  }
}