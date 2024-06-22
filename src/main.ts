import { Plugin } from 'obsidian';
import { HideSidebarsOnWindowResizeSettings, SettingsTab, DEFAULT_SETTINGS } from './settings';

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

            this.app.workspace.on('resize', () => { this.toggleSidebars() });
        });
    }

    toggleSidebars() {
        const width = window.innerWidth;

        if (width < this.settings.leftMinWidth &&
            width < this.previousWidth &&
            !this.app.workspace.leftSplit.collapsed) {
            this.app.workspace.leftSplit.collapse();
        }
        else if (width > this.settings.leftMinWidth &&
            width > this.previousWidth &&
            this.app.workspace.leftSplit.collapsed &&
            this.settings.showSidebarsBack) {
            this.app.workspace.leftSplit.expand();
        }

        if (width < this.settings.rightMinWidth &&
            width < this.previousWidth &&
            !this.app.workspace.rightSplit.collapsed) {
            this.app.workspace.rightSplit.collapse();
        }
        else if (width > this.settings.rightMinWidth &&
            width > this.previousWidth &&
            this.app.workspace.rightSplit.collapsed &&
            this.settings.showSidebarsBack) {
            this.app.workspace.rightSplit.expand();
        }

        this.previousWidth = width;
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData()) as HideSidebarsOnWindowResizeSettings;
    }

    async saveSettings() {
        await this.saveData(this.settings);
        this.toggleSidebars();
    }
}
