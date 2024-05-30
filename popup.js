document.addEventListener("DOMContentLoaded", function () {
  let playSoundOption = document.getElementById("playSound");
  let startRecordingOption = document.getElementById("startRecording");
  let hideDistractingInfoCheckBox = document.getElementById("hideDistractingInfo");

  chrome.storage.local.get("IS_PLAY_SOUND_ON_POPUP", function (data) {
    if (data.IS_PLAY_SOUND_ON_POPUP === undefined) {
        chrome.storage.local.set({ IS_PLAY_SOUND_ON_POPUP: true}); 
        data.IS_PLAY_SOUND_ON_POPUP = true;
    }
    if (data.IS_PLAY_SOUND_ON_POPUP === false) {
      startRecordingOption.checked = true;
    } else {
      playSoundOption.checked = true;
    }
    playSoundOption.addEventListener("change", function () {
      chrome.storage.local.set({ IS_PLAY_SOUND_ON_POPUP: this.checked });
    });
    startRecordingOption.addEventListener("change", function () {
      chrome.storage.local.set({ IS_PLAY_SOUND_ON_POPUP: !this.checked });
    });
  });
  chrome.storage.local.get("HIDE_DISTRACTING_INFO", function (data) {
    if (data.HIDE_DISTRACTING_INFO === undefined) {
        chrome.storage.local.set({ HIDE_DISTRACTING_INFO: false}); 
        data.HIDE_DISTRACTING_INFO = false;
    }
    hideDistractingInfoCheckBox.checked = data.HIDE_DISTRACTING_INFO === true;
    hideDistractingInfoCheckBox.addEventListener("change", function () {
      chrome.storage.local.set({ HIDE_DISTRACTING_INFO: this.checked });
    });
  });
});
