import { server } from './server';

const start = () => {
    const port = process.env.SERVER_PORT || '3000';
    server.listen(port, () => {
        console.debug(`Listening on port ${port}`);
    });
};
start();
