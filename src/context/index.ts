import kaplayGamepadHaptics from "@r47onfire/kaplay-gamepad-haptics";
import kaplay from "kaplay";
import kaplayLighting from "kaplay-lighting";
import { min } from "lib0/math";
import { SCALE } from "../config/constants";
import { kaplayBackground } from "./plugins/kaplay-background-more";
import { kaplayDynamicStrings } from "./plugins/kaplay-dynamic-text";
import { kaplayExtraDistance } from "./plugins/kaplay-extradistance";
import { kaplayHoverArea } from "./plugins/kaplay-hover-area";
import { kaplayXterm256 } from "./plugins/kaplay-xterm256";
import { kaplayZzFX } from "./plugins/kaplay-zzfx";

export const K = kaplay({
    debug: true,
    crisp: true,
    global: false,
    pixelDensity: min(window.devicePixelRatio, 2),
    scale: SCALE,
    background: "#000000",
    touchToMouse: false,
    inspectOnlyActive: true,
    tagComponentIds: false,
    spriteAtlasPadding: 0,
    plugins: [
        kaplayXterm256,
        kaplayZzFX,
        // kaplayZzFXM,
        kaplayExtraDistance,
        kaplayDynamicStrings,
        kaplayGamepadHaptics,
        kaplayLighting,
        kaplayHoverArea,
        kaplayBackground,
    ],
});

K.onLoadError((which, e) => {
    const newError = new Error(`Error while loading ${which}: ${e.error?.message ?? e.error}`);
    if (e.error?.stack) newError.stack = e.error.stack;
    throw newError;
});
