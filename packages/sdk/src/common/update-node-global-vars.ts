export function updateNodeGlobalVars() {
	(global as any).FormData = require("form-data");
	(global as any).window = {
		fetch: require("node-fetch"),
		dispatchEvent: () => {},
	};
	(global as any).CustomEvent = function CustomEvent() {
		return
	}
}
