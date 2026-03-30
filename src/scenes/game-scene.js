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
    this.currComboProgress = '';
    this.currWordDelay = 3000;
    this.wordQueue = [];
    this.wordDisplayQueue = [];
    this.animationQueue = [];

  }

  create() {
    console.log('GameScene created');
    const { width, height } = this.scale;

    /*
    Adding music to scene
    */
    this.music = this.sound.add('mainMusic', { loop: false, volume: 1 });

    /*
    Create the first word and then start the word spawner 
    */
    this.initialWord();
    this.wordSpawner();

    /*
    The text displaying the current word to type
    */
    this.displayCurrComboText = this.add
      .text(width / 2, 1000, `Current Combo \n ${this.wordQueue[0]}`, {
        fontSize: 'bold 35px',
        color: '#eaeaea',
        fontFamily: 'system-ui, sans-serif',
        align: 'center',
        rtl: true
      })
      .setOrigin(0.5, 0)
      .setAlpha(0.5);
      
    /*
    Progress toward current word
    */
    this.comboText = this.add
      .text(width / 2, 1050, '', {
        fontSize: 'bold 35px',
        color: '#eaeaea',
        fontFamily: 'system-ui, sans-serif',
        rtl: true
      })
      .setOrigin(0.5, 0);

    /*
    On a key press add the key to the current combo progress and check if it matches the start of the current word combo.
    If it does not match play an error and reset.
    */
    this.input.keyboard?.on('keydown', (event) => {
      const key = event.key.toUpperCase();

      if (!this.music.isPlaying) this.music.play();

      if (key.length !== 1) return;

      this.currComboProgress += key;

      if (this.currComboProgress.length > this.wordQueue[0].length || !this.wordQueue[0].startsWith(this.currComboProgress)) {
        this.currComboProgress = '';
        this.playError();
      }
      this.comboText.setText(this.currComboProgress);

      if (this.currComboProgress === this.wordQueue[0]) {
        console.log(`Key combo matched: ${this.currComboProgress}`);
        this.hero.animationState.setAnimation(0, this.animationQueue[0], false);
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

    /*
    For each falling word increase its y value or play an error and destroy it
    if below desired range / combo text
    */
    for (let i = this.wordDisplayQueue.length - 1; i >= 0; i--) {
      const textObj = this.wordDisplayQueue[i];
      if (textObj.y < this.comboText.y + 5) {
        textObj.y += 1;
      } else {
        textObj.destroy();
        this.playError();
        this.wordQueue.splice(i, 1);
        this.animationQueue.splice(i, 1);
        this.wordDisplayQueue.splice(i, 1);
      }
    }

    // Continually speed up the game music and increase the rate of falling words
    if (this.music?.isPlaying && this.music.rate < 2) {
      console.log(`Increasing music speed: ${this.music.rate.toFixed(2)}`);
      this.music.rate += 0.00001;
    }

    // Reduce the delay between words being spawned
    if (this.currWordDelay > 500) {
      this.currWordDelay -= 0.5;
    }
  }

  /*
  Gets a new word combo from the animations list and converts it to uppercase 
  */
  getNewWord() {
    const randomAni = animations[Math.floor(Math.random() * animations.length)];
    return randomAni
  }

  /*
  Resets the current combo display text to show the next word in the queue.
  */
  resetComboDisplay() {
    this.displayCurrComboText.setText(`Current Combo \n ${this.wordQueue[0]}`);
  }

  /*
  Shakes the screen and animates the current combo display text to indicate an error,
  */
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

  /*  
  Resets the current combo progress, destroys the current word display, 
  removes the current word and animation from their respective queues, 
  and updates the combo display text to show the next word in the queue
  */ 
  resetAll() {
    this.currComboProgress = '';
    if (this.wordDisplayQueue[0]) {
      this.wordDisplayQueue[0].destroy();
      this.wordDisplayQueue.shift();
    }
    this.wordQueue.shift();
    this.animationQueue.shift();
    this.resetComboDisplay();
  }
 
  /*
  Produces an initial word and text object to fall down the 
  screen at the start of the game and adds it to each queue
  */
  initialWord() {
    this.word = this.getNewWord();

    this.wordDisplay = this.add.text(this.scale.width / 2, 0, `${this.word.toUpperCase()}`, {
      fontSize: 'bold 35px',
      color: '#eaeaea',
      fontFamily: 'system-ui, sans-serif',
      rtl: true
    }).setOrigin(0.5, 0);

    this.wordQueue.push(this.word.toUpperCase());
    this.wordDisplayQueue.push(this.wordDisplay);
    this.animationQueue.push(this.word);
  }

  /*
  Repeatedly add words to each queue and create a text object for each 
  word that falls down the screen. The delay between each word is determined 
  by currWordDelay, which decreases over time to speed up the game
  */
  wordSpawner() {
    const spawnWord = () => {
      this.word = this.getNewWord();

      this.wordDisplay = this.add.text(this.scale.width / 2, 0, `${this.word.toUpperCase()}`, {
        fontSize: 'bold 35px',
        color: '#eaeaea',
        fontFamily: 'system-ui, sans-serif',
        rtl: true
      }).setOrigin(0.5, 0);

      this.wordQueue.push(this.word.toUpperCase());
      this.wordDisplayQueue.push(this.wordDisplay);
      this.animationQueue.push(this.word);

      this.time.delayedCall(this.currWordDelay, spawnWord);
    };
    this.time.delayedCall(this.currWordDelay, spawnWord);
  }
}