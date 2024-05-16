class ChatClient {
    constructor() {
        this.chat = null;
        this.hostInput = $('#host');
        this.messageInput = $('#message');
        this.connectBtn = $('#connectBtn');
        this.sendBtn = $('#sendBtn');

        this.connectBtn.click(this.connect.bind(this));
        this.sendBtn.click(this.sendMessage.bind(this));
    }

    connect() {
        var host = this.hostInput.val();
        if (!host) {
            alert('Please input connection host:port');
            return;
        }

        this.chat = new WebSocket('ws://' + host);

        this.chat.onopen = this.handleOpen.bind(this);
        this.chat.onerror = this.handleError.bind(this);
        this.chat.onmessage = this.handleMessage.bind(this);
    }

    handleOpen(e) {
        console.log("Connection established!");
        $(".loader").hide();
        this.connectBtn.prop('disabled', true);
    }

    handleError(error) {
        console.error('WebSocket Error: ', error);
    }

    handleMessage(e) {
        var message = e.data;
        this.createChatMessage(message, 0);
        this.saveMessage(message, 0);
    }

    sendMessage() {
        var message = this.messageInput.val();
        this.createChatMessage(message, 1);

        if (!message) {
            alert('Please enter a message');
            return;
        }

        if (this.chat.readyState === WebSocket.OPEN) {
            this.chat.send(message);
            this.saveMessage(message, 1);
            this.messageInput.val('');
        } else {
            alert('WebSocket connection not established.');
        }
    }

    createChatMessage(message, sender = null) {
        var alignmentClass = (sender == 1) ? 'media media-chat' : 'media media-chat media-chat-reverse';
        var timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        var messageBlock = $('<div>').addClass(alignmentClass);
        var messageBody = $('<div>').addClass('media-body');
        var messageContent = $('<p>').text(message);
        var metaElement = $('<p>').addClass('meta').html('<time datetime="' + new Date().toISOString() + '">' + timestamp + '</time>');

        messageBody.append(messageContent).append(metaElement);
        messageBlock.append(messageBody);

        $('#chat-content').append(messageBlock);
    }

    saveMessage(message, sender) {
        if (typeof localStorage !== 'undefined') {
            var storedMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];

            storedMessages.push({ message: message, sender: sender });

            localStorage.setItem('chatMessages', JSON.stringify(storedMessages));
        } else {
            console.error('localStorage is not available.');
        }
    }

    retrieveChat() {
        var messages = this.getStoredMessages();

        messages.forEach(function(msgObj) {
            this.createChatMessage(msgObj.message, msgObj.sender);
        }.bind(this));
    }

    getStoredMessages() {
        if (typeof localStorage !== 'undefined') {
            var storedMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];
            return storedMessages;
        } else {
            console.error('localStorage is not available.');
            return [];
        }
    }
}

$(document).ready(function () {
    var chatClient = new ChatClient();
    chatClient.retrieveChat();
});
