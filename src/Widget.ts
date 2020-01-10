import { ActionSet } from './actions';
import { toBorderBox } from './Bounds';
import { Color } from './Color';
import { Display } from './Display';
import { HitCanvas } from './HitCanvas';
import { HitRegion } from './HitRegion';
import { ActionsProperty, BooleanProperty, ColorProperty, IntProperty, PropertySet, StringProperty } from './properties';
import { Script } from './scripting/Script';
import * as utils from './utils';
import { XMLNode } from './XMLParser';

const PROP_ACTIONS = 'actions';
const PROP_BACKGROUND_COLOR = 'background_color';
const PROP_BORDER_ALARM_SENSITIVE = 'border_alarm_sensitive';
const PROP_BORDER_COLOR = 'border_color';
const PROP_BORDER_WIDTH = 'border_width';
const PROP_BORDER_STYLE = 'border_style';
const PROP_FOREGROUND_COLOR = 'foreground_color';
const PROP_HEIGHT = 'height';
const PROP_NAME = 'name';
const PROP_PV_NAME = 'pv_name';
const PROP_TEXT = 'text';
const PROP_TRANSPARENT = 'transparent';
const PROP_VISIBLE = 'visible';
const PROP_WIDGET_TYPE = 'widget_type';
const PROP_WIDTH = 'width';
const PROP_WUID = 'wuid';
const PROP_X = 'x';
const PROP_Y = 'y';

export abstract class Widget {

    insets: [number, number, number, number] = [0, 0, 0, 0]; // T L B R

    // bbox around the widget (excluding border)
    x = 0;
    y = 0;
    width = 0;
    height = 0;

    // Some widgets disable this type of border
    // (Rectangle, RoundedRectangle)
    protected hideRoundedHolderBorder = false;

    protected properties = new PropertySet([
        new ActionsProperty(PROP_ACTIONS, new ActionSet()),
        new ColorProperty(PROP_BACKGROUND_COLOR, Color.TRANSPARENT),
        new BooleanProperty(PROP_BORDER_ALARM_SENSITIVE, false),
        new ColorProperty(PROP_BORDER_COLOR),
        new IntProperty(PROP_BORDER_STYLE),
        new IntProperty(PROP_BORDER_WIDTH),
        new ColorProperty(PROP_FOREGROUND_COLOR),
        new IntProperty(PROP_HEIGHT),
        new StringProperty(PROP_NAME),
        new StringProperty(PROP_PV_NAME),
        new StringProperty(PROP_TEXT, ''),
        new BooleanProperty(PROP_TRANSPARENT, false),
        new BooleanProperty(PROP_VISIBLE),
        new StringProperty(PROP_WIDGET_TYPE),
        new IntProperty(PROP_WIDTH),
        new StringProperty(PROP_WUID),
        new IntProperty(PROP_X),
        new IntProperty(PROP_Y),
    ]);

    holderRegion?: HitRegion;

    constructor(readonly display: Display) {
    }

    parseNode(node: XMLNode) {
        this.properties.loadXMLValues(node);

        this.insets = [0, 0, 0, 0];
        switch (this.borderStyle) {
            case 0: // Empty
                if (this.borderAlarmSensitive) {
                    this.insets = [2, 2, 2, 2];
                }
                break;
            case 1: // Line
                this.insets = [this.borderWidth, this.borderWidth, this.borderWidth, this.borderWidth];
                break;
            case 2: // Raised
            case 3: // Lowered
                this.insets = [1, 1, 1, 1];
                break;
            case 4: // Etched
            case 5: // Ridged
            case 6: // Button Raised
                this.insets = [2, 2, 2, 2];
                break;
            case 7: // Button Pressed
                this.insets = [2, 2, 1, 1];
                break;
            case 8: // Dot
            case 9: // Dash
            case 10: // Dash Dot
            case 11: // Dash Dot Dot
                this.insets = [this.borderWidth, this.borderWidth, this.borderWidth, this.borderWidth];
                break;
            case 12: // Title Bar
                this.insets = [16 + 1, 1, 1, 1];
                break;
            case 13: // Group Box
                this.insets = [16, 16, 16, 16];
                break;
            case 14: // Round Rectangle Background
                const i = this.borderWidth * 2;
                this.insets = [i, i, i, i];
                break;
        }

        // Shrink the available widget area
        this.x = this.holderX + this.insets[1];
        this.y = this.holderY + this.insets[0];
        this.width = this.holderWidth - this.insets[1] - this.insets[3];
        this.height = this.holderHeight - this.insets[0] - this.insets[2];

        if (this.actions.isClickable()) {
            this.holderRegion = {
                id: `${this.wuid}-holder`,
                click: () => this.onHolderClick(),
                cursor: 'pointer'
            }
        }
        this.init();
    }

