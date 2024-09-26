import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import DeviceInfo from 'react-native-device-info';

const useTabletLandscape = () => {
    const [isTabletLandscape, setIsTabletLandscape] = useState<boolean>(false);

    useEffect(() => {
        const checkOrientation = () => {
            const { width, height } = Dimensions.get('window');
            const isLandscape = width > height;

            if (DeviceInfo.isTablet() && isLandscape) {
                setIsTabletLandscape(true);
            } else {
                setIsTabletLandscape(false);
            }
        };

        checkOrientation();

        const subscription = Dimensions.addEventListener('change', checkOrientation);

        return () => subscription?.remove();
    }, []);

    return isTabletLandscape;
};

export default useTabletLandscape;
