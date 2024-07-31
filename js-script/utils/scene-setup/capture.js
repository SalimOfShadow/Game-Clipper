const { obs } = require('../connection/connect.js');
const handleErrors = require('../handleErrors.js');

const KOF = {
	name: 'KOF XIII',
	fullName: 'The King Of Fighters XIII',
	windowId:
		'The King of Fighters XIII:F9D96469-6208-4609-AA55-1192042585C3:kofxiii.exe',
};
const USFIV = {
	name: 'USFIV',
	fullName: 'Ultra Street Fighter IV',
	windowId: 'foobar',
};

const audioSetup = async (game) => {
	let selectedGame;
	if (game === 'KOF XIII') selectedGame = KOF;
	if (game === 'USF4') selectedGame = USF4;
	try {
		// Replace 'kofxiii.exe' and 'The King Of Fighters XIII' with your actual values
		const audio = await obs.call('CreateInput', {
			sceneName: `${selectedGame.fullName} Replay`,
			inputName: `${selectedGame.name} Audio Capture`,
			inputKind: 'wasapi_process_output_capture',
			inputSettings: {
				window: selectedGame.windowId,
			},
			sceneItemEnabled: true,
		});
		console.log(audio);
	} catch (err) {
		console.log(err);
		handleErrors(err);
	}
};

const videoSetup = async (game) => {
	let selectedGame;
	if (game === 'KOF XIII') selectedGame = KOF;
	if (game === 'USF4') selectedGame = USF4;
	try {
		const video = await obs.call('CreateInput', {
			sceneName: `${selectedGame.fullName} Replay`,
			inputName: `${selectedGame.name} Video Capture`,
			inputKind: 'game_capture',
			inputSettings: {
				capture_mode: 'window',
				window: selectedGame.windowId, // TODO - find USFIV's one
				window_match_priority: true,
				window_priority: 0,
			},
			sceneItemEnabled: true,
		});

		console.log(video);
	} catch (err) {
		console.log(err);
		handleErrors(err);
	}
};

//  ---------- TESTING FUNCTIONS ----------
const logSettings = async (type) => {
	try {
		if (type === 'video') {
			const video = await obs.call('GetInputSettings', {
				inputName: 'KOF XIII Video Capture',
			});
			console.log(video);
			return;
		}
		if (type === 'audio') {
			const audio = await obs.call('GetInputSettings', {
				inputName: 'KOF XIII Audio Capture',
			});
			console.log(audio);
		}
	} catch (err) {
		console.log(err);
	}
};

const isSourcePresent = async () => {
	try {
		await obs.call('GetInputSettings', {
			inputName: 'KOF XIII Video Capture',
		});
		await obs.call('GetInputSettings', {
			inputName: 'KOF XIII Audio Capture',
		});
		return true; // Both sources are present
	} catch (err) {
		console.log(err.message);
		return false;
	}
};

module.exports = {
	audioSetup,
	videoSetup,
	logSettings,
	isSourcePresent,
};
