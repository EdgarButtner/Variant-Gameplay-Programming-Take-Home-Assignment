import Phaser from 'phaser';
import { SCENE_KEY } from '../common/scene-key';

export class GameStart extends Phaser.Scene {
  constructor() {
    super({
      key: 'GameStart'
    });
  }

  create() {
    console.log('GameStart created');

    const { width, height } = this.scale;

    // Hero Creation
    this.hero = this.add.spine(width / 2, height * 0.72, 'man', 'manAtlas');
    this.hero.setDepth(10);
    this.hero.setScale(0.28);
    this.hero.animationState.data.defaultMix = 0.15;
    this.hero.animationState.setAnimation(0, 'Wave', true);
    this.hero.skeleton.scaleX = Math.abs(this.hero.skeleton.scaleX);

    /*
    Game Start Text and Button
    */
    this.title = this.add
      .text (width / 2, height * 0.15, 'Welcome to \n Combo Hero!', {
        fontSize: 'bold 70px comic sans-serif',
        color: '#eaeaea',
        align: 'center'
      })
      .setOrigin(0.5, 0);

    this.button = this.add
      .rectangle(width / 2, 1000, 200, 60, '#eaeaea');

    this.label = this.add
      .text(width / 2, 1000, 'Play', { fontSize: '24px' })
      .setOrigin(0.5);

    this.button.setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.scene.start(SCENE_KEY.GAME_SCENE);
      });
  }
}