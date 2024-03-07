import React from 'react';
import { SkeletonTheme } from 'react-loading-skeleton';
import { ModalProvider } from 'react-modal-hook';

type Props = {
	children: React.ReactNode;
	themeName?: string;
};

type MezonUiContextValue = {
	selectedTheme: string;
};

export const MezonUiContext = React.createContext<MezonUiContextValue>({
	selectedTheme: 'light',
});

export function MezonUiProvider({ children, themeName }: Props) {
	const [selectedTheme] = React.useState(themeName || 'light');

	const value = React.useMemo(() => ({ selectedTheme }), [selectedTheme]);

	return (
		<MezonUiContext.Provider value={value}>
			<SkeletonTheme baseColor="#202020" highlightColor="#444">
				<ModalProvider>
					{children}
				</ModalProvider>
			</SkeletonTheme>
		</MezonUiContext.Provider>
	);
}
