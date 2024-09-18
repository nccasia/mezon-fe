import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Icons } from '@mezon/mobile-components';
import { baseColor, size, useTheme } from '@mezon/mobile-ui';
import { selectAllEventManagement, selectChannelById, selectCurrentClanId, selectOngoingEvent } from '@mezon/store-mobile';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { MezonBottomSheet, MezonTab } from '../../../temp-ui';
import EventDetail from '../EventDetail';
import EventMember from '../EventMember';
import { style } from './styles';

export const EventOngoingPanel = React.memo(
	React.forwardRef((_, refRBSheet: React.Ref<BottomSheetModal>) => {
		const { themeValue } = useTheme();
		const styles = style(themeValue);
		const { t } = useTranslation(['inviteToChannel']);
		const currentClanId = useSelector(selectCurrentClanId);
		const allEventManagement = useSelector(selectAllEventManagement);
		const onGoingEvent = useSelector(selectOngoingEvent);

		const currentOnGoingEventEntity = useMemo(() => {
			if (onGoingEvent) {
				return allEventManagement.find((event) => event.id === onGoingEvent?.event_id);
			}
		}, [allEventManagement, onGoingEvent]);

		const channelVoice = useSelector(selectChannelById(currentOnGoingEventEntity?.channel_id));

		const handleOpenDetail = useCallback(() => {
			//@ts-ignore
			refRBSheet?.current?.present();
		}, []);

		return (
			<View>
				{currentOnGoingEventEntity && currentClanId === currentOnGoingEventEntity.clan_id && (
					<View style={styles.onGoingEventPanel}>
						<View style={styles.titleRow}>
							<Icons.CalendarIcon height={size.s_16} width={size.s_16} color={baseColor.green} />
							<Text style={styles.onGoingEventTitle}>{t('events')}</Text>
						</View>
						<Text style={styles.titleEvent}>{currentOnGoingEventEntity.title}</Text>
						<View style={[styles.titleRow, { gap: size.s_4, marginTop: size.s_4 }]}>
							{currentOnGoingEventEntity?.address ? (
								<Icons.LocationIcon height={size.s_16} width={size.s_16} color={themeValue.text} />
							) : (
								<Icons.VoiceNormalIcon height={size.s_16} width={size.s_16} color={themeValue.text} />
							)}
							<Text style={styles.titleEvent}>
								{currentOnGoingEventEntity?.address ? currentOnGoingEventEntity?.address : channelVoice?.channel_label}
							</Text>
						</View>
						<TouchableOpacity style={styles.detailButton} onPress={handleOpenDetail}>
							<Text style={styles.titleEvent}>{t('detail')}</Text>
						</TouchableOpacity>
					</View>
				)}
				<MezonBottomSheet ref={refRBSheet}>
					<MezonTab
						views={[
							<EventDetail event={currentOnGoingEventEntity} eventDetailRef={refRBSheet} />,
							<EventMember event={currentOnGoingEventEntity} />
						]}
						titles={['Event Info', 'Interested']}
					/>
				</MezonBottomSheet>
			</View>
		);
	})
);
