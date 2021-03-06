import { Color } from '../../Color';
import { Display } from '../../Display';
import { Graphics } from '../../Graphics';
import { Point } from '../../positioning';
import { BooleanProperty, FloatProperty, IntProperty, PointsProperty } from '../../properties';
import { Widget } from '../../Widget';
import { AbstractContainerWidget } from '../others/AbstractContainerWidget';

const PROP_ALPHA = 'alpha';
const PROP_FILL_LEVEL = 'fill_level';
const PROP_HORIZONTAL_FILL = 'horizontal_fill';
const PROP_LINE_WIDTH = 'line_width';
const PROP_POINTS = 'points';

export class Polyline extends Widget {

    constructor(display: Display, parent: AbstractContainerWidget) {
        super(display, parent);
        this.properties.add(new IntProperty(PROP_ALPHA, 255));
        this.properties.add(new IntProperty(PROP_LINE_WIDTH));
        this.properties.add(new FloatProperty(PROP_FILL_LEVEL));
        this.properties.add(new BooleanProperty(PROP_HORIZONTAL_FILL));
        this.properties.add(new PointsProperty(PROP_POINTS, []));
    }

    draw(g: Graphics) {
        const ctx = g.ctx;
        ctx.globalAlpha = this.alpha / 255;
        if (this.transparent) {
            ctx.globalAlpha = 0;
        }
        this.drawShape(ctx, this.backgroundColor);
        if (this.fillLevel) {
            this.drawFill(ctx);
        }

        ctx.globalAlpha = 1;
    }

    private drawFill(ctx: CanvasRenderingContext2D) {
        let fillY = this.y;
        let fillWidth = this.width;
        let fillHeight = this.height;
        if (this.horizontalFill) {
            fillWidth *= (this.fillLevel / 100);
        } else {
            fillHeight *= (this.fillLevel / 100);
            fillY += fillHeight;
        }

        // Create a clip for the fill level
        ctx.save();
        let x = this.x - (this.lineWidth / 2);
        let y = fillY - (this.lineWidth / 2);
        let width = fillWidth + this.lineWidth;
        let height = fillHeight + this.lineWidth;
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.clip();

        // With clip active, draw the actual fill
        this.drawShape(ctx, this.foregroundColor);

        // Reset clip
        ctx.restore();
    }

    private drawShape(ctx: CanvasRenderingContext2D, color: Color) {
        ctx.strokeStyle = color.toString();
        ctx.lineWidth = this.lineWidth;
        ctx.beginPath();
        for (let i = 0; i < this.points.length; i++) {
            if (i == 0) {
                ctx.moveTo(this.points[i].x, this.points[i].y);
            } else {
                ctx.lineTo(this.points[i].x, this.points[i].y);
            }
        }
        ctx.stroke();
    }

    get alpha(): number { return this.properties.getValue(PROP_ALPHA); }
    get lineWidth(): number { return this.properties.getValue(PROP_LINE_WIDTH); }
    get fillLevel(): number { return this.properties.getValue(PROP_FILL_LEVEL); }
    get horizontalFill(): boolean { return this.properties.getValue(PROP_HORIZONTAL_FILL); }
    get points(): Point[] { return this.properties.getValue(PROP_POINTS); }
}
