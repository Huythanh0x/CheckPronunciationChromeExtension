const MIN_PLAY_INTERVAL = 2000; // Minimum interval between audio plays in milliseconds

chrome.runtime.onInstalled.addListener(function (object) {
  let externalUrl = "https://github.com/Huythanh0x/CheckPronunciationChromeExtension";
  if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.create({ url: externalUrl }, function (tab) {});
  }
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.log('Received message:', message);
  if (message.action === "playVocabularySound") {
    const { requestBody } = message;
    console.log('Received message `playVocabularySound`:', requestBody);
    fetch('https://pool.elsanow.io/api/compute_dictionary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
    .then(response => response.json())
    .then(data => {
      const ttsUrl = data.tts_url;
      console.log('Fetched TTS URL:', ttsUrl);
      playSound(ttsUrl).then(() => {
        sendResponse({ success: true }); 
      }).catch(error => {
        console.error('Error playing sound:', error);
        sendResponse({ success: false });
      });
    })
    .catch(error => {
      console.error('Error fetching TTS URL:', error);
      sendResponse({ success: false });
    });
    return false;
  } else if (message.action === "audioComplete") {
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs.length > 0) {
          chrome.tabs.sendMessage(tabs[0].id, { action: "audioComplete" });
        }
      });
    }
});


chrome.contextMenus.create({
  id: "open-elsa-speak",
  title: "Show in elsa speak",
  contexts: ["selection"],
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  const query = info.selectionText.toLowerCase().replace(/ /g, "-");
  openElsaSpeak(query);
});

//add shortcut listener to open elsa
chrome.commands.onCommand.addListener(function (command) {
  if (command === "open_elsa_speak") {
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

function openElsaSpeak(query) {
  chrome.windows.create({
    url: `https://elsaspeak.com/en/learn-english/how-to-pronounce/${query}`,
    focused: true,
    type: "normal",
  });
}


async function playSound(source) {
  await createOffscreen();
  try {
    const currentTime = Date.now();
    const lastPlayTime = await getLastPlayTime();
    //need logic check interval to prevent playsound too fast and duplication
    if (currentTime - lastPlayTime >= MIN_PLAY_INTERVAL) {
      await chrome.runtime.sendMessage({ play: { source, volume: 1 } });
      await setLastPlayTime(currentTime);
    } else {
      console.log('Skipping play to avoid overlap');
    }
  } catch (error) {
    console.error('Error sending message to offscreen document:', error);
  }
}

//manifest v3 drop `Audio` so this is the workaround to play sound
async function createOffscreen() {
  if (await chrome.offscreen.hasDocument()) return;
  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['AUDIO_PLAYBACK'],
    justification: 'Play audio for pronunciation'
  });
}

// Get the last play time from Chrome storage
async function getLastPlayTime() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['lastPlayTime'], (result) => {
      resolve(result.lastPlayTime || 0);
    });
  });
}

// Set the last play time in Chrome storage
async function setLastPlayTime(time) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ lastPlayTime: time }, () => {
      resolve();
    });
  });
}