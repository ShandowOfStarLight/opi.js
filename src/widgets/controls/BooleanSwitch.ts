import { Color } from '../../Color';
import { Display } from '../../Display';
import { Graphics } from '../../Graphics';
import { HitCanvas, HitRegionSpecification } from '../../HitCanvas';
import { Bounds } from '../../positioning';
import { BooleanProperty, ColorProperty, IntProperty, StringProperty } from '../../properties';
import { Widget } from '../../Widget';

const PROP_EFFECT_3D = 'effect_3d';
const PROP_OFF_COLOR = 'off_color';
const PROP_OFF_LABEL = 'off_label';
const PROP_ON_COLOR = 'on_color';
const PROP_ON_LABEL = 'on_label';
const PROP_PUSH_ACTION_INDEX = 'push_action_index';
const PROP_RELEASE_ACTION_INDEX = 'released_action_index'; // with 'd'
const PROP_TOGGLE_BUTTON = 'toggle_button';

export class BooleanSwitch extends Widget {

    private enabled = false;

    private shaftRegion?: HitRegionSpecification;

    constructor(display: Display) {
        super(display);
        this.properties.add(new BooleanProperty(PROP_EFFECT_3D));
        this.properties.add(new ColorProperty(PROP_ON_COLOR));
        this.properties.add(new StringProperty(PROP_ON_LABEL));
        this.properties.add(new ColorProperty(PROP_OFF_COLOR));
        this.properties.add(new StringProperty(PROP_OFF_LABEL));
        this.properties.add(new IntProperty(PROP_PUSH_ACTION_INDEX));
        this.properties.add(new IntProperty(PROP_RELEASE_ACTION_INDEX));
        this.properties.add(new BooleanProperty(PROP_TOGGLE_BUTTON));
    }

    init() {
        this.shaftRegion = {
            id: `${this.wuid}-shaft`,
            mouseDown: () => this.toggle(),
            cursor: 'pointer'
        }
    }

    private toggle() {
        this.enabled = !this.enabled;
        this.enabled ? this.toggleOn() : this.toggleOff();
        this.requestRepaint();
    }

    private toggleOn() {
        if (this.pv && this.pv.isWritable()) {
            this.pv.value = 1;
        }
        this.executeAction(this.pushActionIndex);
    }

    private toggleOff() {
        if (this.pv && this.pv.isWritable()) {
            this.pv.value = 0;
        }
        if (this.releaseActionIndex !== undefined) {
            this.executeAction(this.releaseActionIndex);
        }
    }

    draw(g: Graphics, hitCanvas: HitCanvas) {
        if (this.width > this.height) {
            this.drawHorizontal(g.ctx, hitCanvas);
        } else {
            this.drawVertical(g.ctx, hitCanvas);
        }
    }

    private drawHorizontal(ctx: CanvasRenderingContext2D, hitCanvas: HitCanvas) {
        let areaWidth = this.width;
        let areaHeight = this.height;
        if (areaHeight > areaWidth / 2) {
            areaHeight = Math.floor(this.width / 2);
        } else {
            areaWidth = Math.floor(2 * this.height);
        }

        const pedBounds = {
            x: Math.floor((63.0 / 218.0) * areaWidth),
            y: 0,
            width: areaHeight / 2,
            height: areaHeight / 2,
        };
        this.drawPedestal(ctx, pedBounds);

        const largeWidth = Math.floor((35.0 / 218.0) * areaWidth);
        const largeHeight = Math.floor((45.0 / 105.0) * areaHeight);
        const smallWidth = Math.floor((43.0 / 218.0) * areaWidth);
        const smallHeight = Math.floor((35.0 / 105.0) * areaHeight);

        const smallMove = Math.floor((1.0 / 7.0) * pedBounds.width);

        if (this.enabled) {
            const onLargeBounds: Bounds = {
                x: 2 * pedBounds.x + pedBounds.width - largeWidth,
                y: pedBounds.height / 2 - largeHeight / 2,
                width: largeWidth,
                height: largeHeight
            };
            const onSmallBounds: Bounds = {
                x: pedBounds.x + pedBounds.width / 2 - smallWidth / 2 + smallMove,
                y: pedBounds.y + pedBounds.height / 2 - smallHeight / 2,
                width: smallWidth,
                height: smallHeight,
            };
            this.drawHorizontalBar(ctx, hitCanvas, onSmallBounds, onLargeBounds, true);
        } else {
            const offLargeBounds: Bounds = {
                x: 0,
                y: pedBounds.height / 2 - largeHeight / 2,
                width: largeWidth,
                height: largeHeight,
            };
            const offSmallBounds: Bounds = {
                x: pedBounds.x + pedBounds.width / 2 - smallWidth / 2 - smallMove,
                y: pedBounds.y + pedBounds.height / 2 - smallHeight / 2,
                width: smallWidth,
                height: smallHeight,
            };
            this.drawHorizontalBar(ctx, hitCanvas, offSmallBounds, offLargeBounds, false);
        }
    }

