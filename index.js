const root = document.getElementById('root');
const mainWay = document.getElementById('main-way');
const crossWay = document.getElementById('cross-way');
const walkSignal = document.getElementById('walk-signal');
const walkIcon = document.getElementById('walk-icon');
const button = document.getElementById('walk-button');

const GREEN = 'green';
const YELLOW = 'yellow';
const RED = 'red';

const WALK = 'lime';
const WALK_WARN = 'gold';
const DONT_WALK = 'red';

const GREEN_TIME = 3000;
const YELLOW_TIME = 2000;
const BUFFER_TIME = 1000;
const WALK_TIME = 3000;
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
    const emitter = new EventEmitter();

    this.mainWay = new Stoplight('mainWay', emitter, mainWay);
    this.crossWay = new Stoplight('crossWay', emitter, crossWay);
    this.walkSignal = new WalkSignal(emitter, walkIcon);

    this.walkRequested = false;
    this.requestWalk = this.requestWalk.bind(this);

    emitter.on('done', stoplightId => {
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
    this.setColor(RED);
  }

  setColor(color) {
    for (const child of this.display.children) {
      if (child.classList.contains(color)) {
        child.classList.add('on');
      } else {
        child.classList.remove('on');
      }
    }
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
    this.emitter = emitter;
    this.display = display;
    this.setColor(RED);
  }

  setColor(color) {
    this.display.style.color = color;
    this.display.classList.add(color === WALK ? 'fa-walking' : 'fa-hand-paper');
  }

  async startCycle(id) {
    this.setColor(WALK);
    await wait(WALK_TIME);
    this.setColor(WALK_WARN);
    await wait(WALK_WARN_TIME);
    this.setColor(DONT_WALK);
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
