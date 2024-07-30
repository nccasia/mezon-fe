import React from 'react';
import { Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { styles } from './styles';

interface ForwardMessageModalProps {
	show?: boolean;
	onClose: () => void;
}

const LicenseAgreement = ({ show, onClose }: ForwardMessageModalProps) => {
	return (
		<Modal isVisible={show} animationIn={'fadeIn'} hasBackdrop={true} coverScreen={true} avoidKeyboard={false} backdropColor={'rgba(0,0,0, 0.7)'}>
			<View style={styles.sheetContainer}>
				<View style={styles.headerModal}>
					<Text style={styles.headerText}>License Agreement</Text>
					<View style={{ width: 16 }}></View>
				</View>
				<ScrollView style={styles.content}>
					<Text style={styles.header}>1. License Grant and Restrictions</Text>
					<Text style={styles.text}>
						Subject to your compliance with this Agreement, Mezon grants you a limited, non-exclusive, non-transferable license to use the
						Mezon application. You may not:
					</Text>
					<Text style={styles.bulletPoint}>- Reverse engineer, decompile, or disassemble the app.</Text>
					<Text style={styles.bulletPoint}>- Modify or create derivative works based on the app.</Text>
					<Text style={styles.bulletPoint}>- Rent, lease, lend, sell, redistribute, or sublicense the app.</Text>

					<Text style={styles.header}>2. Termination</Text>
					<Text style={styles.text}>
						This license is effective until terminated by you or Mezon. Your rights under this license will terminate automatically
						without notice if you fail to comply with any terms of this Agreement. Upon termination, you shall cease all use of the app
						and destroy all copies, full or partial, of the app.
					</Text>

					<Text style={styles.header}>3. No Warranty</Text>
					<Text style={styles.text}>
						You expressly acknowledge and agree that use of the app is at your sole risk and that the entire risk as to satisfactory
						quality, performance, accuracy, and effort is with you. To the maximum extent permitted by applicable law, the app is provided
						"as is" and "as available," with all faults and without warranty of any kind.
					</Text>

					<Text style={styles.header}>4. Governing Law</Text>
					<Text style={styles.text}>
						This Agreement shall be governed by and construed in accordance with the laws of [Your Country], excluding its conflicts of
						law rules.
					</Text>

					<Text style={styles.header}>5. Contact Information</Text>
					<TouchableOpacity onPress={() => Linking.openURL('https://mezon.ai')}>
						<Text style={styles.text}>
							If you have any questions about this Agreement, please contact us at <Text style={styles.link}>https://mezon.ai</Text>
						</Text>
					</TouchableOpacity>
				</ScrollView>

				<TouchableOpacity style={styles.btn} onPress={onClose}>
					<Text style={styles.btnText}>Agree</Text>
				</TouchableOpacity>
			</View>
		</Modal>
	);
};

export default LicenseAgreement;
