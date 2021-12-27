const socket = io();

const messageInput = document.querySelector('#message-input');
const sendMessageBtn = document.querySelector('#send-message-btn');
const sendLocationBtn = document.querySelector('#send-location-btn');
const messagesList = document.querySelector('#messages');
const sidebar = document.querySelector('#sidebar');

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  //New message element
  const newMessage = messagesList.lastElementChild;

  //Height of the new message
  const newMessageStyles = getComputedStyle(newMessage);
  const newMeesageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = newMessage.offsetHeight + newMeesageMargin;
  console.log(newMessageStyles);

  const visibleHeight = messagesList.offsetHeight;

  //Height of messages container
  const containerHeight = messagesList.scrollHeight;

  //How far i have scrolled
  const scrollOffset = messagesList.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    messagesList.scrollTop = messagesList.scrollHeight;
  }
};

socket.on('message', ({ text, createdAt, username }) => {
  console.log(text);
  const html = Mustache.render(messageTemplate, {
    username,
    message: text,
    createdAt: moment(createdAt).format('h:m a'),
  });
  messagesList.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

socket.on('locationMessage', ({ username, url, createdAt }) => {
  const html = Mustache.render(locationTemplate, {
    username,
    locationUrl: url,
    createdAt: moment(createdAt).format('h:mm a'),
  });
  messagesList.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  sidebar.innerHTML = html;
});

const submitForm = (e) => {
  e.preventDefault();
  sendMessageBtn.setAttribute('disabled', true);

  socket.emit('messageSent', messageInput.value, (error) => {
    sendMessageBtn.removeAttribute('disabled');
    messageInput.value = '';
    messageInput.focus();
    if (error) {
      return console.log(error);
    }
    console.log('Message was delivered');
  });
};

const sendLocation = () => {
  if (!navigator.geolocation) {
    return alert('Location is not supported by your browser');
  }
  sendLocationBtn.setAttribute('disabled', true);
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      'sendLocation',
      {
        lat: position.coords.latitude,
        long: position.coords.longitude,
      },
      () => {
        sendLocationBtn.removeAttribute('disabled');
        console.log('Location Sent');
      }
    );
  });
};

socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});
