import { Dimensions, Text, View } from "react-native";

interface IServerProfile {
    trigger: number;
}

export default function ServerProfile({ }: IServerProfile) {
    return (
        <View style={{ width: Dimensions.get("screen").width }}>
            <Text style={{ color: "white" }}>Coming soon</Text>
        </View>
    )
}