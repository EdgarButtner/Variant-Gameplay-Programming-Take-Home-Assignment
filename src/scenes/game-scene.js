import Phaser from 'phaser';
import { SCENE_KEY } from '../common/scene-key';
import { WordManager } from '../common/word-manager';

const TEXT_STYLE = {
  fontSize: 'bold 35px',
  color: '#eaeaea',
  fontFamily: 'system-ui, sans-serif',
  rtl: true,
  stroke: '#000000',
  strokeThickness: 4,
};

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.hero = null;
    this.walkSpeed = 200;
    this.direction = 1;
    this.currComboProgress = '';
    this.currScore = 0;
    this.currLevel = 1;
    this.progressBarCompletion = 50;
    this.progressBarWidth = 300;
    this.gameOver = false;
    this.words = null;
  }

  /*
  Resetting state here ensures a clean slate regardless of how the previous run ended.
  */
  init() {
    this.hero = null;
    this.words = null;
    this.currComboProgress = '';
    this.currScore = 0;
    this.currLevel = 1;
    this.progressBarCompletion = 50;
    this.gameOver = false;
  }

  create() {
    console.log('GameScene created');
    const { width, height } = this.scale;
    const animations = this.cache.json.get('animations').animations;

    /*
    Word manager owns the three parallel queues and the spawn loop
    */
    this.words = new WordManager(this, animations);

    /*
    Music
    */
    this.music = this.sound.add('mainMusic', { loop: false, volume: 1 });

    /*
    Hero
    */
    this.hero = this.add.spine(width / 2, height * 0.72, 'man', 'manAtlas');
    this.hero.setDepth(10);
    this.hero.setScale(0.28);
    this.hero.animationState.data.defaultMix = 0.15;
    this.hero.animationState.setAnimation(0, 'Dance', true);
    this.hero.skeleton.scaleX = Math.abs(this.hero.skeleton.scaleX);

    this.words.start();

    /*
    HUD text
    */
    this.displayCurrComboText = this.add
      .text(width / 2, 1000, this.words.current, TEXT_STYLE)
      .setOrigin(0.5, 0)
      .setAlpha(0.3);

    this.comboText = this.add
      .text(width / 2 - this.displayCurrComboText.width / 2, 1000, '', TEXT_STYLE)
      .setOrigin(0, 0);

    this.scoreText = this.add
      .text(135, 15, `Score: ${this.currScore}`, { ...TEXT_STYLE, fontSize: '35px' });

    /*
    Progress bar
    */
    this.progressBarBackground = this.add
      .rectangle(width / 2 - 150, height * 0.03 - 10, this.progressBarWidth, 20, '#eaeaea')
      .setAlpha(0.5)
      .setOrigin(0, 0);

    this.progressBar = this.add
      .rectangle(width / 2 - 150, height * 0.03 - 10, this.progressBarCompletion, 20, '#eaeaea')
      .setOrigin(0, 0);

    this.progressBarLabel = this.add
      .text(width / 2, height * 0.03, `Level ${this.currLevel}`, { ...TEXT_STYLE, fontSize: '20px' })
      .setOrigin(0.5, 1);

    /*
    Keyboard input
    */
    this.input.keyboard?.on('keydown', (event) => {
      const key = event.key.toUpperCase();

      if (!this.music.isPlaying) this.music.play();
      if (key.length !== 1) return;

      this.currComboProgress += key;

      if (this.currComboProgress.length > this.words.current.length || !this.words.current.startsWith(this.currComboProgress)) {
        this.currComboProgress = '';
        this.playError();
        this.progressBarCompletion -= this.progressBarWidth / 5;
      }

      this.comboText.setText(this.currComboProgress);

      if (this.currComboProgress === this.words.current) {
        this.updateScore();
        this.progressBarCompletion += this.progressBarWidth / 5;
        this.hero.animationState.setAnimation(0, this.words.currentAnimation, false);
        this.hero.animationState.addAnimation(0, 'Dance', true, 0);
        this.words.shift();
        this.currComboProgress = '';
        this.comboText.setText('');
        this.displayCurrComboText.setText(this.words.current ?? '');
        this.comboText.x = this.scale.width / 2 - this.displayCurrComboText.width / 2;
      }
    });

    /*
    Store the timer so we can clean it up on scene shutdown
    */
    this._progressBarTimer = this.startProgressBarTimer();
    this.events.once('shutdown', () => this._progressBarTimer?.remove());
  }

  update() {
    if (this.gameOver) this.scene.start(SCENE_KEY.GAME_END);
    if (!this.hero) return;

    this.words.update(this.comboText.y + 5, () => {
      this.playError();
      this.progressBarCompletion -= this.progressBarWidth / 5;
    });

    if (this.music?.isPlaying && this.music.rate < 2) {
      this.music.rate += 0.00001;
    }
  }

  /*
  Shakes the screen and squishes the combo label to signal a mistake.
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
      repeat: 2,
    });
  }

  /*
  Adds currLevel to the score and refreshes the score label.
  */
  updateScore() {
    this.scoreText.setText(`Score: ${this.currScore += this.currLevel}`);
  }

  /*
  Ticks the progress bar every 100 ms. Fills toward next level on success,
  drains on missed words/errors. Level up/down at the boundaries.
  Returns the TimerEvent so the caller can cancel it on shutdown.
  */
  startProgressBarTimer() {
    if (!this.progressBar) console.error('Progress bar not initialized');

    return this.time.addEvent({
      delay: 100,
      loop: true,
      callback: () => {
        switch (true) {
          case this.progressBarCompletion <= 0 && this.currLevel > 1:
            this.currLevel--;
            this.progressBarCompletion = 0;
            break;
          case this.progressBarCompletion <= 0 && this.currLevel <= 1:
            this.gameOver = true;
            break;
          case this.progressBarCompletion >= this.progressBarWidth:
            this.progressBarCompletion = 1;
            this.currLevel++;
            this.progressBarLabel.setText(`Level ${this.currLevel}`);
            break;
          default:
            this.progressBarCompletion += 2 * this.currLevel;
        }
        this.progressBar.setSize(this.progressBarCompletion, 20);
      },
    });
  }
}
