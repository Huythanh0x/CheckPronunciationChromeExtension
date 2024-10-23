"use strict";
chrome.runtime.onInstalled.addListener(function (object) {
  let externalUrl = "https://github.com/Huythanh0x/CheckPronunciationChromeExtension";
  if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.create({ url: externalUrl }, function (tab) {});
  }
});

// Below logic for playing sound when the options are enabled
// Because of the fact that view.click() doesn't play sound when the web is newly opened for the first time, we have to use the Audio object to amanually play the audio
let lastPlaySoundTime = 0;
const PLAYSOUND_WAITING_TIME = 2000;
let onNeedManualPlaySound = false;
chrome.storage.local.get("IS_PLAY_SOUND_ON_POPUP", function (data) {
  let isPlaySoundOnPopup = data.IS_PLAY_SOUND_ON_POPUP !== false;
  chrome.webRequest.onBeforeRequest.addListener(
    function (details) {
      if (
        details.url.includes("https://tts.elsanow.co/") &&
        details.url.endsWith(".mp3") &&
        !details.url.endsWith("mic_start_sound.mp3") &&
        !details.url.endsWith("mic_stop_sound.mp3")
      ) {
        if (
          onNeedManualPlaySound &&
          isPlaySoundOnPopup &&
          hasPassedWatingTime()
        ) {
          let audio = new Audio(details.url);
          audio.play();
          onNeedManualPlaySound = false;
          audio.onended = function () {
            startRecording();
          };
        } else if (isPlaySoundOnPopup && hasPassedWatingTime()) {
          setTimeout(() => {
            startRecording();
          }, PLAYSOUND_WAITING_TIME);
        }
      }
    },
    { urls: ["<all_urls>"] }
  );
});

chrome.contextMenus.create({
  id: "open-elsa-speak",
  title: "Show in elsa speak [Ctrl+Shift+Z]",
  contexts: ["selection"],
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  const query = info.selectionText.toLowerCase().replace(/ /g, "-");
  openElsaSpeak(query);
});

//add shortcut listener to open elsa
chrome.commands.onCommand.addListener(function (command) {
  if (command === "open_elsa_speak") {
    // Your code here
    chrome.tabs.executeScript(
      {
        code: `window.getSelection().toString();`,
      },
      function (results) {
        if (chrome.runtime.lastError || !results || !results.length) {
          // An error occurred or no text was selected
          return;
        }
        const query = results[0].toLowerCase().replace(/ /g, "-");
        openElsaSpeak(query);
      }
    );
  }
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

function openElsaSpeak(query) {
  onNeedManualPlaySound = true;
  chrome.windows.create({
    url: `https://elsaspeak.com/en/learn-english/how-to-pronounce/${query}`,
    focused: true,
    type: "normal",
  });
}

function startRecording() {
  chrome.storage.local.get("START_RECORDING_AFTER_AUDIO", function (data) {
    if (data.START_RECORDING_AFTER_AUDIO === true) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        //delay one second to make sure the audio is played
        chrome.tabs.sendMessage(tabs[0].id, { action: "startRecording" });
      });
    }
  });
}
