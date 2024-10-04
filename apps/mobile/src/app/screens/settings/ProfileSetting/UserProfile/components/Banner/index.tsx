import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { baseColor, size, useTheme } from '@mezon/mobile-ui';
import { useMemo, useRef } from 'react';
import { View } from 'react-native';
import { useMixImageColor } from '../../../../../../../app/hooks/useMixImageColor';
import { IMezonImagePickerHandler, IMezonMenuSectionProps, MezonBottomSheet, MezonImagePicker, MezonMenu } from '../../../../../../temp-ui';
import { style } from './styles';

interface IBannerAvatarProps {
	avatar: string;
	onLoad?: (url: string) => void;
	alt?: string;
	defaultAvatar?: string;
}

export default function BannerAvatar({ avatar, onLoad, alt, defaultAvatar }: IBannerAvatarProps) {
	const { themeValue } = useTheme();
	const styles = style(themeValue);
	const { color } = useMixImageColor(avatar);
	const avatarBSRef = useRef<BottomSheetModal>();
	const avatarPickerRef = useRef<IMezonImagePickerHandler>();

	const handleOnload = async (url: string) => {
		console.log(url);
		onLoad && onLoad(url);
	};

	const openAvatarBS = () => {
		avatarBSRef?.current?.present();
	};

	const removeAvatar = () => {
		onLoad && onLoad(defaultAvatar || '');
		avatarBSRef?.current?.dismiss();
	};

	const pickAvatar = () => {
		avatarPickerRef?.current?.openSelector();
		avatarBSRef?.current?.dismiss();
	};

	const menu = useMemo(
		() =>
			({
				items: [
					{
						title: 'Change Avatar',
						onPress: () => pickAvatar()
					},
					{
						title: 'Remove Avatar',
						textStyle: { color: baseColor.redStrong },
						onPress: () => removeAvatar()
					}
				]
			}) satisfies IMezonMenuSectionProps,
		[]
	);

	return (
		<View>
			<View style={[styles.bannerContainer, { backgroundColor: color }]}>
				<MezonImagePicker
					width={'100%'}
					height={'100%'}
					defaultValue={''}
					defaultColor={color}
					noDefaultText
					style={{ borderWidth: 0, borderRadius: 0 }}
					penPosition={{ right: 10, top: 10 }}
				/>
			</View>

			<View style={styles.avatarContainer}>
				<MezonImagePicker
					ref={avatarPickerRef}
					width={size.s_100}
					height={size.s_100}
					defaultValue={avatar || ''}
					alt={alt}
					rounded
					style={{ borderWidth: 5, borderColor: themeValue.primary }}
					onLoad={handleOnload}
					autoUpload
					penPosition={{ right: 5, top: 5 }}
					onPressAvatar={openAvatarBS}
				/>

				<View style={[styles.onLineStatus]}></View>
			</View>

			<MezonBottomSheet heightFitContent title="Avatar" ref={avatarBSRef}>
				<View style={{ padding: size.s_20 }}>
					<MezonMenu menu={[menu]} />
				</View>
			</MezonBottomSheet>
		</View>
	);
}
