import { Color } from '../../Color';
import { Display } from '../../Display';
import { BooleanProperty, ColorProperty, FloatProperty, IntProperty } from '../../properties';
import { Widget } from '../../Widget';

const PROP_ALPHA = 'alpha';
const PROP_BG_GRADIENT_COLOR = 'bg_gradient_color';
const PROP_FG_GRADIENT_COLOR = 'fg_gradient_color';
const PROP_FILL_LEVEL = 'fill_level';
const PROP_GRADIENT = 'gradient';
const PROP_HORIZONTAL_FILL = 'horizontal_fill';
const PROP_LINE_COLOR = 'line_color';
const PROP_LINE_WIDTH = 'line_width';

export class Rectangle extends Widget {

    constructor(display: Display) {
        super(display);
        this.hideRoundedHolderBorder = true;
        this.properties.add(new IntProperty(PROP_ALPHA))
        this.properties.add(new ColorProperty(PROP_BG_GRADIENT_COLOR));
        this.properties.add(new ColorProperty(PROP_FG_GRADIENT_COLOR));
        this.properties.add(new BooleanProperty(PROP_GRADIENT));
        this.properties.add(new IntProperty(PROP_LINE_WIDTH));
        this.properties.add(new FloatProperty(PROP_FILL_LEVEL));
        this.properties.add(new BooleanProperty(PROP_HORIZONTAL_FILL));
        this.properties.add(new ColorProperty(PROP_LINE_COLOR));
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.globalAlpha = this.alpha / 255;
        if (this.transparent) {
            ctx.globalAlpha = 0;
        }

        this.drawBackground(ctx);
        if (this.fillLevel) {
            this.drawFill(ctx);
        }

        ctx.globalAlpha = 1;
    }

    private drawBackground(ctx: CanvasRenderingContext2D) {
        if (this.gradient) {
            const x2 = this.horizontalFill ? this.x : this.x + this.width;
            const y2 = this.horizontalFill ? this.y + this.height : this.y;
            const gradient = ctx.createLinearGradient(this.x, this.y, x2, y2);
            gradient.addColorStop(0, this.backgroundGradientStartColor.toString());
            gradient.addColorStop(1, this.backgroundColor.toString());
            ctx.fillStyle = gradient;
        } else {
            ctx.fillStyle = this.backgroundColor.toString();
        }

        ctx.fillRect(this.x, this.y, this.width, this.height);

        if (this.lineWidth) {
            ctx.lineWidth = this.lineWidth;
            ctx.strokeStyle = this.lineColor.toString();
            ctx.stroke();
        }
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
        let x = this.x + (this.lineWidth / 2);
        let y = fillY - (this.lineWidth / 2);
        let width = fillWidth - this.lineWidth;
        let height = fillHeight - this.lineWidth;
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.clip();

        // With clip active, draw the actual fill
        if (this.gradient) {
            const x2 = this.horizontalFill ? this.x : this.x + this.width;
            const y2 = this.horizontalFill ? this.y + this.height : this.y;
            const gradient = ctx.createLinearGradient(this.x, this.y, x2, y2);
            gradient.addColorStop(0, this.foregroundGradientStartColor.toString());
            gradient.addColorStop(1, this.foregroundColor.toString());
            ctx.fillStyle = gradient;
        } else {
            ctx.fillStyle = this.foregroundColor.toString();
        }

        x = this.x + (this.lineWidth / 2);
        y = this.y + (this.lineWidth / 2);
        width = this.width - this.lineWidth;
        height = this.height - this.lineWidth;
        ctx.fillRect(x, y, width, height);

        // Reset clip
        ctx.restore();
    }

    get alpha(): number { return this.properties.getValue(PROP_ALPHA); }
    get lineWidth(): number { return this.properties.getValue(PROP_LINE_WIDTH); }
    get fillLevel(): number { return this.properties.getValue(PROP_FILL_LEVEL); }
    get horizontalFill(): boolean { return this.properties.getValue(PROP_HORIZONTAL_FILL); }
    get lineColor(): Color { return this.properties.getValue(PROP_LINE_COLOR); }
    get gradient(): boolean { return this.properties.getValue(PROP_GRADIENT); }
    get backgroundGradientStartColor(): Color {
        return this.properties.getValue(PROP_BG_GRADIENT_COLOR);
    }
    get foregroundGradientStartColor(): Color {
        return this.properties.getValue(PROP_FG_GRADIENT_COLOR);
    }
}