    private drawVertical(ctx: CanvasRenderingContext2D, hitCanvas: HitCanvas) {
        let areaWidth = this.width;
        let areaHeight = this.height;
        if (areaWidth > areaHeight / 2) {
            areaWidth = Math.floor(this.height / 2);
        } else {
            areaHeight = Math.floor(2 * this.width);
        }

        const pedBounds = {
            x: 0,
            y: Math.floor((63.0 / 218.0) * areaHeight),
            width: areaWidth / 2,
            height: areaWidth / 2,
        };
        this.drawPedestal(ctx, pedBounds);

        const largeWidth = Math.floor((45.0 / 105.0) * areaWidth);
        const largeHeight = Math.floor((35.0 / 218.0) * areaHeight);
        const smallWidth = Math.floor((35.0 / 105.0) * areaWidth);
        const smallHeight = Math.floor((43.0 / 218.0) * areaHeight);

        if (this.enabled) {
            const onLargeBounds: Bounds = {
                x: pedBounds.width / 2 - largeWidth / 2,
                y: 0,
                width: largeWidth,
                height: largeHeight
            };
            const onSmallBounds: Bounds = {
                x: pedBounds.x + pedBounds.width / 2 - smallWidth / 2,
                y: pedBounds.y + pedBounds.height / 2 - smallHeight / 2,
                width: smallWidth,
                height: smallHeight,
            };
            onSmallBounds.y -= Math.floor((1.0 / 7.0) * pedBounds.height);
            this.drawVerticalBar(ctx, hitCanvas, onSmallBounds, onLargeBounds, true);
        } else {
            const barHeight = pedBounds.y + pedBounds.height / 2 + smallHeight / 2 + 2;
            const offLargeBounds: Bounds = {
                x: pedBounds.width / 2 - largeWidth / 2,
                y: pedBounds.y + pedBounds.height / 2 - smallHeight / 2 + barHeight - largeHeight,
                width: largeWidth,
                height: largeHeight,
            };
            const offSmallBounds: Bounds = {
                x: pedBounds.x + pedBounds.width / 2 - smallWidth / 2,
                y: pedBounds.y + pedBounds.height / 2 - smallHeight / 2,
                width: smallWidth,
                height: smallHeight,
            };
            offSmallBounds.y += Math.floor((1.0 / 7.0) * pedBounds.height);
            this.drawVerticalBar(ctx, hitCanvas, offSmallBounds, offLargeBounds, false);
        }
    }

    private drawPedestal(ctx: CanvasRenderingContext2D, bounds: Bounds) {
        let cx = this.x + bounds.x + (bounds.width / 2);
        let cy = this.y + bounds.y + (bounds.height / 2);
        let rx = bounds.width / 2;
        let ry = bounds.height / 2;
        ctx.fillStyle = this.effect3d ? Color.WHITE.toString() : Color.GRAY.toString();
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
        ctx.fill();

        if (this.effect3d) {
            const gradient = ctx.createLinearGradient(this.x + bounds.x, this.y + bounds.y,
                this.x + bounds.x + bounds.width, this.y + bounds.y + bounds.height);

            if (this.enabled) {
                gradient.addColorStop(0, `rgba(255,255,255,${10 / 255})`);
                gradient.addColorStop(1, `rgba(0,0,0,${100 / 255})`);
            } else {
                gradient.addColorStop(0, 'rgba(0,0,0,0)');
                gradient.addColorStop(1, `rgba(0,0,0,${150 / 255})`);
            }
            ctx.fillStyle = gradient;
            ctx.fill();
        }
    }

