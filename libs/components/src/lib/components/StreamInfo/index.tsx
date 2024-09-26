import { selectCurrentStreamInfo } from '@mezon/store';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const StreamInfo = () => {
    const currentStreamInfo = useSelector(selectCurrentStreamInfo);
    const channelPath = `/chat/clans/${currentStreamInfo?.clanId}/channels/${currentStreamInfo?.streamId}`;

    return (
        <div>
            <div>
                <Link to={channelPath}>
                    {currentStreamInfo?.streamName}/{currentStreamInfo?.clanName}
                </Link>
            </div>
        </div>
    );
};

export default StreamInfo;