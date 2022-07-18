import { App, debounce, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface HideSidebarsOnWindowResizeSettings {
  leftMinWidth: number;
  rightMinWidth: number;
}

const DEFAULT_SETTINGS: HideSidebarsOnWindowResizeSettings = {
  leftMinWidth: 1400,
  rightMinWidth: 1100,
};

export default class HideSidebarsOnWindowResizePlugin extends Plugin {
  settings: HideSidebarsOnWindowResizeSettings;
  previousWidth: number;

  async onload() {
    console.log('loading HideSidebarsOnWindowResizePlugin');

    await this.loadSettings();
    this.addSettingTab(new SettingsTab(this.app, this));

    const debouncedToggle = debounce(this.toggleSidebars.bind(this), 80);
    this.app.workspace.onLayoutReady(() => {
      this.previousWidth = window.innerWidth;
      this.toggleSidebars();
      this.registerDomEvent(window, 'resize', (_) => {
        debouncedToggle();
      });
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
      this.app.workspace.leftSplit.collapsed) {
      this.app.workspace.leftSplit.expand();
    }

    if (width < this.settings.rightMinWidth &&
      width < this.previousWidth &&
      !this.app.workspace.rightSplit.collapsed) {
      this.app.workspace.rightSplit.collapse();
    }
    else if (width > this.settings.rightMinWidth &&
      width > this.previousWidth &&
      this.app.workspace.rightSplit.collapsed) {
      this.app.workspace.rightSplit.expand();
    }

    this.previousWidth = width;
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.toggleSidebars();
  }
}

class SettingsTab extends PluginSettingTab {
  plugin: HideSidebarsOnWindowResizePlugin;

  constructor(app: App, plugin: HideSidebarsOnWindowResizePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    let { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h3', { text: 'Hide Sidebars on Resize' });

    new Setting(containerEl)
      .setName('Hide the left sidebar when the window is this narrow')
      .setDesc(
        'Increase this to hide the left sidebar sooner; decrease it to delay hiding'
      )
      .addText((text) =>
        text
          .setPlaceholder(`Default: ${DEFAULT_SETTINGS.leftMinWidth}`)
          .setValue(this.plugin.settings.leftMinWidth.toString())
          .onChange(async (value) => {
            const num = parseInt(value);
            if (num) {
              this.plugin.settings.leftMinWidth = num;
            } else {
              this.plugin.settings.leftMinWidth = DEFAULT_SETTINGS.leftMinWidth;
            }
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Hide the right sidebar when the window is this narrow')
      .setDesc(
        'Increase this to hide the right sidebar sooner; decrease it to delay hiding'
      )
      .addText((text) =>
        text
          .setPlaceholder(`Default: ${DEFAULT_SETTINGS.rightMinWidth}`)
          .setValue(this.plugin.settings.rightMinWidth.toString())
          .onChange(async (value) => {
            const num = parseInt(value);
            if (num) {
              this.plugin.settings.rightMinWidth = num;
            } else {
              this.plugin.settings.rightMinWidth =
                DEFAULT_SETTINGS.rightMinWidth;
            }
            await this.plugin.saveSettings();
          })
      );
  }
}
