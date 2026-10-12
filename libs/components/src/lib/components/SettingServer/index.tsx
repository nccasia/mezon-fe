import { useRealtimeServer } from '@mezon/core';
import type { RealtimeServerChoice } from '@mezon/transport';
import { REALTIME_SERVER_CHOICES, realtimeServerRegion } from '@mezon/transport';
import { generateE2eId } from '@mezon/utils';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface ISettingServerProps {
	menuIsOpen: boolean;
}

export const SettingServer = ({ menuIsOpen }: ISettingServerProps) => {
	const { t } = useTranslation(['setting']);
	const { choice, region, isConnected, selectServer } = useRealtimeServer();

	const serverList = useMemo(() => {
		return REALTIME_SERVER_CHOICES.map((value: RealtimeServerChoice) => ({
			value,
			title: realtimeServerRegion(value) ?? t('setting:server.auto'),
			description:
				value === 'auto'
					? choice === 'auto' && region
						? t('setting:server.inUse', { region })
						: t('setting:server.autoHint')
					: value === 'us'
						? t('setting:server.unitedStates')
						: t('setting:server.vietnam')
		}));
	}, [t, choice, region]);

	// Not connected means the reconnect wave is working on it — saying nothing would leave a user
	// whose pinned node is down with no clue why the app went quiet.
	const connectionLine = useMemo(() => {
		if (!region) {
			return null;
		}
		return isConnected ? t('setting:server.connectedTo', { region }) : t('setting:server.connectingTo', { region });
	}, [t, region, isConnected]);

	return (
		<div
			className={`overflow-y-auto flex flex-col flex-1 shrink w-1/2 pt-[94px] pb-7 pr-[10px] sbm:pl-[40px] pl-[10px] overflow-x-hidden ${menuIsOpen ? 'min-w-[700px]' : ''} 2xl:min-w-[900px] max-w-[740px] hide-scrollbar text-theme-primary text-sm`}
		>
			<h1 className="text-xl font-semibold tracking-wider mb-8 text-theme-primary-active">{t('setting:appSettings.server')}</h1>
			<div className="rounded-lg bg-theme-setting-nav p-4">
				<div className="flex flex-col gap-3">
					{serverList.map((server) => (
						<div
							key={server.value}
							className={`flex items-center justify-between gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
								choice === server.value
									? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
									: 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
							}`}
							onClick={() => selectServer(server.value)}
							data-e2e={generateE2eId(`user_setting.server.server_item`)}
						>
							<div className="flex flex-col gap-1 min-w-0">
								<span className="text-theme-primary font-medium">{server.title}</span>
								<span className="text-xs text-theme-primary-secondary">{server.description}</span>
							</div>
							<span
								className={`w-4 h-4 shrink-0 rounded-full border flex items-center justify-center ${
									choice === server.value ? 'border-blue-500' : 'border-gray-400'
								}`}
							>
								{choice === server.value ? <span className="w-2 h-2 rounded-full bg-blue-500" /> : null}
							</span>
						</div>
					))}
				</div>
				{connectionLine ? <p className="mt-4 text-xs text-theme-primary-secondary">{connectionLine}</p> : null}
			</div>
			<p className="mt-4 text-xs text-theme-primary-secondary">{t('setting:server.footer')}</p>
		</div>
	);
};
