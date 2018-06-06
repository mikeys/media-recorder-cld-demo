'use strict'

const config = {
  cloud_name: "my-example-cloud",
  upload_preset: "my-media-recorder-preset",
}

let log = console.log.bind(console);
let id = val => document.getElementById(val);
let ul = id('ul');
let initBtn = id('init');
let startBtn = id('start');
let stopBtn = id('stop');
let stream;
let recorder;
let counter = 1;
let chunks;
let media;

initBtn.addEventListener("click", () => {
  let mv = id('mediaVideo');
  let mediaOptions = {
    video: {
      tag: 'video',
      type: 'video/webm',
      ext: '.mp4',
      gumParams: { video: true, audio: true }
    },
    audio: {
      tag: 'audio',
      type: 'audio/mp3',
      ext: '.mp3',
      gumParams: { audio: true, video: false }
    }
  }

  media = mv.checked ? mediaOptions.video : mediaOptions.audio;

  navigator.mediaDevices.getUserMedia(media.gumParams).then(_stream => {
    stream = _stream;
    id('gUMArea').style.display = 'none';
    id('btns').style.display = 'inherit';
    startBtn.removeAttribute('disabled');

    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = e => {
      chunks.push(e.data);
      if (recorder.state == 'inactive') {
        makeLink();
        uploadToCloudinary();
      }
    };
    log('got media successfully');
  }).catch(log);
})

startBtn.addEventListener("click", () => {
  startBtn.disabled = true;
  stopBtn.removeAttribute('disabled');
  chunks = [];
  recorder.start();
})

stopBtn.addEventListener("click", () => {
  stopBtn.disabled = true;
  recorder.stop();
  startBtn.removeAttribute('disabled');
})

const uploadToCloudinary = () => {
  let blob = new Blob(chunks, { type: media.type });

  let formdata = new FormData();

  formdata.append('resource_type', 'video');
  formdata.append('upload_preset', config.upload_preset);
  formdata.append('file', blob);

  let xhr = new XMLHttpRequest();
  xhr.open('POST', `http://api.cloudinary.com/v1_1/${config.cloud_name}/video/upload`, true);

  xhr.onload = function () {
    // do something to response
    console.log(this.responseText);
  };

  xhr.send(formdata);
}

const makeLink = () => {
  let blob = new Blob(chunks, { type: media.type });
  let url = URL.createObjectURL(blob);
  let li = document.createElement('li');
  let mediaTag = document.createElement(media.tag);
  let link = document.createElement('a');

  mediaTag.controls = true;
  mediaTag.src = url;
  link.href = url;
  link.download = `${counter++}${media.ext}`;
  link.innerHTML = `download ${link.download}`;
  li.appendChild(mediaTag);
  li.appendChild(link);
  ul.appendChild(li);
}
