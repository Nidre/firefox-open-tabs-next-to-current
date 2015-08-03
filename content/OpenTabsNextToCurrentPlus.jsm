EXPORTED_SYMBOLS = ["OpenTabsNextToCurrentPlus"];

const { utils: Cu } = Components;
const COMMONJS_URI = "resource://gre/modules/commonjs";
const MODULES_URI = "resource://gre/modules";

const { require } = Cu.import(COMMONJS_URI + "/toolkit/require.js", {});
Cu.import(MODULES_URI + "/devtools/Console.jsm");
Cu.import(MODULES_URI + "/Services.jsm");
const { Hotkey } = require("sdk/hotkeys");
const tabs = require("sdk/tabs");
var newTabAtTheEndHotkey;

var prefsListener;

var onClick = false;

function onPrefsChanged(branch, name) {
  if(branch.getPrefType("hotkey-modifier") && branch.getPrefType("hotkey"))
  {
    var hotkeyString = branch.getCharPref("hotkey").substring(0,1);
    branch.setCharPref("hotkey",hotkeyString);
    var keyCombo = branch.getCharPref("hotkey-modifier") + hotkeyString;
    if(typeof newTabAtTheEndHotkey !== 'undefined')
    {
        newTabAtTheEndHotkey.destroy();
    }
    newTabAtTheEndHotkey = Hotkey({
      combo: keyCombo,
      onPress: function()
      {
        onClick = true;
        tabs.open("about:newtab");
      }
    });
  }
}

function OpenTabsNextToCurrentPlus() {
  this.busy = false;
  onClick = false;

  this.initialize = function(domWindow) {
    if (!domWindow ||
      !domWindow.gBrowser ||
      !domWindow.gBrowser.tabContainer) {
        return;
      }
      this.domWindow = domWindow;
      this.gBrowser = domWindow.gBrowser;
      this.tabContainer = domWindow.gBrowser.tabContainer;

      this.domWindow.addEventListener("SSWindowStateBusy", this.onBusy);
      this.domWindow.addEventListener("SSWindowStateReady", this.onReady);
      this.tabContainer.addEventListener("TabOpen", this.onTabOpen);
      this.domWindow.addEventListener("click",this.onElementClick,false);
      Components.utils.import("chrome://opentabsnexttocurrentplus/content/PrefListener.jsm");
      prefsListener = new PrefListener("extensions.opentabsnexttocurrentplus.",onPrefsChanged);
      prefsListener.register(true);
    };
    this.destroy = function() {
      if (!this.domWindow ||
        !this.domWindow.gBrowser ||
        !this.domWindow.gBrowser.tabContainer) {
          return;
        }
        if(typeof newTabAtTheEndHotkey !== 'undefined')
        {
            newTabAtTheEndHotkey.destroy();
        }
        this.domWindow.removeEventListener("SSWindowStateBusy", this.onBusy);
        this.domWindow.removeEventListener("SSWindowStateReady", this.onReady);
        this.tabContainer.removeEventListener("TabOpen", this.onTabOpen);
        this.domWindow.removeEventListener("click", this.onElementClick);
      };

      this.onBusy = function(anEvent) {
        this.busy = true;
      }.bind(this);
      this.onReady = function(anEvent) {
        this.busy = false;
      }.bind(this);

      this.onElementClick = function(e)
      {
        if(e.target.id == "new-tab-button" || e.target.id == "tabbrowser-tabs")
        {
          // console.log("Click");
          onClick = true;
        }
        else
        {
          // console.log("Click false: " + e.target.id);
          onClick = false;
        }

      }.bind(this);

      this.onTabOpen = function(anEvent) {
        // console.log("onClick: "  + onClick);
        // console.log("this.busy: "  + this.busy);
        if (!this.busy && !onClick) {
          // console.log("Sibling");
          onClick = false;
          var openingTab = anEvent.target;
          var currentTab = this.gBrowser.mCurrentTab;
          this.gBrowser.moveTabTo(openingTab, currentTab.nextSibling._tPos);
        }

      }.bind(this);
    }