    onHolderClick() {
        for (const idx of this.actions.getClickActions()) {
            this.executeAction(idx);
        }
    }

    drawHolder(ctx: CanvasRenderingContext2D, hitCanvas: HitCanvas) {
        if (this.borderStyle === 0) { // No border
            // This is a weird one. When there is no border the widget
            // shrinks according to an inset of 2px. This only happens when
            // the border is alarm-sensitive.
            if (this.borderAlarmSensitive) {
                // anything TODO ?
            }
        } else if (this.borderStyle === 1) { // Line
            ctx.strokeStyle = this.borderColor.toString();
            ctx.lineWidth = this.borderWidth;
            const box = toBorderBox(this.holderX, this.holderY, this.holderWidth, this.holderHeight, this.borderWidth);
            ctx.strokeRect(box.x, box.y, box.width, box.height);
        } else if (this.borderStyle === 14) { // Round Rectangle Background
            if (!this.hideRoundedHolderBorder) {
                ctx.fillStyle = this.backgroundColor.toString();
                ctx.strokeStyle = this.borderColor.toString();
                ctx.lineWidth = this.borderWidth;
                const box = toBorderBox(this.holderX, this.holderY, this.holderWidth, this.holderHeight, this.borderWidth);
                utils.roundRect(ctx, box.x, box.y, box.width, box.height, 4, 4);
                ctx.stroke();
            }
        } else if (this.borderStyle === 15) { // Empty
            // NOP
        } else {
            console.warn(`Unsupported border style: ${this.borderStyle}`);
        }

        if (this.holderRegion) {
            hitCanvas.beginHitRegion(this.holderRegion);
            hitCanvas.ctx.fillRect(this.holderX, this.holderY, this.holderWidth, this.holderHeight);
        }
    }

    drawSelection(ctx: CanvasRenderingContext2D) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.strokeRect(this.holderX - 0.5, this.holderY - 0.5, this.holderWidth + 1, this.holderHeight + 1);
        ctx.fillStyle = 'black';
        let r = 2;
        ctx.fillRect(this.holderX - r, this.holderY - r, r + r, r + r);
        ctx.fillRect(this.holderX + this.holderWidth / 2 - r, this.holderY - r, r + r, r + r);
        ctx.fillRect(this.holderX + this.holderWidth - r, this.holderY - r, r + r, r + r);

        ctx.fillRect(this.holderX - r, this.holderY + this.holderHeight / 2 - r, r + r, r + r);
        ctx.fillRect(this.holderX + this.holderWidth - r, this.holderY + this.holderHeight / 2 - r, r + r, r + r);

        ctx.fillRect(this.holderX - r, this.holderY + this.holderHeight - r, r + r, r + r);
        ctx.fillRect(this.holderX + this.holderWidth / 2 - r, this.holderY + this.holderHeight - r, r + r, r + r);
        ctx.fillRect(this.holderX + this.holderWidth - r, this.holderY + this.holderHeight - r, r + r, r + r);

