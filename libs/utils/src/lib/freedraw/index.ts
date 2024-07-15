import { MouseButton } from "../types";

type Color = number[];

type Coordinates = [number, number];

interface BaseObject {
  [key: string]: any;
}

interface Position {
  y: number;
  x: number;
  isBucket: boolean;
  newColor?: Color;
  tolerance?: number;
  strokeColor?: Color;
  moving?: boolean;
  lineWidth: number;
}

type ColorRGBA = {
  R: number;
  G: number;
  B: number;
  A?: number;
};

interface CanvasFreeDrawingParameters {
  canvas: HTMLCanvasElement;
  canvasCtx: CanvasRenderingContext2D;  
  width: number;
  height: number;
  backgroundColor?: Color;
  lineWidth?: number;
  strokeColor?: Color;
  disabled?: string;
  showWarnings?: boolean;
  maxSnapshots?: number;
}

interface NodeColorCache {
  [key: string]: boolean;
}

export enum AllowedEvents {
  redraw = 'redraw',
  fill = 'fill',
  mouseup = 'mouseup',
  mousedown = 'mousedown',
  mouseenter = 'mouseenter',
  mouseleave = 'mouseleave',
}

export default class CanvasFreeDrawing {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
  maxSnapshots: number;
  snapshots: ImageData[];
  undos: ImageData[];
  positions: [Position[]?];
  leftCanvasDrawing: boolean;
  isDrawing: boolean;
  isDrawingModeEnabled: boolean;
  imageRestored: boolean;
  lineWidth: number;
  backgroundColor?: Color;
  strokeColor: Color;
  bucketToolColor: Color;
  bucketToolTolerance: number;
  isBucketToolEnabled: boolean;
  listenersList: string[];
  redrawCounter: number;
  dispatchEventsOnceEvery: number;
  allowedEvents: string[];

  events: { [key: string]: Event };
  bindings: {
    mouseDown: (event: MouseEvent) => void;
    mouseMove: (event: MouseEvent) => void;
    mouseLeave: (event: MouseEvent) => void;
    mouseUp: (event: MouseEvent) => void;
    mouseUpDocument: (event: MouseEvent) => void;
    touchStart: (event: TouchEvent) => void;
    touchMove: (event: TouchEvent) => void;
    touchEnd: (event: MouseEvent) => void;
    [name: string]: unknown;
  };

  touchIdentifier?: number;
  previousX?: number;
  previousY?: number;
  showWarnings: boolean;

  isNodeColorEqualCache: NodeColorCache;

