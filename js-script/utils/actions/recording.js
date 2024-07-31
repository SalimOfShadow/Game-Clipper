const { obs } = require('../connection/connect');
const handleErrors = require('../handleErrors');

async function recordingAction(action, cb, res) {
	try {
		const status = await cb();
		if (!status) {
			console.log(`Failed to ${action} the recording.`);
			res.status(500).send({ message: `Failed to ${action} the recording` });
			return;
		}
		res.status(200).send({
			message: `OBS successfully was able to successfully ${action} the recording!`,
		});
		console.log(status);
	} catch (err) {
		console.log(`Failed to ${action} the recording.`);
		res.status(500).send({ message: `Failed to ${action} the recording` });
	}
}

const startRecording = async () => {
	try {
		const start = await obs.call('StartRecord');
		console.log('Start the recording');
		return true;
	} catch (err) {
		handleErrors(err);
		return false;
	}
};
const pauseRecording = async () => {
	try {
		const pause = await obs.call('PauseRecord');
		console.log('Pause the recording');
		return true;
	} catch (err) {
		console.log('Failed to pause recording');
		handleErrors(err);
		return false;
	}
};
const resumeRecording = async () => {
	try {
		const resume = await obs.call('ResumeRecord');
		console.log('Resume the recording');
		return true;
	} catch (err) {
		console.log('Failed to resume recording');
		handleErrors(err);
		return false;
	}
};
const stopRecording = async () => {
	try {
		const stop = await obs.call('StopRecord');
		console.log('Stopped the recording');
		return true;
	} catch (err) {
		console.log('Failed to stop recording');
		handleErrors(err);
		return false;
	}
};

module.exports = {
	startRecording,
	pauseRecording,
	resumeRecording,
	stopRecording,
	recordingAction,
};
