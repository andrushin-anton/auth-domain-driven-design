import { IConnectionConfig, Publisher } from '@icuc/icuc-mq';

const { KAFKA_HOST = 'localhost', KAFKA_PORT = '9092' } = process.env;

const pubOpts: IConnectionConfig = {
    'metadata.broker.list': `${KAFKA_HOST}:${KAFKA_PORT}`,
    'client.id': 'kfk_default_client',
};

export const pub = new Publisher(pubOpts);
