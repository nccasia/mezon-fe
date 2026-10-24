import { describe, expect, it } from '@jest/globals';
import { SPEAKING_HOLD_MS, isStillSpeaking, pickTileToSwapOut, speakerRecency } from './speakerSpotlight';

describe('speakerSpotlight', () => {
	describe('isStillSpeaking', () => {
		it('returns false when lastLoudAt is undefined', () => {
			expect(isStillSpeaking(undefined, 1000)).toBe(false);
		});

		it('returns true while inside the hold window and false at or past the hold window', () => {
			expect(isStillSpeaking(1000, 1000)).toBe(true);
			expect(isStillSpeaking(1000, 1000 + SPEAKING_HOLD_MS - 1)).toBe(true);
			expect(isStillSpeaking(1000, 1000 + SPEAKING_HOLD_MS)).toBe(false);
			expect(isStillSpeaking(1000, 1000 + SPEAKING_HOLD_MS + 200)).toBe(false);
		});

		it('respects a custom holdMs', () => {
			expect(isStillSpeaking(500, 750, 300)).toBe(true);
			expect(isStillSpeaking(500, 800, 300)).toBe(false);
		});
	});

	describe('pickTileToSwapOut', () => {
		it('returns undefined for an empty list', () => {
			expect(pickTileToSwapOut([], () => 0)).toBeUndefined();
		});

		it('picks the visible tile whose participant spoke least recently', () => {
			const recency: Record<string, number> = {
				'peer-1-camera': 5000,
				'peer-2-camera': 2000,
				'peer-3-camera': 4000
			};
			expect(pickTileToSwapOut(['peer-1-camera', 'peer-2-camera', 'peer-3-camera'], (id) => recency[id] ?? 0)).toBe('peer-2-camera');
		});

		it('breaks ties by picking the last matching visible tile', () => {
			expect(pickTileToSwapOut(['peer-1-camera', 'peer-2-camera', 'peer-3-camera'], () => 0)).toBe('peer-3-camera');
			const recency: Record<string, number> = {
				'peer-1-camera': 1000,
				'peer-2-camera': 3000,
				'peer-3-camera': 1000
			};
			expect(pickTileToSwapOut(['peer-1-camera', 'peer-2-camera', 'peer-3-camera'], (id) => recency[id] ?? 0)).toBe('peer-3-camera');
		});

		it('keeps recently active speaker X visible when alternating speakers by swapping out silent tile A instead of X', () => {
			const recency: Record<string, number> = {
				A: 0,
				B: 3000,
				C: 4000,
				X: 6000
			};
			expect(pickTileToSwapOut(['A', 'B', 'C', 'X'], (id) => recency[id] ?? 0)).toBe('A');
		});
	});

	describe('speakerRecency', () => {
		it('ranks a participant who is speaking right now above everyone', () => {
			expect(speakerRecency({ speaking: true, recentlySpokeUntil: 1 })).toBe(Number.POSITIVE_INFINITY);
		});

		it('uses recentlySpokeUntil when silent and 0 when unknown', () => {
			expect(speakerRecency({ speaking: false, recentlySpokeUntil: 4200 })).toBe(4200);
			expect(speakerRecency(undefined)).toBe(0);
		});

		it('never swaps out a visible tile whose participant is still talking', () => {
			const info: Record<string, { speaking: boolean; recentlySpokeUntil: number }> = {
				X: { speaking: true, recentlySpokeUntil: 1000 },
				B: { speaking: false, recentlySpokeUntil: 3000 },
				C: { speaking: false, recentlySpokeUntil: 4000 }
			};
			expect(pickTileToSwapOut(['X', 'B', 'C'], (id) => speakerRecency(info[id]))).toBe('B');
		});
	});
});
