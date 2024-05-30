"use strict";
chrome.runtime.onInstalled.addListener(function (object) {
    let externalUrl = "https://gitea.thanh0x.com/huythanh0x";
    if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        chrome.tabs.create({ url: externalUrl }, function (tab) {            
        });
    }
});

// Below logic soly for playing sound when the options are enabled
// Because of the fact that view.click() doesn't play sound, we have to use the Audio object to amanually play the audio
let lastPlaySoundTime = 0;
const PLAYSOUND_WAITING_TIME = 3000;
let hasPlayMainAudio = false;

chrome.storage.local.get("IS_PLAY_SOUND_ON_POPUP", function (data) {
  let isPlaySoundOnPopup = data.IS_PLAY_SOUND_ON_POPUP !== false;
  chrome.webRequest.onBeforeRequest.addListener(
    function (details) {
      if (
        isPlaySoundOnPopup &&
        details.url.endsWith(".mp3") &&
        !details.url.endsWith("mic_start_sound.mp3") &&
        !details.url.endsWith("mic_stop_sound.mp3") &&
        hasPassedWatingTime()
      ) {
        let audio = new Audio(details.url);
        audio.play();
        hasPlayMainAudio = true;
      }
    },
    { urls: ["<all_urls>"] }
  );
});

chrome.contextMenus.create({
  id: "open-elsa-speak",
  title: "Show in elsa speak",
  contexts: ["selection"],
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  const query = info.selectionText.toLowerCase().replace(/ /g, "-");

  chrome.tabs.create(
    {
      url: `https://elsaspeak.com/en/learn-english/how-to-pronounce/${query}`,
      active: false,
    },
    function (tab) {
      chrome.windows.create({
        tabId: tab.id,
        type: "popup",
        focused: true,
      });
    }
  );
});

//avoid mutliple sound playing at the same time
function hasPassedWatingTime() {
  let currentTime = new Date().getTime();
  if (currentTime - lastPlaySoundTime >= PLAYSOUND_WAITING_TIME) {
    lastPlaySoundTime = currentTime;
    return true;
  }
  return false;
}
