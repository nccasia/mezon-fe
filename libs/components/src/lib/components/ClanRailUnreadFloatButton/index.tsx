import { getStore, selectBadgeClanById, selectClanUnreadStates, selectOrderedClansWithGroups, type RootState } from '@mezon/store';
import { Button } from '@mezon/ui';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

type RailScrollTarget = {
	clanIds: string[];
	selector: string;
};

const clanHasBadgeCount = (state: RootState, clanId: string) => (selectBadgeClanById(state, clanId) || 0) > 0;

const isBelowScrollContainer = (container: HTMLElement, element: HTMLElement) => {
	const containerRect = container.getBoundingClientRect();
	const elementRect = element.getBoundingClientRect();
	return elementRect.top > containerRect.bottom - 4;
};

type ClanRailUnreadFloatButtonProps = {
	scrollContainerRef: React.RefObject<HTMLElement | null>;
};

export const ClanRailUnreadFloatButton = memo(({ scrollContainerRef }: ClanRailUnreadFloatButtonProps) => {
	const orderedClansWithGroups = useSelector(selectOrderedClansWithGroups);
	const clanUnreadStates = useSelector(selectClanUnreadStates);

	const railTargets = useMemo((): RailScrollTarget[] => {
		const targets: RailScrollTarget[] = [];
		for (const item of orderedClansWithGroups) {
			if (!item) continue;
			if (item.type === 'clan' && item.clan) {
				targets.push({
					clanIds: [item.clan.id],
					selector: `[data-id="${item.clan.id}"]`
				});
			} else if (item.type === 'group' && 'group' in item && item.group) {
				const group = item.group;
				if (group.isExpanded) {
					for (const clanId of group.clanIds) {
						targets.push({
							clanIds: [clanId],
							selector: `[data-id="${clanId}"]`
						});
					}
				} else {
					targets.push({
						clanIds: group.clanIds,
						selector: `[data-clan-rail-item="group:${group.id}"]`
					});
				}
			}
		}
		return targets;
	}, [orderedClansWithGroups]);

	const [scrollTarget, setScrollTarget] = useState<RailScrollTarget | null>(null);

	const updateScrollTarget = useCallback(() => {
		const container = scrollContainerRef.current;
		if (!container) {
			setScrollTarget(null);
			return;
		}

		const state = getStore().getState() as RootState;

		for (const target of railTargets) {
			const hasNotif = target.clanIds.some((clanId) => clanHasBadgeCount(state, clanId));
			if (!hasNotif) continue;

			const element = container.querySelector(target.selector);
			if (!(element instanceof HTMLElement)) continue;

			if (isBelowScrollContainer(container, element)) {
				setScrollTarget(target);
				return;
			}
		}

		setScrollTarget(null);
	}, [railTargets, scrollContainerRef]);

	useEffect(() => {
		updateScrollTarget();
		const container = scrollContainerRef.current;
		if (!container) return;

		const onScroll = () => updateScrollTarget();
		container.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll);

		const observer = new ResizeObserver(onScroll);
		observer.observe(container);

		return () => {
			container.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
			observer.disconnect();
		};
	}, [scrollContainerRef, updateScrollTarget, clanUnreadStates, orderedClansWithGroups]);

	const handleClick = useCallback(() => {
		const container = scrollContainerRef.current;
		if (!container || !scrollTarget) return;

		const element = container.querySelector(scrollTarget.selector);
		if (element instanceof HTMLElement) {
			element.scrollIntoView({ block: 'center', behavior: 'smooth' });
		}
	}, [scrollContainerRef, scrollTarget]);

	if (!scrollTarget) return null;

	return (
		<Button
			type="button"
			onClick={handleClick}
			title="New"
			className="relative z-[1] !normal-case flex h-5 items-center justify-center rounded-full border border-white/25 bg-[#DA373C] px-2 py-0 text-white shadow-[0_4px_14px_rgba(0,0,0,0.45),0_2px_4px_rgba(201,43,60,0.5)] transition-[transform,box-shadow,filter] duration-150 hover:-translate-y-0.5 hover:brightness-95 hover:shadow-[0_6px_18px_rgba(0,0,0,0.5),0_3px_6px_rgba(201,43,60,0.55)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-[#e84b52] active:translate-y-0 active:scale-95 motion-reduce:transform-none"
		>
			<span className="text-[8px] font-semibold uppercase leading-none">New</span>
		</Button>
	);
});