  constructor(params: CanvasFreeDrawingParameters) {
    const {
      canvas,
      canvasCtx,
      width,
      height,
      backgroundColor = [255, 255, 255],
      lineWidth = 5,
      strokeColor = [0, 0, 0],
      disabled,
      showWarnings = false,
      maxSnapshots = 10,
    } = params;

    this.requiredParam(params, 'canvas');
    this.requiredParam(params, 'canvasCtx');
    this.requiredParam(params, 'width');
    this.requiredParam(params, 'height');

    this.canvas = canvas;
    this.context = canvasCtx;

    this.width = width;
    this.height = height;

    this.maxSnapshots = maxSnapshots;
    this.snapshots = [];
    this.undos = [];
    this.positions = [];
    this.leftCanvasDrawing = false; // to check if user left the canvas drawing, on mouseover resume drawing
    this.isDrawing = false;
    this.isDrawingModeEnabled = true;
    this.imageRestored = false;

    this.lineWidth = lineWidth;
    this.strokeColor = this.toValidColor(strokeColor);
    this.bucketToolColor = this.toValidColor(strokeColor);
    this.bucketToolTolerance = 0;
    this.isBucketToolEnabled = false;

    this.listenersList = [
      'mouseDown',
      'mouseMove',
      'mouseLeave',
      'mouseUp',
      'touchStart',
      'touchMove',
      'touchEnd',
    ];
    this.allowedEvents = this.getAllowedEvents();
    this.redrawCounter = 0;
    this.dispatchEventsOnceEvery = 0; // this may become something like: [{event, counter}]

    // initialize events
    this.events = {
      redrawEvent: new Event('redraw'),
      fillEvent: new Event('fill'),
      mouseUpEvent: new Event('mouseup'),
      mouseDownEvent: new Event('mousedown'),
      mouseEnterEvent: new Event('mouseenter'),
      mouseLeaveEvent: new Event('mouseleave'),
      touchStartEvent: new Event('touchstart'),
      touchEndEvent: new Event('touchend'),
    };

    this.bindings = {
      mouseDown: this.mouseDown.bind(this),
      mouseMove: this.mouseMove.bind(this),
      mouseLeave: this.mouseLeave.bind(this),
      mouseUp: this.mouseUp.bind(this),
      mouseUpDocument: this.mouseUpDocument.bind(this),
      touchStart: this.touchStart.bind(this),
      touchMove: this.touchMove.bind(this),
      touchEnd: this.touchEnd.bind(this),
    };

    this.touchIdentifier = undefined;
    this.previousX = undefined;
    this.previousY = undefined;

    this.showWarnings = showWarnings;

    // cache
    this.isNodeColorEqualCache = {};

    this.setDimensions();
    this.setBackground(backgroundColor);
    this.storeSnapshot();

    if (!disabled) this.enableDrawingMode();
  }

  requiredParam(object: BaseObject, param: string): void {
    if (!object?.[param]) {
      throw new Error(`${param} is required`);
    }
  }

  logWarning(...args: string[]): void {
    if (this.showWarnings) console.warn(...args);
  }

  addListeners(): void {
    this.listenersList.forEach((event) => {
      this.canvas.addEventListener(
        event.toLowerCase(),
        this.bindings[event] as EventListenerObject
      );
    });
    document.addEventListener('mouseup', this.bindings.mouseUpDocument);
  }

  removeListeners(): void {
    this.listenersList.forEach((event) => {
      this.canvas.removeEventListener(
        event.toLowerCase(),
        this.bindings[event] as EventListenerObject
      );
    });
    document.removeEventListener('mouseup', this.bindings.mouseUpDocument);
  }

  getAllowedEvents(): string[] {
    const events = [];
    for (const event in AllowedEvents) {
      events.push(event);
    }
    return events;
  }

  enableDrawingMode(): boolean {
    this.isDrawingModeEnabled = true;
    this.addListeners();
    this.toggleCursor();
    return this.isDrawingModeEnabled;
  }

  disableDrawingMode(): boolean {
    this.isDrawingModeEnabled = false;
    this.removeListeners();
    this.toggleCursor();
    return this.isDrawingModeEnabled;
  }

  mouseDown(event: MouseEvent): void {
    if (event.button !== MouseButton.LEFT) return;
    this.drawPoint(event.offsetX, event.offsetY);
  }

  mouseMove(event: MouseEvent): void {
    this.drawLine(event.offsetX, event.offsetY, event);
  }

  touchStart(event: TouchEvent): void {
    if (event.changedTouches.length > 0) {
      const { pageX, pageY, identifier } = event.changedTouches[0];
      const boundingClient = this.canvas.getBoundingClientRect();
      const x = pageX - boundingClient.left;
      const y = pageY - boundingClient.top;
      this.touchIdentifier = identifier;
      this.drawPoint(x, y);
    }
  }

  touchMove(event: TouchEvent): void {
    if (event.changedTouches.length > 0) {
      const { pageX, pageY, identifier } = event.changedTouches[0];
      const boundingClient = this.canvas.getBoundingClientRect();
      const x = pageX - boundingClient.left;
      const y = pageY - boundingClient.top;

      // check if is multi touch, if it is do nothing
      if (identifier != this.touchIdentifier) return;

      this.previousX = x;
      this.previousY = y;
      this.drawLine(x, y, event);
    }
  }

