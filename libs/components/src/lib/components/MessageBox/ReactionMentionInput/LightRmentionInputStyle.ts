export default {
	control: {
		fontSize: 16,
	},

	'&multiLine': {
		control: {
			fontFamily: 'gg sans, sans-serif',
			minHeight: 35,
			border: 'none',
			outline: 'none',
		},
		highlighter: {
			padding: 9,
			border: '1px solid transparent',
			maxHeight: '50vh',
			overflow: 'hidden',
		},
		input: {
			width: '100%',
			padding: '9px 10px',
			border: 'none',
			outline: 'none',
			whiteSpace: 'pre-wrap',
			maxHeight: '50vh',
			overflow: 'hidden',
			overflowY: 'auto',
			paddingRight: '90px',
			paddingLeft: '40px',
		},
	},

	'&singleLine': {
		display: 'inline-block',
		width: 180,

		highlighter: {
			padding: 1,
			border: '2px inset transparent',
		},
		input: {
			padding: 1,
			border: '2px inset',
		},
	},

	suggestions: {
		top: '20px',
		width: '100% !important',

		list: {
			overflowY: 'auto',
			maxHeight: '450px',
		},
		item: {
			margin: '0 8px',
			padding: '8px',
			'&focused': {
				backgroundColor: '#E5E6E8',
				borderRadius: 3,
			},
		},
	},
};
