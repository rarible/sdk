module.exports = {
	roots: ["<rootDir>/src"],
	setupFiles: ["<rootDir>/jest.setup.js"],
	bail: true,
	transform: {
		"^.+\\.ts?$": ["ts-jest", {
			tsconfig: "tsconfig-build.json",
		}],
	},
}
