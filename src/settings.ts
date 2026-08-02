import { type App, PluginSettingTab, type SettingDefinitionItem } from "obsidian";

import type HideSidebarsOnWindowResizePlugin from "./main.ts";

export interface HideSidebarsOnWindowResizeSettings {
    leftMinWidth: number;
    rightMinWidth: number;
    showSidebarsBack: boolean;
}

export const DEFAULT_SETTINGS: HideSidebarsOnWindowResizeSettings = {
    leftMinWidth: 1_400,
    rightMinWidth: 1_100,
    showSidebarsBack: true,
};

export class SettingsTab extends PluginSettingTab {
    override plugin: HideSidebarsOnWindowResizePlugin;

    constructor(app: App, plugin: HideSidebarsOnWindowResizePlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    override getSettingDefinitions(): SettingDefinitionItem<keyof HideSidebarsOnWindowResizeSettings>[] {
        return [
            {
                name: "Hide the left sidebar when the window is this narrow",
                desc: "Increase this to hide the left sidebar sooner; decrease it to delay hiding",
                control: {
                    type: "number",
                    key: "leftMinWidth",
                    defaultValue: DEFAULT_SETTINGS.leftMinWidth,
                },
            },
            {
                name: "Hide the right sidebar when the window is this narrow",
                desc: "Increase this to hide the right sidebar sooner; decrease it to delay hiding",
                control: {
                    type: "number",
                    key: "rightMinWidth",
                    defaultValue: DEFAULT_SETTINGS.rightMinWidth,
                },
            },
            {
                name: "Show sidebars back when window becomes wide again",
                desc: "Sidebars remain hidden if option is disabled",
                control: {
                    type: "toggle",
                    key: "showSidebarsBack",
                    defaultValue: DEFAULT_SETTINGS.showSidebarsBack,
                },
            },
        ];
    }
}
