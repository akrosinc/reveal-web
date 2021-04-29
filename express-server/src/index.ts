import app from './app';
import { EXPRESS_PORT } from './configs/envs';

const PORT = EXPRESS_PORT || 3000;
const server = app.listen(PORT, () => {
    // tslint:disable-next-line:no-console
    console.log(`App listening on port ${PORT}!`);
});

export default server;