    private drawHorizontalBar(ctx: CanvasRenderingContext2D, hitCanvas: HitCanvas, sm: Bounds, lg: Bounds, booleanValue: boolean) {
        let stopOpacity1 = (booleanValue ? 0 : 10) / 255;
        let stopOpacity2 = (booleanValue ? 150 : 220) / 255;

        const gradient = ctx.createLinearGradient(this.x + lg.x, this.y + lg.y, this.x + lg.x, this.y + lg.y + lg.height);
        gradient.addColorStop(0, `rgba(0,0,0,${stopOpacity1})`);
        gradient.addColorStop(1, `rgba(0,0,0,${stopOpacity2})`);

        hitCanvas.beginHitRegion(this.shaftRegion!);

        /*
         * Small end
         */
        let cx = this.x + sm.x + (sm.width / 2);
        let cy = this.y + sm.y + (sm.height / 2);
        let rx = sm.width / 2;
        let ry = sm.height / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);

        hitCanvas.ctx.beginPath();
        hitCanvas.ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
        hitCanvas.ctx.fill();

        ctx.fillStyle = booleanValue ? this.onColor.toString() : this.offColor.toString();
        ctx.fill();
        if (this.effect3d) {
            ctx.fillStyle = gradient;
            ctx.fill();
        }

        /*
         * Bar
         */
        const points = [
            Math.round(this.x + lg.x + lg.width / 2), Math.round(this.y + lg.y),
            Math.round(this.x + lg.x + lg.width / 2), Math.round(this.y + lg.y + lg.height),
            Math.round(this.x + sm.x + sm.width / 2), Math.round(this.y + sm.y + sm.height),
            Math.round(this.x + sm.x + sm.width / 2), Math.round(this.y + sm.y),
        ];
        ctx.beginPath();
        ctx.moveTo(points[0], points[1]);
        ctx.lineTo(points[2], points[3]);
        ctx.lineTo(points[4], points[5]);
        ctx.lineTo(points[6], points[7]);
        ctx.closePath();

        hitCanvas.ctx.beginPath();
        hitCanvas.ctx.moveTo(points[0], points[1]);
        hitCanvas.ctx.lineTo(points[2], points[3]);
        hitCanvas.ctx.lineTo(points[4], points[5]);
        hitCanvas.ctx.lineTo(points[6], points[7]);
        hitCanvas.ctx.closePath();
        hitCanvas.ctx.fill();

        ctx.fillStyle = booleanValue ? this.onColor.toString() : this.offColor.toString();
        ctx.fill();
        if (this.effect3d) {
            ctx.fillStyle = gradient;
            ctx.fill();
        }

