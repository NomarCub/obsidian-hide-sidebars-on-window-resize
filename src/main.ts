import { Plugin } from "obsidian";
import { HideSidebarsOnWindowResizeSettings, SettingsTab, DEFAULT_SETTINGS } from "./settings";

export default class HideSidebarsOnWindowResizePlugin extends Plugin {
    settings!: HideSidebarsOnWindowResizeSettings;
    previousWidth!: number;

    override async onload() {
        console.log("Loading " + this.manifest.name + " plugin");

        await this.loadSettings();
        this.addSettingTab(new SettingsTab(this.app, this));

        this.app.workspace.onLayoutReady(() => {
            this.previousWidth = window.innerWidth;
            this.toggleSidebars();

            this.app.workspace.on("resize", () => { this.toggleSidebars(); });
        });
    }

    toggleSidebars() {
        const width = window.innerWidth;

        if (this.shouldCollapsLeftSidebar(width)) {
            this.app.workspace.leftSplit.collapse();
        } else if (this.shouldExpandLeftSidebar(width)) {
            this.app.workspace.leftSplit.expand();
        }

        if (this.shouldCollapsRightSidebar(width)) {
            this.app.workspace.rightSplit.collapse();
        } else if (this.shouldExpandRightSidebar(width)) {
            this.app.workspace.rightSplit.expand();
        }

        this.previousWidth = width;
    }

    shouldCollapsLeftSidebar(width: number) : boolean {
        return width < this.settings.leftMinWidth
              && width < this.previousWidth
              && !this.app.workspace.leftSplit.collapsed;
    }

    shouldExpandLeftSidebar(width: number) : boolean {
        return width > this.settings.leftMinWidth
              && width > this.previousWidth
              && this.app.workspace.leftSplit.collapsed
              && this.settings.showSidebarsBack
              && !this.isInCompactMode();
    }

    shouldCollapsRightSidebar(width: number) : boolean {
        return width < this.settings.rightMinWidth
              && width < this.previousWidth
              && !this.app.workspace.rightSplit.collapsed;
    }

    shouldExpandRightSidebar(width: number) : boolean {
        return width > this.settings.rightMinWidth
              && width > this.previousWidth
              && this.app.workspace.rightSplit.collapsed
              && this.settings.showSidebarsBack
              && !this.isInCompactMode();
    }

    isInCompactMode() : boolean {
        // @ts-ignore
        return this.app.plugins.getPlugin("zenmode")?.settings?.zenMode ?? false;
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData()) as HideSidebarsOnWindowResizeSettings;
    }

    async saveSettings() {
        await this.saveData(this.settings);
        this.toggleSidebars();
    }
}
