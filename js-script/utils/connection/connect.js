const { default: OBSWebSocket } = require('obs-websocket-js');
const obs = new OBSWebSocket();
const connectWs = async () => {
	try {
		const { obsWebSocketVersion, negotiatedRpcVersion } = await obs.connect(
			'ws://127.0.0.1:4455',
			'super-sekret',
			{
				rpcVersion: 1,
			}
		);
		console.log(
			`Connected to server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`
		);
		return true; // Connection successful
	} catch (error) {
		console.error('Failed to connect', error.code, error.message);
		return false; // Connection failed
	}
};

module.exports = { connectWs, obs };