        ctx.strokeStyle = 'white';
        r = 3;
        ctx.strokeRect(this.holderX - r + 0.5, this.holderY - r + 0.5, r + r - 1, r + r - 1);
        ctx.strokeRect(this.holderX + this.holderWidth / 2 - r + 0.5, this.holderY - r + 0.5, r + r - 1, r + r - 1);
        ctx.strokeRect(this.holderX + this.holderWidth - r + 0.5, this.holderY - r + 0.5, r + r - 1, r + r - 1);

        ctx.strokeRect(this.holderX - r + 0.5, this.holderY + this.holderHeight / 2 - r + 0.5, r + r - 1, r + r - 1);
        ctx.strokeRect(this.holderX + this.holderWidth - r + 0.5, this.holderY + this.holderHeight / 2 - r + 0.5, r + r - 1, r + r - 1);

        ctx.strokeRect(this.holderX - r + 0.5, this.holderY + this.holderHeight - r + 0.5, r + r - 1, r + r - 1);
        ctx.strokeRect(this.holderX + this.holderWidth / 2 - r + 0.5, this.holderY + this.holderHeight - r + 0.5, r + r - 1, r + r - 1);
        ctx.strokeRect(this.holderX + this.holderWidth - r + 0.5, this.holderY + this.holderHeight - r + 0.5, r + r - 1, r + r - 1);
    }

    requestRepaint() {
        this.display.requestRepaint();
    }

    protected executeAction(index: number) {
        const action = this.actions.getAction(index);
        if (!action) {
            return;
        }

        switch (action.type) {
            case 'OPEN_DISPLAY':
                if (action.mode === 0) { // Replace current display
                    this.display.setSource(action.path);
                } else { // Open in new window
                    // TODO, just generate event?
                    console.warn('An action requested to open an external display');
                }
                break;
            case 'EXECUTE_JAVASCRIPT':
                if (action.embedded) {
                    const script = new Script(this.display, action.text!);
                    script.run();
                } else {
                    console.warn('An action requested to run an external script');
                    /*const path = this.display.resolve(action.path!);
                    this.display.displayCommunicator.getObject('displays', path).then(response => {
                        response.text().then(text => {
                            const script = new Script(this.display, text);
                            script.run();
                        });
                    });*/
                }
                break;
            case 'WRITE_PV':
                if (action.pvName) {
                    this.display.pvEngine.setValue(action.pvName, action.value);
                }
                break;
        }
    }

    get wuid(): string { return this.properties.getValue(PROP_WUID); }
    get name(): string { return this.properties.getValue(PROP_NAME); }
    get holderX(): number { return this.properties.getValue(PROP_X); }
    get holderY(): number { return this.properties.getValue(PROP_Y); }
    get holderWidth(): number { return this.properties.getValue(PROP_WIDTH); }
    get holderHeight(): number { return this.properties.getValue(PROP_HEIGHT); }
    get borderAlarmSensitive(): boolean {
        return this.properties.getValue(PROP_BORDER_ALARM_SENSITIVE);
    }
    get borderColor(): Color { return this.properties.getValue(PROP_BORDER_COLOR); }
    get borderStyle(): number { return this.properties.getValue(PROP_BORDER_STYLE); }
    get borderWidth(): number { return this.properties.getValue(PROP_BORDER_WIDTH); }
    get backgroundColor(): Color { return this.properties.getValue(PROP_BACKGROUND_COLOR); }
    get foregroundColor(): Color { return this.properties.getValue(PROP_FOREGROUND_COLOR); }
    get transparent(): boolean { return this.properties.getValue(PROP_TRANSPARENT); }
    get visible(): boolean { return this.properties.getValue(PROP_VISIBLE); }
    get actions(): ActionSet { return this.properties.getValue(PROP_ACTIONS); }

    get text(): string {
        const rawText = this.properties.getValue(PROP_TEXT);
        return rawText.split(' ').join('\u00a0'); // Preserve whitespace
    }

    init(): void { };
    abstract draw(ctx: CanvasRenderingContext2D, hitCanvas: HitCanvas): void;
}
