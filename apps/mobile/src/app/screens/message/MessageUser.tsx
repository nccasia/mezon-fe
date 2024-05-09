import { FlatList, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { styles } from './styles'
import moment from 'moment'
import Feather from 'react-native-vector-icons/Feather';

const conversation = [
    {
        id: 1,
        img: 'https://i.pravatar.cc/150?u=brittanyduke@marketoid.com',
        date: 'Fri Dec 22 2000 21:49:21 GMT+0100 (Central European Standard Time)',
        sender: "user",
        message: "Xin chào, tôi muốn đặt một chiếc bánh pizza."
    },
    {
        id: 2,
        img: 'https://i.pravatar.cc/150?u=lindsayduke@marketoid.com',
        date: 'Fri Dec 22 2000 21:49:21 GMT+0100 (Central European Standard Time)',
        sender: "bot",
        message: "Dĩa pizza nào bạn muốn đặt?"
    },
    {
        id: 3,
        img: 'https://i.pravatar.cc/150?u=brittanyduke@marketoid.com',
        date: 'Fri Dec 22 2000 21:49:21 GMT+0100 (Central European Standard Time)',
        sender: "user",
        message: "Tôi muốn đặt một chiếc pizza hải sản."
    },
    {
        id: 4,
        img: 'https://i.pravatar.cc/150?u=lindsayduke@marketoid.com',
        date: 'Fri Dec 22 2000 21:49:21 GMT+0100 (Central European Standard Time)',
        sender: "bot",
        message: "Được, chúng tôi sẽ ghi lại đơn hàng của bạn. Bạn muốn thêm gì nữa không?"
    },
    {
        id: 5,
        img: 'https://i.pravatar.cc/150?u=brittanyduke@marketoid.com',
        date: 'Fri Dec 22 2000 21:49:21 GMT+0100 (Central European Standard Time)',
        sender: "user",
        message: "Không, đó là đủ."
    },

]
const MessageUser = () => {
    return (
        <View style={styles.container}>
            <View style={{ padding: 20 }}>
                <Image source={{ uri: 'https://i.pravatar.cc/150?u=lindsayduke@marketoid.com' }} style={styles.helloImage} />
                <Text style={styles.textHelloBold}>bot</Text>
                <Text style={styles.textHello}>bot</Text>
                <Text style={styles.textChatName}>This is the begining of your direct message history white bot</Text>
            </View>
            <FlatList
                data={conversation}
                keyExtractor={(item) => item.id.toString()}
                ItemSeparatorComponent={() => <View style={{}} />}
                renderItem={({ item }) => (
                    <View style={styles.ChatMessageContainer}>
                        <Image source={{ uri: item.img }} style={styles.imageMessage} />
                        <View style={{}}>
                            <View style={styles.headerChatMessage}>
                                <Text style={styles.textChatName}>{item.sender}</Text>
                                <Text style={styles.textDay}>{moment().diff(moment(item.date), 'days')} d</Text>
                            </View>
                            <Text style={styles.textChatMessage}>{item.message}</Text>
                        </View>

                    </View>
                )} />
            <View style={styles.buttonContainer}>
                <TouchableOpacity>
                    <View>
                        <Feather name="plus" size={20} />
                    </View>
                </TouchableOpacity>
            </View>

        </View>
    )
}

export default MessageUser
