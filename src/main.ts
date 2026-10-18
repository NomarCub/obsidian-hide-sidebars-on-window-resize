import { Plugin } from "obsidian";
import type {} from "obsidian-typings";

import { DEFAULT_SETTINGS, type HideSidebarsOnWindowResizeSettings, SettingsTab } from "./settings.ts";

type ZenModePlugin = Plugin & {
    // see: https://github.com/paperbenni/obsidian-zenmode/blob/1.5.4/main.ts#L433-L445
    settings: { zenMode: boolean };
};

export default class HideSidebarsOnWindowResizePlugin extends Plugin {
    override settings!: HideSidebarsOnWindowResizeSettings;
    previousWidth!: number;
    leftClosedByPlugin = false;
    rightClosedByPlugin = false;

    override async onload(): Promise<void> {
        await this.loadSettings();
        this.addSettingTab(new SettingsTab(this.app, this));

        this.app.workspace.onLayoutReady(() => {
            this.previousWidth = window.innerWidth;
            this.refreshSidebars();

            this.app.workspace.on("resize", () => {
                this.refreshSidebars();
            });
        });
    }

    refreshSidebars(): void {
        const width = window.innerWidth;

        // Left Sidebar
        if (
            width < this.settings.leftMinWidth &&
            width < this.previousWidth &&
            !this.app.workspace.leftSplit.collapsed
        ) {
            this.app.workspace.leftSplit.collapse();
            this.leftClosedByPlugin = true;
        } else if (
            width > this.settings.leftMinWidth &&
            width > this.previousWidth &&
            this.app.workspace.leftSplit.collapsed &&
            this.settings.showSidebarsBack &&
            !this.isInCompactMode() &&
            (this.settings.reopenManuallyCollapsedSidebars || this.leftClosedByPlugin)
        ) {
            this.app.workspace.leftSplit.expand();
            this.leftClosedByPlugin = false;
        }

        // Right Sidebar
        if (
            width < this.settings.rightMinWidth &&
            width < this.previousWidth &&
            !this.app.workspace.rightSplit.collapsed
        ) {
            this.app.workspace.rightSplit.collapse();
            this.rightClosedByPlugin = true;
        } else if (
            width > this.settings.rightMinWidth &&
            width > this.previousWidth &&
            this.app.workspace.rightSplit.collapsed &&
            this.settings.showSidebarsBack &&
            !this.isInCompactMode() &&
            (this.settings.reopenManuallyCollapsedSidebars || this.rightClosedByPlugin)
        ) {
            this.app.workspace.rightSplit.expand();
            this.rightClosedByPlugin = false;
        }

        // Clear plugin ownership while the sidebar is open
        if (!this.app.workspace.leftSplit.collapsed) {
            this.leftClosedByPlugin = false;
        }
        if (!this.app.workspace.rightSplit.collapsed) {
            this.rightClosedByPlugin = false;
        }

        this.previousWidth = width;
    }

    /** indicates that the app is in a mode where sidebars should not be auto-expanded */
    isInCompactMode(): boolean {
        const zenModePlugin = this.app.plugins.getPlugin("zenmode") as ZenModePlugin | null;
        return zenModePlugin?.settings.zenMode ?? false;
    }

    async loadSettings(): Promise<void> {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }
}
