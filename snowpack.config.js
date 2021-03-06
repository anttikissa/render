// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
	exclude: [
		'**/node_modules/**/*',
		'**/dev',
		'**/build',
		'**/deploy'
	],
	mount: {
	},
	plugins: [
	],
	packageOptions: {
	},
	devOptions: {
	},
	buildOptions: {
		out: 'dist'
	},
}
