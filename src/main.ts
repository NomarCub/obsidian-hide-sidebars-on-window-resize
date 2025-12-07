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

        if (width < this.settings.leftMinWidth
              && width < this.previousWidth
              && !this.app.workspace.leftSplit.collapsed) {
            this.app.workspace.leftSplit.collapse();
        } else if (width > this.settings.leftMinWidth
              && width > this.previousWidth
              && this.app.workspace.leftSplit.collapsed
              && this.settings.showSidebarsBack
              && !this.isInCompactMode()) {
            this.app.workspace.leftSplit.expand();
        }

        if (width < this.settings.rightMinWidth
              && width < this.previousWidth
              && !this.app.workspace.rightSplit.collapsed) {
            this.app.workspace.rightSplit.collapse();
        } else if (width > this.settings.rightMinWidth
              && width > this.previousWidth
              && this.app.workspace.rightSplit.collapsed
              && this.settings.showSidebarsBack
              && !this.isInCompactMode()) {
            this.app.workspace.rightSplit.expand();
        }

        this.previousWidth = width;
    }

    /**
     * Check if the plugin "zenmode" is installed and get its settings (https://github.com/paperbenni/obsidian-zenmode/blob/main/main.ts#L433-L445).
     * Then we check if then zen mode is on. The zen mode hides all elements like the sidebar and top bar.
     * It looks very strange when we extend them while zen mode is enabled.
     *
     * The api for this is purely internal and that is why it is not in the obsidian package but the method is there, just not in the dev envoirment.
     */
    isInCompactMode(): boolean {
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
