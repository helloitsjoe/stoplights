const root = document.getElementById('root');
const mainWay = document.getElementById('main-way');
const crossWay = document.getElementById('cross-way');
const walkSignal = document.getElementById('walk-signal');
const button = document.getElementById('walk-button');

const GREEN = 'limegreen';
const YELLOW = 'gold';
const RED = 'tomato';

const GREEN_TIME = 2000;
const YELLOW_TIME = 1000;
const BUFFER_TIME = 1000;
const WALK_TIME = 1000;
const WALK_WARN_TIME = 1000;

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

class EventEmitter {
  constructor() {
    this.events = {};
  }

  emit(name, data) {
    const callback = this.events[name];
    if (callback) {
      callback(data);
    }
  }

  on(name, callback) {
    this.events[name] = callback;
  }
}

class Intersection {
  constructor() {
    this.emitter = new EventEmitter();
    this.mainWay = new Stoplight('mainWay', this.emitter, mainWay);
    this.crossWay = new Stoplight('crossWay', this.emitter, crossWay);
    this.walkSignal = new WalkSignal(this.emitter, walkSignal);

    this.walkRequested = false;

    this.emitter.on('done', stoplightId => {
      if (this.walkRequested) {
        this.walkRequested = false;
        // Pass id of done stoplight through to walkSignal
        this.walkSignal.startCycle(stoplightId);
        return;
      }

      const nextLight = stoplightId === 'mainWay' ? this.crossWay : this.mainWay;
      nextLight.startCycle();
    });

    this.mainWay.startCycle();
  }

  requestWalk() {
    console.log('requesting walk...');
    this.walkRequested = true;
  }
}

class Stoplight {
  constructor(id, emitter, display) {
    this.id = id;
    this.emitter = emitter;
    this.display = display;
    this.timeout = null;
    this.setColor(RED);
  }

  setColor(color) {
    this.display.style.backgroundColor = color;
  }

  async startCycle() {
    this.setColor(GREEN);
    await wait(GREEN_TIME);
    this.setColor(YELLOW);
    await wait(YELLOW_TIME);
    this.setColor(RED);
    await wait(BUFFER_TIME);
    this.emitter.emit('done', this.id);
  }
}

class WalkSignal {
  constructor(emitter, display) {
    this.display = display;
    this.setColor(RED);
    this.timeout = null;
    this.emitter = emitter;
  }

  setColor(color) {
    this.display.style.backgroundColor = color;
  }

  async startCycle(id) {
    this.setColor(GREEN);
    await wait(WALK_TIME);
    this.setColor(YELLOW);
    await wait(WALK_WARN_TIME);
    this.setColor(RED);
    await wait(BUFFER_TIME);
    this.emitter.emit('done', id);

    // This isn't as nice looking but is clerer that we're just using setTimeout
    // this.setColor(GREEN);
    // this.timeout = setTimeout(() => {
    //   this.setColor(YELLOW);
    //   this.timeout = setTimeout(() => {
    //     this.setColor(RED);
    //     this.timeout = setTimeout(() => {
    //       this.emitter.emit('done', id);
    //     });
    //   }, WALK_WARN_TIME);
    // }, WALK_TIME);
  }
}

const intersection = new Intersection();

button.addEventListener('click', intersection.requestWalk);
