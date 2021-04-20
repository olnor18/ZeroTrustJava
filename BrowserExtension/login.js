import { initialize } from './httpzt.js';

const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)
const targetUrl = urlParams.get('url').substring(13)

console.log('Connecting to ' + targetUrl)
document.getElementsByTagName('body')[0].innerHTML ='<p>Connecting to ' + DOMPurify.sanitize(targetUrl, {USE_PROFILES: {html: false}} ) + '<p>'


const socket = new WebSocket('ws://'+targetUrl);

// Connection opened
socket.onopen = async function (event) {
    initialize(socket);
};


// Listen for messages
/*
socket.onmessage = function (event) {
    decode(event)
    console.log('Message from server ', event.data);
};*/