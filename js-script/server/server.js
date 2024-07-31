const { obs } = require('../utils/connection/connect.js');
const express = require('express');
const app = express();
const PORT = 4609;
const recordingRoutes = require('./routes/routes.js');
// Action imports

const waitKeyPress = require('../utils/actions/waitKeyPress.js');
const handleErrors = require('../utils/handleErrors.js');

app.use(express.json());
app.use('/', recordingRoutes);

obs.on('RecordStateChanged', (data) => {
	console.log('Record state changed:', data);
	if (!data.outputActive && data.outputPath !== null) {
		console.log('Recording has finished converting.');
		// Perform actions after recording has finished converting
	}
});
// Starts the web server once connected to the websocket
obs.on('ConnectionOpened', async () => {
	try {
		app.listen(4609, () => {
			console.log(`Server listening on port 4609`);
			// TODO: Move it to websocketApi.js
		});
	} catch (err) {
		handleErrors(err);
	}
});

// Exit the process on keypress
async function exit() {
	console.log("Press 'Q' to exit...");
	await waitKeyPress('q');
	process.exit();
}
exit();

module.exports = { obs, app };
