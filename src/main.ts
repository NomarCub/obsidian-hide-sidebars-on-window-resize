import { Plugin } from "obsidian";
/* eslint-disable-next-line @typescript-eslint/no-unused-vars --
   biome-ignore lint/correctness/noUnusedImports: see below
   using the recommended `import "obsidian-typings";` breaks esbuild */
import * as obsidianInternal from "obsidian-typings";

import { DEFAULT_SETTINGS, type HideSidebarsOnWindowResizeSettings, SettingsTab } from "./settings";

type ZenModePlugin = Plugin & {
    // see: https://github.com/paperbenni/obsidian-zenmode/blob/1.5.4/main.ts#L433-L445
    settings: { zenMode: boolean };
};

export default class HideSidebarsOnWindowResizePlugin extends Plugin {
    settings!: HideSidebarsOnWindowResizeSettings;
    previousWidth!: number;

    override async onload(): Promise<void> {
        console.log(`Loading ${this.manifest.name} plugin`);

        await this.loadSettings();
        this.addSettingTab(new SettingsTab(this.app, this));

        this.app.workspace.onLayoutReady(() => {
            this.previousWidth = window.innerWidth;
            this.toggleSidebars();

            this.app.workspace.on("resize", () => {
                this.toggleSidebars();
            });
        });
    }

    toggleSidebars(): void {
        const width = window.innerWidth;

        if (
            width < this.settings.leftMinWidth &&
            width < this.previousWidth &&
            !this.app.workspace.leftSplit.collapsed
        ) {
            this.app.workspace.leftSplit.collapse();
        } else if (
            width > this.settings.leftMinWidth &&
            width > this.previousWidth &&
            this.app.workspace.leftSplit.collapsed &&
            this.settings.showSidebarsBack &&
            !this.isInCompactMode()
        ) {
            this.app.workspace.leftSplit.expand();
        }

        if (
            width < this.settings.rightMinWidth &&
            width < this.previousWidth &&
            !this.app.workspace.rightSplit.collapsed
        ) {
            this.app.workspace.rightSplit.collapse();
        } else if (
            width > this.settings.rightMinWidth &&
            width > this.previousWidth &&
            this.app.workspace.rightSplit.collapsed &&
            this.settings.showSidebarsBack &&
            !this.isInCompactMode()
        ) {
            this.app.workspace.rightSplit.expand();
        }

        this.previousWidth = width;
    }

    /** indicates that the app is in a mode where sidebars should not be auto-expanded */
    isInCompactMode(): boolean {
        const zenModePlugin = this.app.plugins.getPlugin("zenmode") as ZenModePlugin | null;
        return zenModePlugin?.settings.zenMode ?? false;
    }

    async loadSettings(): Promise<void> {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData(),
        ) as HideSidebarsOnWindowResizeSettings;
    }

    async saveSettings(): Promise<void> {
        await this.saveData(this.settings);
        this.toggleSidebars();
    }
}
