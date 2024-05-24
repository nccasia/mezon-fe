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
			maxWidth: 'calc(100% - 100px)',
			border: '1px solid transparent',
		},
		input: {
			padding: '9px 12px',
			border: 'none',
			outline: 'none',
			whiteSpace: 'pre-wrap',
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
		border: '1px solid #0B0B0B',
		boxShadow: '1px 2px #000',
		padding: '5px 0px 5px 2px',
		width: '100%',
		borderRadius: 12,
		marginBottom: 20,
		backgroundColor: '#272822',
		list: {
			maxHeight: 400,
			overflowY: 'auto',
			backgroundColor: '#272822',
			padding: '5px 8px 5px 10px',
		},
		item: {
			padding: '5px 15px',
			borderBottom: '1px solid rgba(0,0,0,0.15)',
			'&focused': {
				backgroundColor: '#41433A',
				borderRadius: 6,
			},
		},
	},
};
