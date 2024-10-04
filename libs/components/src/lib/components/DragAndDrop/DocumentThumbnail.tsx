import { Icons } from '@mezon/ui';

function DocumentThumbnail() {
	return (
		<div className="flex flex-row justify-center">
			<div className="-rotate-45 -mr-12">
				<Icons.TxtThumbnail defaultFill="#C9CEF9" defaultSize="w-28 h-28" />
			</div>
			<div className="z-10">
				<Icons.XlsThumbnail defaultSize="w-28 h-28 " />
			</div>
			<div className="rotate-45 -ml-12">
				<Icons.PdfThumbnail defaultFill="#C9CEF9" defaultSize="w-28 h-28" />
			</div>
		</div>
	);
}

export default DocumentThumbnail;