  touchEnd(): void {
    this.handleEndDrawing();
    this.canvas.dispatchEvent(this.events.touchEndEvent);
  }

  mouseUp(): void {
    this.handleEndDrawing();
    this.canvas.dispatchEvent(this.events.mouseUpEvent);
  }

  mouseUpDocument(): void {
    this.leftCanvasDrawing = false;
  }

  mouseLeave(): void {
    if (this.isDrawing) this.leftCanvasDrawing = true;
    this.isDrawing = false;
    this.canvas.dispatchEvent(this.events.mouseLeaveEvent);
  }

  mouseEnter(): void {
    this.canvas.dispatchEvent(this.events.mouseEnterEvent);
  }

  handleEndDrawing(): void {
    this.isDrawing = false;
    this.storeSnapshot();
  }

  drawPoint(x: number, y: number): void {
    if (this.isBucketToolEnabled) {
      this.fill(x, y, this.bucketToolColor, {
        tolerance: this.bucketToolTolerance,
      });
    } else {
      this.isDrawing = true;
      this.storeDrawing(x, y, false);
      this.canvas.dispatchEvent(this.events.mouseDownEvent);
      this.handleDrawing();
    }
  }

  drawLine(x: number, y: number, event: MouseEvent | TouchEvent): void {
    if (this.leftCanvasDrawing) {
      this.leftCanvasDrawing = false;
      if (event instanceof MouseEvent) {
        this.mouseDown(event);
      } else if (event instanceof TouchEvent) {
        this.touchEnd();
      }
    }

    if (this.isDrawing) {
      this.storeDrawing(x, y, true);
      this.handleDrawing(this.dispatchEventsOnceEvery);
    }
  }

  handleDrawing(dispatchEventsOnceEvery?: number): void {
    this.context.lineJoin = 'round';
    const positions = [[...this.positions].pop()];

    positions.forEach((position) => {
      if (position?.[0].strokeColor) {
        this.context.strokeStyle = this.rgbaFromArray(position[0].strokeColor);
        this.context.lineWidth = position[0].lineWidth;
        this.draw(position);
      }
    });

    if (!dispatchEventsOnceEvery) {
      this.canvas.dispatchEvent(this.events.redrawEvent);
    } else if (this.redrawCounter % dispatchEventsOnceEvery === 0) {
      this.canvas.dispatchEvent(this.events.redrawEvent);
    }

    this.undos = [];
    this.redrawCounter += 1;
  }

  draw(position: Position[]): void {
    position.forEach(({ x, y, moving }, i) => {
      this.context.beginPath();
      if (moving && i) {
        this.context.moveTo(position[i - 1]['x'], position[i - 1]['y']);
      } else {
        this.context.moveTo(x - 1, y);
      }
      this.context.lineTo(x, y);
      this.context.closePath();
      this.context.stroke();
    });
  }

