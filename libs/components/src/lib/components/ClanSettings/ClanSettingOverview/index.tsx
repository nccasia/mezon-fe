import { useClans } from '@mezon/core';
import { selectCurrentClan } from '@mezon/store';
import { ApiUpdateClanDescRequest } from 'mezon-js';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import ClanBannerBackground from './ClanBannerBackground';
import ClanLogoName from './ClanLogoName';
import ModalSaveChanges from './ModalSaveChanges';

const ClanSettingOverview = () => {
	const { updateClan } = useClans();
	const currentClan = useSelector(selectCurrentClan);
	const [hasChanges, setHasChanges] = useState<boolean>(false);
	const [clanRequest, setClanRequest] = useState<ApiUpdateClanDescRequest>({
		banner: currentClan?.banner ?? '',
		clan_id: currentClan?.clan_id ?? '',
		clan_name: currentClan?.clan_name ?? '',
		creator_id: currentClan?.creator_id ?? '',
		logo: currentClan?.logo ?? '',
	});

	const handleUploadBackground = (urlImage: string) => {
		setClanRequest({ ...clanRequest, banner: urlImage });
	};

	const handleUploadLogo = (urlLogo: string) => {
		setClanRequest({ ...clanRequest, logo: urlLogo ?? '' });
	};

	const handleChangeName = (clanName: string) => {
		setClanRequest({ ...clanRequest, clan_name: clanName ?? '' });
	};

	const handleSave = async () => {
		await updateClan(clanRequest);
	};

	const handleReset = () => {
		setHasChanges(false);
	};

	return (
		<div className="h-full">
			<ClanLogoName
				hasChanges={hasChanges}
				onUpload={handleUploadLogo}
				onGetClanName={handleChangeName}
				onHasChanges={(hasChanges) => setHasChanges(hasChanges)}
			/>
			<ClanBannerBackground
				hasChanges={hasChanges}
				onUpload={handleUploadBackground}
				onHasChanges={(hasChanges) => setHasChanges(hasChanges)}
			/>
			{hasChanges && <ModalSaveChanges onSave={handleSave} onReset={handleReset} />}
		</div>
	);
};

export default ClanSettingOverview;
