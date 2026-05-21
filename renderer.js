const tmImage = require("@teachablemachine/image");
const URL = "./model/";

let model;
let stream;
let alarm;
let checking = true;

async function init() {
    try {
        console.log("Starting app...");
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";
        model = await tmImage.load(modelURL, metadataURL);
        console.log("Model loaded");
        const video = document.getElementById("webcam");
        stream = await navigator.mediaDevices.getUserMedia({
            video: true
        });
        video.srcObject = stream;
        console.log("Camera started");
        alarm = new Audio("alarm.mp3");
        alarm.loop = true;
        document.getElementById("status").innerText =
            "Checking for Specs...";
        setInterval(() => {
            if (checking) {
                predict(video);
            }
        }, 1000);
    } catch (error) {
        console.error(error);
        document.getElementById("status").innerText =
            "Error Loading App";
    }
}
async function predict(video) {
    try {
        const prediction = await model.predict(video);
        let wearingSpecs = false;
        for (let i = 0; i < prediction.length; i++) {
            console.log(
                prediction[i].className,
                prediction[i].probability
            );
            if (
                prediction[i].className === "Wearing Specs" &&
                prediction[i].probability > 0.70
            ) {
                wearingSpecs = true;
            }
        }
        const status = document.getElementById("status");
        if (wearingSpecs) {
            status.innerText = "Specs Detected ✅";
            console.log("Specs detected");
            stopAlarm();
            stopCamera();
            checking = false;

        }
        else {
            status.innerText = "Please Wear Your Specs ❌";
            console.log("No specs detected");
            if (alarm.paused) {
                alarm.play();
            }
        }
    } catch (error) {
        console.error(error);
    }
}
function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => {
            track.stop();
        });
        document.getElementById("webcam").srcObject = null;
        console.log("Camera stopped");
    }
}
function stopAlarm() {
    if (alarm) {
        alarm.pause();
        alarm.currentTime = 0;
        console.log("Alarm stopped");
    }
}
function cancelProcess() {
    checking = false;
    stopAlarm();
    stopCamera();
    window.close()
    document.getElementById("status").innerText =
        "Process Cancelled";
    console.log("Process cancelled");
}
window.cancelProcess = cancelProcess;

init();