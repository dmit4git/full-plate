import {useCallback, useState} from "react";
import type {KcContext} from "../login/KcContext";
import {Messages, MessagesMessage} from "primereact/messages";
import {isEqual} from "lodash-es";

export function useMessageHandler(message: KcContext['message']) {
    const getMessageFromContext = useCallback(() => {
        if (!message) {
            return null;
        }
        let severity = message.type as MessagesMessage['severity'];
        if (severity === 'warning' as MessagesMessage['severity']) {
            severity = 'warn';
        }
        return {
            severity: severity as MessagesMessage['severity'],
            detail: message.summary.replace('<br/>', '\n'),
            sticky: true,
            closable: false
        };
    }, [message]);

    const [currentMessage, setCurrentMessage] = useState<MessagesMessage | null>(null);
    return useCallback((messagesRef: Messages) => {
        if (message && messagesRef) {
            const newMessage = getMessageFromContext();
            if (newMessage && !isEqual(newMessage, currentMessage)) {
                setCurrentMessage(newMessage);
                messagesRef.clear();
                messagesRef.show(newMessage);
            }
        }
    }, [message, currentMessage]);

}
