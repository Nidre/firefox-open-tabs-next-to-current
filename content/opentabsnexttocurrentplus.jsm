Components.utils.import("resource://gre/modules/devtools/Console.jsm");
Components.utils.import("resource://gre/modules/Services.jsm");

EXPORTED_SYMBOLS = ["OpenTabsNextToCurrentPlus"];

function OpenTabsNextToCurrent() {
    this.busy = false;
	this.onClick = false;

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
		if(e.target.id == "new-tab-button")	
		{
			this.onClick = true;
		}
		else
		{
			this.onClick = false;
		}

	}.bind(this);
	
    this.onTabOpen = function(anEvent) {
        if (!this.busy && !this.onClick) {
			this.onClick = false;
            var openingTab = anEvent.target;
            var currentTab = this.gBrowser.mCurrentTab;
            this.gBrowser.moveTabTo(openingTab, currentTab.nextSibling._tPos);
        }

    }.bind(this);
}

