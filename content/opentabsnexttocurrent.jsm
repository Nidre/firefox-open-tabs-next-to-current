const { utils: Cu } = Components;
const COMMONJS_URI = "resource://gre/modules/commonjs";
const { require } = Cu.import(COMMONJS_URI + "/toolkit/require.js", {});

const MODULES_URI = "resource://gre/modules";
Components.utils.import(MODULES_URI + "/devtools/Console.jsm");
Components.utils.import(MODULES_URI + "/Services.jsm");

const { Hotkey } = require("sdk/hotkeys");
const prefs = require("sdk/simple-prefs");
const tabs = require("sdk/tabs");

var onClick = false;

EXPORTED_SYMBOLS = ["OpenTabsNextToCurrent"];

function OpenTabsNextToCurrent() {
  this.busy = false;
  onClick = false;

  prefs.on("", onPrefChange);

  function onPrefChange(prefName)
  {
    console.log("Settings Changed");
    // var keyCombo;
    // if(prefs['hotkeyCtrl'] && prefs['hotkeyShift'] && prefs['hotkeyAlt'])keyCombo = "control-shift-alt-t";
    // if(prefs['hotkeyCtrl'] && prefs['hotkeyShift'])keyCombo = "control-shift-t";
    // if(prefs['hotkeyCtrl']) keyCombo = "control-t";
    // console.log("New Hotkey: " + keyCombo);
    var newTabAtTheEnd = Hotkey({
      combo: "control-shift-t",
      onPress: function()
      {
        //  console.log("Hotkey");
         onClick = true;
         tabs.open("");
      }
    });
  }

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
      console.log("Test");
      onPrefChange();
    };
    this.destroy = function() {
      if (!this.domWindow ||
        !this.domWindow.gBrowser ||
        !this.domWindow.gBrowser.tabContainer) {
          return;
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
