const { obs } = require('../utils/connection/connect.js');
const { createNewScene } = require('../utils/scene-setup/scene.js');
const {
	isSourcePresent,
	audioSetup,
	videoSetup,
} = require('../utils/scene-setup/capture.js');
const handleErrors = require('../utils/handleErrors.js');

obs.on('ExitStarted', () => {
	console.log('Now exiting...');
	try {
		process.exit();
	} catch (err) {
		handleErrors(err);
	}
});

obs.on('Identified', () => {
	try {
		// Assures that the program is ready to process requests
		setTimeout(async () => {
			console.log('Connected to OBS WebSocket');
			await createNewScene('KOF XIII');
			const sources = await isSourcePresent();
			if (!sources) {
				console.log('Creating Input Sources...');
				await audioSetup('KOF XIII');
				await videoSetup('KOF XIII');
			}
			const alertServer = fetch('http://localhost:4609/obs-ready', {
				method: 'GET',
			});
		}, 1000);
	} catch (err) {
		handleErrors(err);
	}
});

obs.on('RecordStateChanged', (state) => {
	if (state.outputActive == false && state.outputPath != null) {
		console.log(state);
	}
	// Saved replay conversion initated, alert IPC
});
obs.on('ReplayBufferSaved', (buff) => {
	console.log('This is the replay buffer : ');
	console.log(buff);
});
obs.on('InputCreated', () => {
	console.log('input created ');
});
module.exports = { obs };
