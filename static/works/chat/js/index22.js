


wt.DOMReady(function(){

});

var socket = new WebSocket('ws://172.16.66.14:5000');

socket.onopen = function(){
    console.log('open');
    socket.send('wwww');
    console.log(arguments);
};

socket.onmessage = function(){
    console.log('message');
    console.log(arguments);
}

socket.onclose = function(){
    console.log('close');
    console.log(arguments);
}