  // https://en.wikipedia.org/wiki/Flood_fill
  fill(
    x: number,
    y: number,
    newColor: Color,
    { tolerance }: { tolerance: number }
  ): void {
    newColor = this.toValidColor(newColor);
    if (this.positions.length === 0 && !this.imageRestored) {
      this.setBackground(newColor, false);
      this.canvas.dispatchEvent(this.events.redrawEvent);
      this.canvas.dispatchEvent(this.events.fillEvent);
      return;
    }

    const pixels = this.width * this.height;
    const imageData = this.context.getImageData(0, 0, this.width, this.height);
    const newData = imageData.data;
    const targetColor = this.getNodeColor(x, y, newData);
    if (this.isNodeColorEqual(targetColor, newColor, tolerance)) return;
    const queue: Coordinates[] = [];
    queue.push([x, y]);

    while (queue.length) {
      if (queue.length > pixels) break;

      const n = queue.pop();
      let w = n!;
      let e = n!;

      while (
        this.isNodeColorEqual(
          this.getNodeColor(w[0] - 1, w[1], newData),
          targetColor,
          tolerance
        )
      ) {
        w = [w[0] - 1, w[1]];
      }

      while (
        this.isNodeColorEqual(
          this.getNodeColor(e[0] + 1, e[1], newData),
          targetColor,
          tolerance
        )
      ) {
        e = [e[0] + 1, e[1]];
      }

      const firstNode = w[0];
      const lastNode = e[0];

      for (let i = firstNode; i <= lastNode; i++) {
        this.setNodeColor(i, w[1], newColor, newData);

        if (
          this.isNodeColorEqual(
            this.getNodeColor(i, w[1] + 1, newData),
            targetColor,
            tolerance
          )
        ) {
          queue.push([i, w[1] + 1]);
        }

        if (
          this.isNodeColorEqual(
            this.getNodeColor(i, w[1] - 1, newData),
            targetColor,
            tolerance
          )
        ) {
          queue.push([i, w[1] - 1]);
        }
      }
    }

    this.context.putImageData(imageData, 0, 0);
    this.canvas.dispatchEvent(this.events.redrawEvent);
    this.canvas.dispatchEvent(this.events.fillEvent);
  }

  toValidColor(color: Color): Color {
    if (Array.isArray(color) && color.length === 4) return color;
    if (Array.isArray(color) && color.length === 3) {
      const validColor = [...color];
      validColor.push(255);
      return validColor;
    } else {
      this.logWarning(
        'Color is not valid!\n' +
          'It must be an array with RGB values:  [0-255, 0-255, 0-255]'
      );
      return [0, 0, 0, 255];
    }
  }

  // i = color 1; j = color 2; t = tolerance
  isNodeColorEqual(i: Color, j: Color, t: number): boolean {
    const color1 = '' + i[0] + i[1] + i[2] + i[3];
    const color2 = '' + j[0] + j[1] + j[2] + j[3];
    const key = color1 + color2 + t;
    t = t || 0;

    if (this.isNodeColorEqualCache.hasOwnProperty(color1 + color2 + t)) {
      return this.isNodeColorEqualCache[key];
    }

    const diffRed = Math.abs(j[0] - i[0]);
    const diffGreen = Math.abs(j[1] - i[1]);
    const diffBlue = Math.abs(j[2] - i[2]);

    const percentDiffRed = diffRed / 255;
    const percentDiffGreen = diffGreen / 255;
    const percentDiffBlue = diffBlue / 255;

    const percentDiff =
      ((percentDiffRed + percentDiffGreen + percentDiffBlue) / 3) * 100;
    const result = t >= percentDiff;

    this.isNodeColorEqualCache[key] = result;
    return result;
  }

  getNodeColor(x: number, y: number, data: Uint8ClampedArray): Color {
    const i = (x + y * this.width) * 4;
    return [data[i], data[i + 1], data[i + 2], data[i + 3]];
  }

  setNodeColor(
    x: number,
    y: number,
    color: Color,
    data: Uint8ClampedArray
  ): void {
    const i = (x + y * this.width) * 4;
    data[i] = color[0];
    data[i + 1] = color[1];
    data[i + 2] = color[2];
    data[i + 3] = color[3];
  }

  rgbaFromArray(a: Color): string {
    return `rgba(${a[0]},${a[1]},${a[2]},${a[3]})`;
  }

  setDimensions(): void {
    this.canvas.height = this.height;
    this.canvas.width = this.width;
  }

  toggleCursor(): void {
    this.canvas.style.cursor = this.isDrawingModeEnabled ? 'crosshair' : 'auto';
  }

  storeDrawing(x: number, y: number, moving: boolean): void {
    if (moving) {
      const lastIndex = this.positions.length - 1;
      (this.positions[lastIndex] as Position[]).push({
        x,
        y,
        moving,
        lineWidth: this.lineWidth,
        strokeColor: this.strokeColor,
        isBucket: false,
      });
    } else {
      this.positions.push([
        {
          x,
          y,
          isBucket: false,
          moving,
          lineWidth: this.lineWidth,
          strokeColor: this.strokeColor,
        },
      ]);
    }
  }

