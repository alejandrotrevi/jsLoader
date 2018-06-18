chrome.runtime.onInstalled.addListener(function() {

  // Get the current tab
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {

    var tab = tabs[0];
    var tabId = tab.id;

    chrome.tabs.get(tabId, function (tab) {

      // Ignorar urls que inicien con chrome://
      var jsSettings = chrome.contentSettings.javascript;

      // Obtener permisos para la url actual
      jsSettings.get({"primaryUrl": tab.url}, function (details) {

        if (details.setting == "allow") {

          // Show in tab
          chrome.pageAction.setIcon({
            "tabId": tabId,
            "path": "/images/switch_on.png"
          });

          chrome.pageAction.show(tabId);
        } else if (details.setting == "block") {

          // Hide in tab
          chrome.pageAction.setIcon({
            "tabId": tabId,
            "path": "/images/switch_off.png"
          });

          chrome.pageAction.show(tabId);
        }

      });
    });
  });
});

/*
 * TODO:
 * - Opción para aplicar regla solo en dominio (sin subdominio)
 *
 */

chrome.pageAction.onClicked.addListener(function () {

  // Get the current tab
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {

    var tab = tabs[0];

    // Wait for the tab to load
    if (tab.status != "complete") return;

    // Solo permitir urls que inicien con http
    if (!tab.url.startsWith("http")) return;

    var jsSettings = chrome.contentSettings.javascript;

    // Obtener permisos para la url actual
    jsSettings.get({"primaryUrl": tab.url}, function (details) {

      if (details.setting == "allow") {

        // Disallow
        chrome.pageAction.setIcon({
          "tabId": tab.id,
          "path": "/images/switch_off.png"
        });

        // Create pattern
        var url = new URL(tab.url);
        var topLevel = url.hostname.match(/[^.]*\.[^.]{2,3}(?:\.[^.]{2,3})?$/mg)[0];

        // Set the port
        var port;

        if (!url.port) {
          if (url.protocol == "http:") port = 80;
          if (url.protocol == "https:") port = 443;
        } else {
          port = url.port;
        }

        // Pattern
        var pattern = url.protocol + "//*." + topLevel + ":" + port + "/*";

        // Set the permissions and reload.
        jsSettings.set({"primaryPattern": pattern, "setting": "block"}, function () {
            chrome.tabs.reload(tab.id);
        });

      } else if (details.setting == "block") {

        // Allow
        chrome.pageAction.setIcon({
          "tabId": tab.id,
          "path": "/images/switch_on.png"
        });

        // Create pattern
        var url = new URL(tab.url);
        var topLevel = url.hostname.match(/[^.]*\.[^.]{2,3}(?:\.[^.]{2,3})?$/mg)[0];

        // Set the port
        var port;

        if (!url.port) {
          if (url.protocol == "http:") port = 80;
          if (url.protocol == "https:") port = 443;
        } else {
          port = url.port;
        }

        // Pattern
        var pattern = url.protocol + "//*." + topLevel + ":" + port + "/*";

        // Set the permissions and reload.
        jsSettings.set({"primaryPattern": pattern, "setting": "allow"}, function () {
            chrome.tabs.reload(tab.id);
        });

      }

    });
  });
});

// Evento en tab actualizada
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {

  if (changeInfo.status != "loading") return;

  chrome.tabs.get(tabId, function (tab) {

    // Ignorar urls que inicien con chrome://
    var jsSettings = chrome.contentSettings.javascript;

    // Obtener permisos para la url actual
    jsSettings.get({"primaryUrl": tab.url}, function (details) {

      if (details.setting == "allow") {

        // Show in tab
        chrome.pageAction.setIcon({
          "tabId": tabId,
          "path": "/images/switch_on.png"
        });

        chrome.pageAction.show(tabId);
      } else if (details.setting == "block") {

        // Hide in tab
        chrome.pageAction.setIcon({
          "tabId": tabId,
          "path": "/images/switch_off.png"
        });

        chrome.pageAction.show(tabId);
      }

    });
  });
});
