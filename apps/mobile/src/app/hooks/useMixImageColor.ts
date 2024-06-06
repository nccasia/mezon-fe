import { useEffect } from "react";
import { useCallback, useState } from "react";
import ImageColors from "react-native-image-colors";

export function useMixImageColor (imageUrl: string) {
    const [color, setColor] = useState<string>('#323232');

    const getColor = useCallback(async () => {
		if (imageUrl) {
			try {
				const result = await ImageColors.getColors(imageUrl, {
					fallback: '#323232',
					cache: true,
					key: imageUrl,
				});

				switch (result.platform) {
					case 'android':
						setColor(result.dominant);
						break;
					case 'ios':
						setColor(result.background);
						break;
				}
			} catch (error) {
				console.error(error);
			}
		}
	}, [imageUrl]);

    useEffect(() => {
        if (imageUrl !== undefined && imageUrl !== '') {
            getColor();
        }
    }, [imageUrl, getColor])

    
    return {
        color
    }
}