        /*
         * Large end
         */
        cx = this.x + lg.x + (lg.width / 2);
        cy = this.y + lg.y + (lg.height / 2);
        rx = lg.width / 2;
        ry = lg.height / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);

        hitCanvas.ctx.beginPath();
        hitCanvas.ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
        hitCanvas.ctx.fill();

        ctx.fillStyle = booleanValue ? this.onColor.toString() : this.offColor.toString();
        ctx.fill();
        if (this.effect3d) {
            const w = Math.sqrt(rx * rx + ry * ry);
            const wp = ry - rx;
            const x1 = this.x + lg.x + rx + (wp - w) / 2 - 1;
            const y1 = this.x + lg.y + ry - (wp + w) / 2 - 1;
            const x2 = this.x + lg.x + rx + (wp + w) / 2 + 5;
            const y2 = this.x + lg.y + ry - (wp - w) / 2 + 5;
            const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
            gradient.addColorStop(0, `rgba(0,0,0,${stopOpacity1})`);
            gradient.addColorStop(1, `rgba(0,0,0,${stopOpacity2})`);
            ctx.fillStyle = gradient;
            ctx.fill();
        }
    }

    private drawVerticalBar(ctx: CanvasRenderingContext2D, hitCanvas: HitCanvas, sm: Bounds, lg: Bounds, booleanValue: boolean) {
        const gradient = ctx.createLinearGradient(this.x + lg.x, this.y + lg.y, this.x + lg.x + lg.width, this.y + lg.y);
        gradient.addColorStop(0, `rgba(0,0,0,${10 / 255})`);
        gradient.addColorStop(1, `rgba(0,0,0,${booleanValue ? 210 / 255 : 160 / 255})`);

        hitCanvas.beginHitRegion(this.shaftRegion!);

        /*
         * Small end
         */
        let cx = this.x + sm.x + (sm.width / 2);
        let cy = this.y + sm.y + (sm.height / 2);
        ctx.beginPath();
        ctx.ellipse(cx, cy, sm.width / 2, sm.height / 2, 0, 0, 2 * Math.PI);

        hitCanvas.ctx.beginPath();
        hitCanvas.ctx.ellipse(cx, cy, sm.width / 2, sm.height / 2, 0, 0, 2 * Math.PI);
        hitCanvas.ctx.fill();

        ctx.fillStyle = (booleanValue) ? this.onColor.toString() : this.offColor.toString();
        ctx.fill();
        if (this.effect3d) {
            ctx.fillStyle = gradient;
            ctx.fill();
        }

        /*
         * Bar
         */
        const points = [
            Math.round(this.x + lg.x), Math.round(this.y + lg.y + lg.height / 2),
            Math.round(this.x + lg.x + lg.width), Math.round(this.y + lg.y + lg.height / 2),
            Math.round(this.x + sm.x + sm.width), Math.round(this.y + sm.y + sm.height / 2),
            Math.round(this.x + sm.x), Math.round(this.y + sm.y + sm.height / 2)
        ];
        ctx.beginPath();
        ctx.moveTo(points[0], points[1]);
        ctx.lineTo(points[2], points[3]);
        ctx.lineTo(points[4], points[5]);
        ctx.lineTo(points[6], points[7]);
        ctx.closePath();

        hitCanvas.ctx.beginPath();
        hitCanvas.ctx.moveTo(points[0], points[1]);
        hitCanvas.ctx.lineTo(points[2], points[3]);
        hitCanvas.ctx.lineTo(points[4], points[5]);
        hitCanvas.ctx.lineTo(points[6], points[7]);
        hitCanvas.ctx.closePath();
        hitCanvas.ctx.fill();

        ctx.fillStyle = (booleanValue) ? this.onColor.toString() : this.offColor.toString();
        ctx.fill();
        if (this.effect3d) {
            ctx.fillStyle = gradient;
            ctx.fill();
        }

        /*
         * Large end
         */
        cx = this.x + lg.x + (lg.width / 2);
        cy = this.y + lg.y + (lg.height / 2);
        const rx = lg.width / 2;
        const ry = lg.height / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);

        hitCanvas.ctx.beginPath();
        hitCanvas.ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
        hitCanvas.ctx.fill();

        ctx.fillStyle = (booleanValue) ? this.onColor.toString() : this.offColor.toString();
        ctx.fill();
        if (this.effect3d) {
            const gradient = ctx.createLinearGradient(this.x + lg.x, this.y + lg.y, this.x + lg.width, this.y + lg.height);
            gradient.addColorStop(0, `rgba(0,0,0,${(booleanValue ? 5 : 10) / 255})`);
            gradient.addColorStop(1, `rgba(0,0,0,${(booleanValue ? 180 : 160) / 255})`);
            ctx.fillStyle = gradient;
            ctx.fill();
        }
    }

    get toggleButton(): boolean { return this.properties.getValue(PROP_TOGGLE_BUTTON); }
    get pushActionIndex(): number { return this.properties.getValue(PROP_PUSH_ACTION_INDEX); }
    get releaseActionIndex(): number { return this.properties.getValue(PROP_RELEASE_ACTION_INDEX); }
    get effect3d(): boolean { return this.properties.getValue(PROP_EFFECT_3D); }
    get onColor(): Color { return this.properties.getValue(PROP_ON_COLOR); }
    get onLabel(): string { return this.properties.getValue(PROP_ON_LABEL); }
    get offColor(): Color { return this.properties.getValue(PROP_OFF_COLOR); }
    get offLabel(): string { return this.properties.getValue(PROP_OFF_LABEL); }
}
