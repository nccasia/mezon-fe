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
		border: '1px solid rgb(230, 230, 230)',
		padding: '5px 0px 5px 2px',
		width: '100%',
		borderRadius: 12,
		marginBottom: 20,
		backgroundColor: '#f2f2f2',
		
		list: {
			maxHeight: 400,
			overflowY: 'auto',
			backgroundColor: '#f2f2f2',
			padding: '5px 8px 5px 10px',
			
		},
		item: {
			padding: '5px 15px',
			borderBottom: '1px solid rgba(0,0,0,0.15)',
			'&focused': {
				backgroundColor: '#e6e6e6',
				borderRadius: 6,
			},
		},
	},
};
