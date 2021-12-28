
export type StateConnected<T> = {
	status: "connected"
	connection: T
	disconnect?: () => Promise<void>
}

export type StateConnecting = {
	status: "connecting"
	providerId: string,
}

export type StateInitializing = {
	status: "initializing"
}

export type StateDisconnected = {
	status: "disconnected"
}

export const STATE_DISCONNECTED: StateDisconnected = { status: "disconnected" }
export const STATE_INITIALIZING: StateInitializing = { status: "initializing" }

export function getStateConnected<T>(params: Omit<StateConnected<T>, "status"> ): StateConnected<T> {
	return { status: "connected", ...params }
}

export function getStateConnecting(params: Omit<StateConnecting, "status">): StateConnecting {
	return { status: "connecting", ...params }
}

export type ConnectionState<T> = StateConnected<T> | StateConnecting | StateInitializing | StateDisconnected