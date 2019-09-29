const tmi = require('tmi.js');

const w = 190;
const h = 95;
const len = w * h;
const scale = 10;

const canvas = document.getElementById("drawnimage");
const ctx = canvas.getContext("2d");

ctx.canvas.width = w * scale;
ctx.canvas.height = h * scale;

ctx.fillStyle = "rgba(0,0,0,1)";
ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

// Define configuration options
const opts = {
    identity: {
        username: "ichbindernerd",
        password: "q8sst2d9zna7jozaqidp9k3hpb1v17"
    },
    channels: [
        "ichbindernerd"
    ]
};

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

let pixels = []

let index = 0;

for (let i = 0; i < len; i++) {
    pixels.push(0x00);
}

setPixel(0, [128, 0, 0])

// Called every time a message comes in
function onMessageHandler(target, context, msg, self) {
    if (self) return; // Ignore messages from the bot
    if (!/^((\!gs\s+([0-9a-f][0-9a-f]\s*)+)|(\!rgb\s+(([0-9a-f][0-9a-f]\s*){3})+))$/i.test(msg.trim())) return;

    msg = msg.trim();
    if (msg.charAt(1) === 'g') {
        msg = msg.substring("!gs".length);
        while (0 < msg.length) {
            if (/\s/.test(msg.charAt(0)))
                msg = msg.substring(1);
            else {
                //needs to be hex digit
                let hex = msg.charAt(0) + msg.charAt(1);
                let byte = parseInt(hex, 16);
                setPixel(index, [byte, byte, byte]);
                index++;
                index = index % len;
                msg = msg.substring(2);
            }
        }
    }else {
        //rgb mode
        msg = msg.substring("!rgb".length);
        let red = undefined;
        let blue = undefined;
        let green = undefined;

        while (0 < msg.length) {
            if (/\s/.test(msg.charAt(0)))
                msg = msg.substring(1);
            else {
                //needs to be hex digit
                let hex = msg.charAt(0) + msg.charAt(1);
                let byte = parseInt(hex, 16);
                if (red === undefined) 
                    red = byte;
                else if (blue === undefined)
                    blue = byte;
                else
                    green = byte;
                msg = msg.substring(2);

                if (red !== undefined && blue !== undefined && green !== undefined) {
                    setPixel(index++, [red, green, blue]);
                    index = index % len;
                    red = undefined;
                    blue = undefined;
                    green = undefined;
                }
            }
        }
    }
}

function setPixel(i, color) {
    const x = Math.floor(i / h);
    const y = i % h;

    ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},1)`;
    ctx.fillRect(x * scale, y * scale, scale, scale);
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
}