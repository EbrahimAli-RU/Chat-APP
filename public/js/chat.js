const socket = io();

// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $message = document.querySelector('#message');

//Template
const messageTemplate = document.querySelector('#message-templete').innerHTML
const locationTemplate = document.querySelector('#location-templete').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-templete').innerHTML;
// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
    const $newMessage = $message.lastElementChild

    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    console.log(newMessageMargin);
    const visibleHeight = $message.offsetHeight
    const containerHeight = $message.scrollHeight
    const scrollOffset = $message.scrollTop + visibleHeight

    $message.scrollTop = $message.scrollHeight
    // if(containerHeight - newMessageHeight <= scrollOffset) {
    //     $message.scrollTop = $message.scrollHeight
    // }
} 

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $message.insertAdjacentHTML('beforeend', html);

    autoScroll();

})

socket.on('locationMessage', url => {
    const html = Mustache.render(locationTemplate, {
        username: url.username,
        url: url.location,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $message.insertAdjacentHTML('beforeend', html);
    
    autoScroll()
})
socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html;
})

$messageForm.addEventListener('submit', e => {
    // Prevent the default behavior of submit button
    e.preventDefault();
    // Disable the input field
    $messageFormButton.setAttribute('disabled', 'disabled') 
    // grab the value of input filed
    const message = e.target.elements.message.value;

    socket.emit('sendmessage', message, (message) => {
        //Disable input form while sending message
        $messageFormButton.removeAttribute('disabled');
        // Clearing input filed after message is delivered
        $messageFormInput.value = ''
        // Refocus input field
        $messageFormInput.focus();
        //Acknowledgement from server
        console.log(message);
    });

})

$sendLocationButton.addEventListener('click', () => {

    if(!navigator.geolocation) {
        return alert(`Your browser doesn't support geolocation`);
    }
    $sendLocationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendlocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled');
            console.log(`Location shared`);
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if(error) {
        alert(error);
        location.href = '/'
    }
});