import Phaser from 'phaser';
import { SCENE_KEY } from '../common/scene-key';

export class GameEnd extends Phaser.Scene {
  constructor() {
    super({
      key: 'GameEnd'
    });
    this.playAgainButtonOffset = -150;
    this.playAgainButtonY = 1000;
    this.titleScreenButtonOffset = 150;
    this.titleScreenButtonY = 1000;
  }

  create() {
    console.log('GameEnd created');
    const { width, height } = this.scale;

    /*
    Hero Creation
    */
    this.hero = this.add.spine(width / 2, height * 0.65, 'man', 'manAtlas');
    this.hero.setDepth(10);
    this.hero.setScale(0.28);
    this.hero.animationState.data.defaultMix = 0.15;
    this.hero.animationState.setAnimation(0, 'Dance', true);
    this.hero.skeleton.scaleX = Math.abs(this.hero.skeleton.scaleX);

    /*
    Game Over Text and Buttons
    */
    this.title = this.add
      .text(width / 2, height * 0.2, 'Game Over \n Thanks for Playing!', {
        fontSize: 'bold 70px comic sans-serif',
        color: '#eaeaea',
        align: 'center'
      })
      .setOrigin(0.5, 0);

    this.playAgainButton = this.add
      .rectangle(width / 2 + this.playAgainButtonOffset, this.playAgainButtonY, 200, 60, '#eaeaea');

    this.playAgainLabel = this.add
      .text(width / 2 + this.playAgainButtonOffset, this.playAgainButtonY, 'Play Again!', { fontSize: '24px' })
      .setOrigin(0.5);

    this.playAgainButton.setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.scene.start(SCENE_KEY.GAME_SCENE);
      });

    this.titleScreenButton = this.add
      .rectangle(width / 2 + this.titleScreenButtonOffset, this.titleScreenButtonY, 200, 60, '#eaeaea');

    this.titleScreenLabel = this.add
      .text(width / 2 + this.titleScreenButtonOffset, this.titleScreenButtonY, 'Title Screen', { fontSize: '24px' })
      .setOrigin(0.5);

    this.titleScreenButton.setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.scene.start(SCENE_KEY.GAME_START);
      });
  }
}