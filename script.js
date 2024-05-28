// HTML elements
const datetimeInput = document.getElementById('datetime');
const notesInput = document.getElementById('notes');
const video = document.getElementById('video');
const canvas = document.getElementById('photo-canvas');
const photoOverlay = document.getElementById('photo-overlay');
const context = canvas.getContext('2d');
const takePhotoButton = document.getElementById('take-photo');
const savePhotoButton = document.getElementById('save-photo');
const switchCameraButton = document.getElementById('switch-camera');

let latitude, longitude, elevation, accuracy;
let currentStream = null;
let usingFrontCamera = true;

async function getCameraStream(front = true) {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }
    const constraints = {
        video: {
            facingMode: front ? 'user' : 'environment'
        }
    };
    currentStream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = currentStream;
    video.play();
}

// Access device camera
getCameraStream(usingFrontCamera).catch(err => console.error("Error accessing camera: ", err));

// Get current geolocation
function getGeolocation() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            position => {
                latitude = position.coords.latitude;
                longitude = position.coords.longitude;
                elevation = position.coords.altitude + ' m';
                accuracy = position.coords.accuracy + ' m';

                resolve();
            },
            err => reject(err)
        );
    });
}

takePhotoButton.addEventListener('click', async () => {
    try {
        await getGeolocation();
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const datetime = datetimeInput.value;
        const notes = notesInput.value;
        const overlayText = `Latitude: ${latitude}\nLongitude: ${longitude}\nElevation: ${elevation}\naccuracy: ${accuracy}\nDate & Time: ${datetime}\nNotes: ${notes}`;
        photoOverlay.textContent = overlayText;
        photoOverlay.style.display = 'block';

        context.fillStyle = 'white';
        context.fillRect(5, 713 - 127, 260, 122);
        context.fillStyle = 'black';
        context.font = '20px Arial';
        context.fillText(`Latitude: ${latitude}`, 10, canvas.height - 115);
        context.fillText(`Longitude: ${longitude}`, 10, canvas.height - 95);
        context.fillText(`Elevation: ${elevation}`, 10, canvas.height - 75);
        context.fillText(`Accuracy: ${accuracy}`, 10, canvas.height - 55);
        context.fillText(`Time: ${datetime}`, 10, canvas.height - 35);
        context.fillText(`Note: ${notes}`, 10, canvas.height - 15);

        // Draw logo text on canvas
        const logoText = "Powered By NoteCam";
        const logoFontSize = 22;

        context.font = `italic bold ${logoFontSize}px Arial`;
        context.fillStyle = '#c41b1b';

        const logoX = canvas.width - context.measureText(logoText).width - 20;
        const logoY = canvas.height - 10;

        context.fillText(logoText, logoX, logoY);

    } catch (error) {
        console.error("Error getting geolocation: ", error);
    }
});

switchCameraButton.addEventListener('click', () => {
    usingFrontCamera = !usingFrontCamera;
    getCameraStream(usingFrontCamera).catch(err => console.error("Error switching camera: ", err));
});

savePhotoButton.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'photo_with_metadata.png';
    link.href = canvas.toDataURL();
    link.click();
});
