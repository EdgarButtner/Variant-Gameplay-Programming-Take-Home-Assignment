import Phaser from 'phaser';
import { SpinePlugin } from '@esotericsoftware/spine-phaser-v4';

const res = await fetch('/spine/man/animations.json');
const { animations } = await res.json();

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.hero = null;
    this.walkSpeed = 200;
    this.direction = 1;
    this.currAnimation =  '';
    this.currCombo= '';
    this.currComboProgress = '';
  }


  create() {
    console.log('GameScene created');
    const { width, height } = this.scale;

    this.currCombo = this.getNewComboWord();

    this.fallingComboTextHeight = 0;
    this.fallingComboText = this.add
      .text(width / 2, this.fallingComboTextHeight, `${this.currCombo}`, {
        fontSize: 'bold 35px',
        color: '#eaeaea',
        fontFamily: 'system-ui, sans-serif',
        rtl: true
      })
      .setOrigin(0.5, 0);

    this.displayCurrComboText = this.add
      .text(width / 2, 1000, `Current Combo: ${this.currCombo}`, {
        fontSize: 'bold 25px',
        color: '#eaeaea',
        fontFamily: 'system-ui, sans-serif',
        rtl: true
      })
      .setOrigin(0.5, 0);

    this.comboText = this.add
      .text(width / 2, 1050, '', {
        fontSize: 'bold 35px',
        color: '#eaeaea',
        fontFamily: 'system-ui, sans-serif',
        rtl: true
      })
      .setOrigin(0.5, 0);

    this.input.keyboard?.on('keydown', (event) => {
      const key = event.key.toUpperCase();

      if (key.length !== 1) return;

      this.currComboProgress += key;

      if (this.currComboProgress.length > this.currCombo.length || !this.currCombo.startsWith(this.currComboProgress)) {
        this.currComboProgress = '';
        this.playError();
      }
      this.comboText.setText(this.currComboProgress);

      if (this.currComboProgress === this.currCombo) {
        console.log(`Key combo matched: ${this.currCombo}`);
        this.hero.animationState.setAnimation(0, this.currAnimation, false);
        this.resetAll();
        this.hero.animationState.addAnimation(0, 'Idle', true, 0);
      }
    });


    // Hero Creation
    this.hero = this.add.spine(width / 2, height * 0.72, 'man', 'manAtlas');
    this.hero.setDepth(10);
    this.hero.setScale(0.28);
    this.hero.animationState.data.defaultMix = 0.15;
    this.hero.animationState.setAnimation(0, 'Idle', true);
    this.hero.skeleton.scaleX = Math.abs(this.hero.skeleton.scaleX);

  }

  update(_, deltaMs) {
    if (!this.hero) return; 
    const dt = deltaMs / 1000;
    const w = this.scale.width;
    //this.hero.x += this.walkSpeed * this.direction * dt;

    const margin = 72;
    if (this.hero.x > w - margin) {
      this.hero.x = w - margin;
      this.direction = -1;
      this.hero.skeleton.scaleX = -Math.abs(this.hero.skeleton.scaleX);
    } else if (this.hero.x < margin) {
      this.hero.x = margin;
      this.direction = 1;
      this.hero.skeleton.scaleX = Math.abs(this.hero.skeleton.scaleX);
    }

    if (this.fallingComboTextHeight < this.comboText.y + 10) {
      this.fallingComboTextHeight += 1;
      this.fallingComboText.setY(this.fallingComboTextHeight);
    } else {
      this.resetAll();
      this.playError();
    }
  }

  // Gets a new word combo from the animations list and converts it to uppercase 
  getNewComboWord() {
    const randomAni = animations[Math.floor(Math.random() * animations.length)];
    this.currAnimation = randomAni;
    return randomAni.toUpperCase();
  }

  resetComboDisplay() {
    this.displayCurrComboText.setText(`Current Combo: ${this.currCombo}`);
  }

  resetFallingComboText() {
    this.fallingComboTextHeight = 0;
    this.fallingComboText.setY(this.fallingComboTextHeight);
    this.fallingComboText.setText(`${this.currCombo}`);
  }

  playError() {
    this.cameras.main.shake(100, 0.01);
    this.tweens.add({
      targets: this.displayCurrComboText,
      scaleX: 1.2,
      scaleY: 0.9,
      duration: 100,
      ease: Phaser.Math.Easing.Quadratic.InOut,
      yoyo: true,
      repeat: 2
    });
    // Then some error sound
  }

  resetAll() {
    this.currComboProgress = '';
    this.comboText.setText('');
    this.currCombo = this.getNewComboWord();
    this.resetComboDisplay();
    this.resetFallingComboText();
  }
}