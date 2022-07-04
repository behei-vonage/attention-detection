/* global OT API_KEY TOKEN SESSION_ID SAMPLE_SERVER_BASE_URL */

var apiKey;
var sessionId;
var token;
var session;
var streamId;
var subscribers = {};

function setAttentionUI(attnObj, streamElem) {
  streamElem.querySelectorAll('.attention').forEach((e) => e.remove());
  streamElem.style.border = `5px solid ${attnObj.color}`;
  streamElem.style.width = '99%';
  streamElem.style.height = '99%';
  const transcriptBox = streamElem.appendChild(document.createElement('div'));
  transcriptBox.classList.add('attention');
  const textElem = document.createElement('p');
  textElem.appendChild(document.createTextNode(attnObj.label));
  transcriptBox.appendChild(textElem).classList.add('attention-text');
}

function handleError(error) {
  if (error) {
    console.error(error);
  }
}

const getColor = (value) => {
  const hue = (value * 120).toString(10);
  return ['hsl(', hue, ',100%,50%)'].join('');
};

const attentionMap = (score) => {
  const percentage = score / 4;
  const color = getColor(percentage);
  score = Number(score).toFixed(3);
  if (score < 2.0) {
    return {
      label: `NO ATTENTION ${score}`,
      color,
    };
  }

  if (score < 2.5) {
    return {
      label: `BAD ATTENTION ${score}`,
      color,
    };
  }

  if (score < 3.5) {
    return {
      label: `GOOD ATTENTION ${score}`,
      color,
    };
  }

  if (score <= 4.0) {
    return {
      label: `PERFECT ATTENTION ${score}`,
      color,
    };
  }

  return {
    label: `NO ATTENTION ${score}`,
    color,
  };
};

const radiansToDegrees = (radians) => {
  const pi = Math.PI;
  return radians * (180 / pi);
};

const getScore = (degree) => {
  degree = Math.abs(radiansToDegrees(degree));
  if (degree < 10) {
    return 2;
  }
  if (degree < 30) {
    const adjust = (degree - 10) * 0.05;
    return 2.0 - adjust;
  }
  return 0;
};

const detect = async (net, webcamRef) => {
  if (
    typeof webcamRef !== 'undefined'
    && webcamRef !== null
    && webcamRef.readyState === 4
  ) {
    const video = webcamRef;
    const { videoWidth } = webcamRef;
    const { videoHeight } = webcamRef;
    webcamRef.width = videoWidth;
    webcamRef.height = videoHeight;

    const face = await net.estimateFaces({ input: video, predictIrises: true });

    const { mesh } = face[0];

    const radians = (a1, a2, b1, b2) => Math.atan2(b2 - a2, b1 - a1);
    const angle = {
      roll: radians(mesh[33][0], mesh[33][1], mesh[263][0], mesh[263][1]),
      yaw: radians(mesh[33][0], mesh[33][2], mesh[263][0], mesh[263][2]),
      pitch: radians(mesh[10][1], mesh[10][2], mesh[152][1], mesh[152][2]),
    };
    const score = getScore(angle.yaw) * getScore(angle.pitch);
    const signalScore = { attention: score, streamId };
    //otHelper.sendSignal('attentionScore', { attention: score, streamId });
    session.signal(
      {
        type: 'attentionScore',
        data: JSON.stringify(signalScore)
      },
      function(error) {
        if (error) {
          console.log("signal error ("
            + error.name
            + "): " + error.message);
        }
      }
    );
  }
};

const runFacemesh = async (webcamRef) => {
  const net = await faceLandmarksDetection
    .load(faceLandmarksDetection.SupportedPackages.mediapipeFacemesh, { maxFaces: 1 });

  setInterval(() => {
    detect(net, webcamRef);
  }, 3000);
};

function initializeSession() {
  session = OT.initSession(apiKey, sessionId);

  // Subscribe to a newly created stream
  session.on('streamCreated', function streamCreated(event) {
    var subscriberOptions = {
      insertMode: 'append',
      width: '100%',
      height: '100%'
    };
    var subscriber = session.subscribe(event.stream, 'subscriber', subscriberOptions, handleError);
    subscribers[subscriber.streamId] = subscriber;
  });

  session.on('sessionDisconnected', function sessionDisconnected(event) {
    console.log('You were disconnected from the session.', event.reason);
  });

  session.on("signal:attentionScore", function(event) {
    if (event.from.connectionId !== session.connection.id) {
      // Signal received from another client
      const signalData = JSON.parse(event.data);
      const subscriber = subscribers[signalData.streamId]
      if (subscriber) {
        setAttentionUI(attentionMap(signalData.attention), subscriber.element);
      }
    }
  });

  // initialize the publisher
  var publisherOptions = {
    insertMode: 'append',
    width: '100%',
    height: '100%'
  };
  var publisher = OT.initPublisher('publisher', publisherOptions, handleError);

  // Connect to the session
  session.connect(token, function callback(error) {
    if (error) {
      handleError(error);
    } else {
      // If the connection is successful, publish the publisher to the session
      session.publish(publisher, async (err) => {
        if (err) {
          console.log('Error', err);
        } else {
          const publisherElement = document.getElementById('publisher');
          streamId = publisher.stream.id;
          const webcam = publisherElement.querySelector('video');
          await runFacemesh(webcam);
        }
      });
    }
  });
}

// See the config.js file.
if (API_KEY && TOKEN && SESSION_ID) {
  apiKey = API_KEY;
  sessionId = SESSION_ID;
  token = TOKEN;
  initializeSession();
} else if (SAMPLE_SERVER_BASE_URL) {
  // Make an Ajax request to get the OpenTok API key, session ID, and token from the server
  fetch(SAMPLE_SERVER_BASE_URL + '/session').then(function fetch(res) {
    return res.json();
  }).then(function fetchJson(json) {
    apiKey = json.apiKey;
    sessionId = json.sessionId;
    token = json.token;

    initializeSession();
  }).catch(function catchErr(error) {
    handleError(error);
    alert('Failed to get opentok sessionId and token. Make sure you have updated the config.js file.');
  });
}
