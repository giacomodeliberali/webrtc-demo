export interface MediaStreamDescriptor {
    stream: MediaStream;
    hasVideo: boolean;
}

export interface DataChannelEvent {
    type: DataChannelEventTypes;
    payload?: any;
}

export enum DataChannelEventTypes {
    BusyRequest,
    BusyResponse,
    IncomingCallRefused,
    CallClosed
}