import { Display } from '../../Display';
import { Font } from '../../Font';
import { FontProperty, IntProperty } from '../../properties';
import { Widget } from '../../Widget';

const PROP_FONT = 'font';
const PROP_HORIZONTAL_ALIGNMENT = 'horizontal_alignment';
const PROP_VERTICAL_ALIGNMENT = 'vertical_alignment';

export class TextUpdate extends Widget {

    constructor(display: Display) {
        super(display);
        this.properties.add(new FontProperty(PROP_FONT));
        this.properties.add(new IntProperty(PROP_HORIZONTAL_ALIGNMENT));
        this.properties.add(new IntProperty(PROP_VERTICAL_ALIGNMENT));
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (!this.transparent) {
            ctx.fillStyle = this.backgroundColor.toString();
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

        ctx.fillStyle = this.foregroundColor.toString();
        ctx.font = this.font.getFontString();

        let x = this.x;
        if (this.horizAlignment === 0) { // LEFT
            ctx.textAlign = 'start';
        } else if (this.horizAlignment === 1) { // CENTER
            x += this.width / 2;
            ctx.textAlign = 'center';
        } else if (this.horizAlignment === 2) { // RIGHT
            x += this.width;
            ctx.textAlign = 'end';
        }

        let y = this.y;
        if (this.vertAlignment === 0) { // TOP
            ctx.textBaseline = 'top';
        } else if (this.vertAlignment === 1) { // MIDDLE
            y = y + (this.height / 2);
            ctx.textBaseline = 'middle';
        } else if (this.vertAlignment === 2) { // BOTTOM
            y = y + this.height;
            ctx.textBaseline = 'bottom';
        }

        let text = this.text;
        if (this.pv && this.pv.value !== undefined) {
            text = String(this.pv.value);
        }

        ctx.fillText(text, x, y);
    }

    get font(): Font { return this.properties.getValue(PROP_FONT); }
    get horizAlignment(): number { return this.properties.getValue(PROP_HORIZONTAL_ALIGNMENT); }
    get vertAlignment(): number { return this.properties.getValue(PROP_VERTICAL_ALIGNMENT); }
}