  storeSnapshot(): void {
    const imageData = this.getCanvasSnapshot();
    this.snapshots.push(imageData);
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots = this.snapshots.splice(-Math.abs(this.maxSnapshots));
    }
  }

  getCanvasSnapshot(): ImageData {
    return this.context.getImageData(0, 0, this.width, this.height);
  }

  restoreCanvasSnapshot(imageData: ImageData): void {
    this.context.putImageData(imageData, 0, 0);
  }

  // Public APIs

  on(
    params: { event: AllowedEvents; counter?: number },
    callback: () => void
  ): void {
    const { event, counter } = params;
    this.requiredParam(params, 'event');

    if (this.allowedEvents.includes(event)) {
      if (event === 'redraw' && counter && Number.isInteger(counter)) {
        this.dispatchEventsOnceEvery = counter;
      }
      this.canvas.addEventListener(event, () => callback());
    } else {
      this.logWarning(`This event is not allowed: ${event}`);
    }
  }

  setLineWidth(px: number): void {
    this.lineWidth = px;
  }

  setBackground(color: Color, save = true): void {
    const validColor = this.toValidColor(color);
    if (validColor) {
      if (save) this.backgroundColor = validColor;
      this.context.fillStyle = this.rgbaFromArray(validColor);
      this.context.fillRect(0, 0, this.width, this.height);
    }
  }

  setDrawingColor(color: Color): void {
    this.configBucketTool({ color });
    this.setStrokeColor(color);
  }

  setStrokeColor(color: Color): void {
    this.strokeColor = this.toValidColor(color);
  }

  configBucketTool(params: { color?: Color; tolerance?: number }): void {
    const { color = null, tolerance = null } = params;
    if (color) this.bucketToolColor = this.toValidColor(color);
    if (tolerance && tolerance > 0) {
      this.bucketToolTolerance = tolerance > 100 ? 100 : tolerance;
    }
  }

  toggleBucketTool(): boolean {
    this.isBucketToolEnabled = !this.isBucketToolEnabled;
    return this.isBucketToolEnabled;
  }

  toggleDrawingMode(): boolean {
    return this.isDrawingModeEnabled
      ? this.disableDrawingMode()
      : this.enableDrawingMode();
  }

  clear(): void {
    this.context.clearRect(0, 0, this.width, this.height);
    this.positions = [];
    this.imageRestored = false;
    if (this.backgroundColor) this.setBackground(this.backgroundColor);
    this.handleEndDrawing();
  }

  save(): string {
    return this.canvas.toDataURL();
  }

  restore(backup: string, callback: () => void): void {
    const image = new Image();
    image.src = backup;
    image.onload = () => {
      this.imageRestored = true;
      this.context.drawImage(image, 0, 0);
      if (typeof callback === 'function') callback();
    };
  }

  undo(): void {
    const lastSnapshot = this.snapshots[this.snapshots.length - 1];
    const goToSnapshot = this.snapshots[this.snapshots.length - 2];
    if (goToSnapshot) {
      this.restoreCanvasSnapshot(goToSnapshot);
      this.snapshots.pop();
      this.undos.push(lastSnapshot);
      this.undos = this.undos.splice(-Math.abs(this.maxSnapshots));
      this.imageRestored = true;
    } else {
      this.logWarning('There are no more undos left.');
    }
  }

  redo(): void {
    if (this.undos.length > 0) {
      const lastUndo = this.undos.pop();
      if (lastUndo) {
        this.restoreCanvasSnapshot(lastUndo);
        this.snapshots.push(lastUndo);
        this.snapshots = this.snapshots.splice(-Math.abs(this.maxSnapshots));
      }
    } else {
      this.logWarning('There are no more redo left.');
    }
  }
}