import { appAdapter, appReducer, fetchApp } from './app.slice';

describe('app reducer', () => {
	it('should handle initial state', () => {
		const expected = appAdapter.getInitialState({
			loadingStatus: 'not loaded',
			error: null
		});

		expect(appReducer(undefined, { type: '' })).toEqual(expected);
	});

	it('should handle fetchApp', () => {
		let state = appReducer(undefined, fetchApp.pending(''));

		expect(state).toEqual(
			expect.objectContaining({
				loadingStatus: 'loading',
				error: null,
				entities: {},
				ids: []
			})
		);

		state = appReducer(state, fetchApp.fulfilled([{ id: 1 }], ''));

		expect(state).toEqual(
			expect.objectContaining({
				loadingStatus: 'loaded',
				error: null,
				entities: { 1: { id: 1 } },
				ids: [1]
			})
		);

		state = appReducer(state, fetchApp.rejected(new Error('Uh oh'), ''));

		expect(state).toEqual(
			expect.objectContaining({
				loadingStatus: 'error',
				error: 'Uh oh',
				entities: { 1: { id: 1 } },
				ids: [1]
			})
		);
	});
});
