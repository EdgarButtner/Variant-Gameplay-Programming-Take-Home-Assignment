const WORD_TEXT_STYLE = {
  fontSize: 'bold 35px',
  color: '#eaeaea',
  fontFamily: 'system-ui, sans-serif',
  rtl: true,
  stroke: '#000000',
  strokeThickness: 4,
};

/*
Manages the three parallel queues (word strings, display objects, animation names)
and owns the spawn loop. The scene calls start() once and then update() each frame.
*/
export class WordManager {
  constructor(scene, animations) {
    this.scene = scene;
    this.animations = animations;
    this.currWordDelay = 3000;
    this.wordQueue = [];
    this.wordDisplayQueue = [];
    this.animationQueue = [];
  }

  get current() { 
    return this.wordQueue[0]; 
  }
  get currentAnimation() { 
    return this.animationQueue[0]; 
  }

  /* Spawn the first word and kick off the recurring spawner. */
  start() {
    this.spawn();
    this.scheduleNext();
  }

  /*
  Called when the player successfully completes the current word.
  Destroys the display object and shifts all three queues.
  */
  shift() {
    if (this.wordDisplayQueue[0]) {
      this.wordDisplayQueue[0].destroy();
      this.wordDisplayQueue.shift();
    }
    this.wordQueue.shift();
    this.animationQueue.shift();
  }

  /*
  Advances falling words each frame. Calls onWordFell() (without arguments)
  for each word that reaches targetY, after removing it from the queues.
  */
  update(targetY, onWordFell) {
    for (let i = this.wordDisplayQueue.length - 1; i >= 0; i--) {
      const textObj = this.wordDisplayQueue[i];
      if (textObj.y < targetY) {
        textObj.y += 1;
      } else {
        textObj.destroy();
        this.wordQueue.splice(i, 1);
        this.animationQueue.splice(i, 1);
        this.wordDisplayQueue.splice(i, 1);
        onWordFell();
      }
    }
  }

  spawn() {
    const word = this.animations[Math.floor(Math.random() * this.animations.length)];
    const display = this.scene.add
      .text(this.scene.scale.width / 2, 0, word.toUpperCase(), {
        ...WORD_TEXT_STYLE,
        color: this._randomColor(),
      })
      .setOrigin(0.5, 0)
      .setDepth(20);

    this.wordQueue.push(word.toUpperCase());
    this.wordDisplayQueue.push(display);
    this.animationQueue.push(word);
  }

  scheduleNext() {
    this.currWordDelay -= 50;
    this.scene.time.delayedCall(this.currWordDelay, () => {
      this.spawn();
      this.scheduleNext();
    });
  }

  _randomColor() {
    const r = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
    const g = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
    const b = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }
}
