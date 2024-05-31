const RECORDING_WAITING_TIME = 3000;
let lastRecordClickTime = 0;
let hasSimulatedClick = false;

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action === "startRecording") {
      let btnPractice = document.getElementById("btn-practice");
      let clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      btnPractice.dispatchEvent(clickEvent);
    }
  }
);

chrome.storage.local.get("IS_PLAY_SOUND_ON_POPUP", function (data) {
  let isPlaySoundOnPopup = data.IS_PLAY_SOUND_ON_POPUP !== false;
  window.onload = function () {
    let firstViewClass = isPlaySoundOnPopup
      ? ".elsa-card.elsa-card-1"
      : ".elsa-card.elsa-card-2";
    let card = document.querySelector(firstViewClass);
    if (card) {
      card.scrollIntoView();
      window.scrollBy(0, -80);
    }
    let observer = new MutationObserver(hideElements(isPlaySoundOnPopup));
    observer.observe(document, { childList: true, subtree: true });
  };
});

function hideElements(isPlaySoundOnPopup) {
  return function (mutationsList, observer) {
    for (let mutation of mutationsList) {
      if (mutation.type === "childList") {
        if (!hasSimulatedClick) {
          simulateFistButtonClick(isPlaySoundOnPopup);
        }
        let btnPractice = document.getElementById("btn-practice");
        if (btnPractice) {
          if (hasPassedWatingTime()) {
            btnPractice.click();
          }
        }
        chrome.storage.local.get("HIDE_DISTRACTING_INFO", function (data) {
          if (data.HIDE_DISTRACTING_INFO) {
            let elementsToHide = [
              document.querySelector("#header"),
              document.querySelector(".hero-section"),
              document.querySelector(".navig-bar"),
              document.querySelector(".pro-access-banner"),
              document.querySelector(".testimonials"),
              document.querySelector(".seen-as.text-center"),
              document.querySelector(".achievements"),
              document.querySelector(".elsa-modal"),
              document.querySelector(".floating-menu"),
              document.getElementById("body-section"),
              document.querySelector(".social-bar"),
            ];

            elementsToHide.forEach((element) => {
              if (element) {
                element.style.display = "none";
              }
            });
          }
        });
      }
    }
  };
}

//prevent multiple clicks
function hasPassedWatingTime() {
  let currentTime = new Date().getTime();
  if (currentTime - lastRecordClickTime >= RECORDING_WAITING_TIME) {
    lastRecordClickTime = currentTime;
    return true;
  }
  return false;
}

function simulateFistButtonClick(isPlaySoundOnPopup) {
  let firstButtonId = isPlaySoundOnPopup
    ? "btn-listen-to-the-word"
    : "btn-practice";
  let firstButtonView = document.getElementById(firstButtonId);
  if (firstButtonView) {
    if (hasPassedWatingTime() || isPlaySoundOnPopup) {
      let clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      firstButtonView.dispatchEvent(clickEvent);
      hasSimulatedClick = true;
    }
  }
}
