import { ChannelMessage } from './ChannelMessage'
import { useChat } from '@mezon/core'

export default function ChannelMessages() {
    const { messages } = useChat()

    return (
        <>
            {messages.map((message, i) => (
                <ChannelMessage key={i} message={message} />
            ))}
        </>
    )
}
