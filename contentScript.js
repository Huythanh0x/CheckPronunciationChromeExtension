const SOUND_PLAYING_WAITING_TIME = 3000;
let hasSimulatedClick = false;

window.onload = function () {
  //assure that this script only run on elsa speak website
  if (!window.location.href.includes("https://elsaspeak.com/")) {
    return;
  }
  
  convertWordToElsaLink();
  chrome.storage.local.get("IS_PLAY_SOUND_ON_POPUP", function (data) {
    let isPlaySoundOnPopup = data.IS_PLAY_SOUND_ON_POPUP !== false;
    let recordingCard = document.querySelector(".elsa-card.elsa-card-2");
    if (recordingCard) {
      recordingCard.scrollIntoView();
    }
  
    if (isPlaySoundOnPopup) {
      playVocabularySound(() => {
        chrome.storage.local.get("START_RECORDING_AFTER_AUDIO", function (data) {
          if (data.START_RECORDING_AFTER_AUDIO === true) {
            startRecording();
          }
        });
      });
    } else if (!isPlaySoundOnPopup) {
      startRecording();
    }
    let observer = new MutationObserver(elementObserver(isPlaySoundOnPopup));
    observer.observe(document, { childList: true, subtree: true });
  });
};

function elementObserver(isPlaySoundOnPopup) {
  return function (mutationsList, observer) {
    for (let mutation of mutationsList) {
      if (mutation.type === "childList") {
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

//convert all words in vocabulary card to elsa speak link
function convertWordToElsaLink() {
  const definitionElements = document.querySelectorAll('.elsa-card__definition-text');
  const exampleElements = document.querySelectorAll('ul.elsa-card__example-text li');

  function convertTextToLink(element) {
      const words = element.textContent.split(' ');
      element.textContent = ''; // Clear the original text
      words.forEach((word, index) => {
          // Remove non-word characters from the word
          const cleanedWord = word.replace(/\W/g, '');
          if (cleanedWord) {
              const link = document.createElement('a');
              link.href = `https://elsaspeak.com/en/learn-english/how-to-pronounce/${encodeURIComponent(cleanedWord)}`;
              link.textContent = word;
              link.style.color = 'inherit';
              element.appendChild(link);
              // Add a space after each word, except the last one
              if (index < words.length - 1) {
                  element.appendChild(document.createTextNode(' '));
              }
          }
      });
  }

  definitionElements.forEach(convertTextToLink);
  exampleElements.forEach(convertTextToLink);
}

function startRecording() {
  let btnPractice = document.getElementById("btn-practice");
      let clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      btnPractice.dispatchEvent(clickEvent);
}

function playVocabularySound(callback) {
  const urlFragments = window.location.href.split("/");
  const sentence = urlFragments.pop();
  const requestBody = {
    sentence: sentence,
    user_lang: "vi"
  };
  chrome.runtime.sendMessage(
    {
      action: "playVocabularySound",
      requestBody: requestBody
    },
    (response) => {}
  );
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "audioComplete") {
    // alert("Audio playback completed");
    chrome.storage.local.get("START_RECORDING_AFTER_AUDIO", function (data) {
      if (data.START_RECORDING_AFTER_AUDIO === true) {
        startRecording();
      }
    });
  }
});