import React from "react";
import { View } from "react-native";
import { ServerIcon } from "./Reusables";
import IconMessage from '../../../../assets/svg/iconMessage.svg';
import PlusGreenIcon from '../../../../assets/svg/guildAddCategoryChannel.svg';
import DiscoveryIcon from '../../../../assets/svg/discoveryStudentHubs.svg';

const ServerList = React.memo((props: any) => {
    const serverData = [{"id":0,"image":"https://img.freepik.com/free-photo/glowing-spaceship-orbits-planet-starry-galaxy-generated-by-ai_188544-9655.jpg?size=626&ext=jpg&ga=GA1.1.1700460183.1713139200&semt=sph","title":"Direct Message","channels":[{"id":1,"category":"information","items":[{"id":1,"title":"testUser1","type":"text"},{"id":2,"title":"testUser2","type":"text"},{"id":3,"title":"testUser3","type":"text"}]}]},{"id":1,"image":"https://img.freepik.com/free-photo/glowing-spaceship-orbits-planet-starry-galaxy-generated-by-ai_188544-9655.jpg?size=626&ext=jpg&ga=GA1.1.1700460183.1713139200&semt=sph","title":"Space Explore","channels":[{"id":1,"category":"information","items":[{"id":1,"title":"welcome-and-rules","type":"text"},{"id":2,"title":"notes-resources","type":"text"}]},{"id":2,"category":"text channels","items":[{"id":3,"title":"general","type":"text"},{"id":4,"title":"casual-chat","type":"text"},{"id":5,"title":"session-planning","type":"text"},{"id":6,"title":"off-topic","type":"text"}]},{"id":3,"category":"video channels","items":[{"id":7,"title":"video-chat","type":"text"},{"id":8,"title":"lounge","type":"voice"},{"id":9,"title":"study room 1","type":"voice"},{"id":10,"title":"study room 2","type":"voice"}]}]},{"id":2,"image":"https://miro.medium.com/v2/resize:fit:1187/1*0FqDC0_r1f5xFz3IywLYRA.jpeg","title":"Coders","channels":[{"id":1,"category":"information","items":[{"id":1,"title":"welcome-and-rules","type":"text"},{"id":2,"title":"notes-resources","type":"text"},{"id":3,"title":"admins","type":"text"},{"id":4,"title":"moderators","type":"text"},{"id":5,"title":"annoucements","type":"text"}]},{"id":2,"category":"text channels","items":[{"id":6,"title":"introduce-yourself","type":"text"},{"id":7,"title":"coding advices","type":"text"},{"id":8,"title":"coding-help","type":"text"},{"id":9,"title":"programmers corner","type":"text"},{"id":10,"title":"work-showcase","type":"text"},{"id":11,"title":"casual-chat","type":"text"},{"id":12,"title":"meeting-planning","type":"text"},{"id":13,"title":"off-topic","type":"text"}]},{"id":3,"category":"video channels","items":[{"id":14,"title":"free time gaming","type":"voice"},{"id":15,"title":"casual-video-chat","type":"voice"},{"id":16,"title":"lounge","type":"voice"}]}]}];
    return (
        <View style={{height: '100%', paddingTop: 20, width: '22%', justifyContent: 'flex-start'}}>
            <ServerIcon
                icon={<IconMessage width={30} height={30} />}
                data={serverData[0]}
             />
            <View style={{width: '100%', alignItems: 'center', marginBottom: 10}}>
                <View style={{borderWidth: .5, borderColor: 'lightgray', width: '50%'}} />
            </View>
            {
                serverData.slice(1, serverData.length).map(server =>
                    <ServerIcon data={server} />
                )
            }
            <ServerIcon icon={<PlusGreenIcon width={30} height={30} />} data={{}} />
            <ServerIcon icon={<DiscoveryIcon width={30} height={30} />} data={{}} />
        </View>
    )
})

export default ServerList;
