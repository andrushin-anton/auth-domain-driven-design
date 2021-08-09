export interface PublisherRepository {
    publish<T>(eventName: string, msg: T, pattern?: boolean): void;
}
