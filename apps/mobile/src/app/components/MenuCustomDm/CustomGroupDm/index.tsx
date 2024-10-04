import { Icons } from '@mezon/mobile-components';
import { baseColor, Block, Colors, size, useTheme } from '@mezon/mobile-ui';
import { channelsActions, useAppDispatch } from '@mezon/store-mobile';
import { ApiUpdateChannelDescRequest } from 'mezon-js';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';
import { MezonInput } from '../../../temp-ui';
import style from '../MenuCustomDm.styles';

const CustomGroupDm = ({ dmGroupId, channelLabel }: { dmGroupId: string; channelLabel: string }) => {
	const [nameGroup, setNameGroup] = useState<string>(channelLabel || '');
	const nameGroupRef = useRef(nameGroup);
	const { t } = useTranslation(['menuCustomDM']);
	const { themeValue } = useTheme();
	const styles = style(themeValue);

	useEffect(() => {
		nameGroupRef.current = nameGroup;
	}, [nameGroup]);

	useEffect(() => {
		return () => {
			handleSave(nameGroupRef?.current);
		};
	}, []);

	const handelChangeText = (text: string) => {
		setNameGroup(text);
	};
	const dispatch = useAppDispatch();

	const handleSave = async (nameGroup: string) => {
		if (nameGroup && channelLabel !== nameGroup) {
			const updateChannel: ApiUpdateChannelDescRequest = {
				channel_id: dmGroupId || '',
				channel_label: nameGroup || '',
				category_id: '0'
			};
			await dispatch(channelsActions.updateChannel(updateChannel));
		}
	};

	return (
		<Block paddingHorizontal={size.s_20} paddingVertical={size.s_10}>
			<Text style={styles.headerCustomGroup}>{t('customiseGroup')}</Text>
			<Block paddingVertical={size.s_20} alignItems="center">
				<Block
					width={size.s_60}
					height={size.s_60}
					borderRadius={size.s_50}
					backgroundColor={Colors.orange}
					alignItems="center"
					justifyContent="center"
				>
					<Icons.GroupIcon color={baseColor.white} />
				</Block>
			</Block>
			<Text style={styles.labelInput}>{t('groupName')}</Text>
			<MezonInput value={nameGroup} onTextChange={handelChangeText} />
		</Block>
	);
};

export default CustomGroupDm;
