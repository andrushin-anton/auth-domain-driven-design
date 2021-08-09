import { PublisherRepository } from '@domain/event/publisher-repository';

interface Message {
    event: string,
    payload: string,
}

export class InMemoryPublisher implements PublisherRepository {
    private events: Message[] = [];

    publish<T>(
        eventName: string,
        msg: T,
        /* eslint-disable-next-line */
        _pattern?: boolean,
    ): void {
        global.console.info('-----New event-----');
        global.console.info(`Name: ${eventName}`);
        global.console.info(`Payload: ${JSON.stringify(msg)}`);

        this.events.push({
            event: eventName,
            payload: JSON.stringify(msg),
        });
    }

    getLastEvent(): Message {
        if (!this.events.length) {
            return {
                event: '',
                payload: '',
            };
        }
        return this.events[this.events.length - 1];
    }
}
