// create a list of connections allowed between nodes. if a connection is not in this list, it will not be allowed
const ConnectionsAllowed = [
	{
		source: 'command-input-source-1',
		target: 'command-output-target-1'
	},
	{
		source: 'command-input-source-1',
		target: 'api-loader-target-1'
	},
	{
		source: 'api-loader-source-1',
		target: 'format-function-target-1'
	}
	// add more connections here
];
export default ConnectionsAllowed;
