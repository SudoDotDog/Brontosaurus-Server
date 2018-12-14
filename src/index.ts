/**
 * @author WMXPY
 * @namespace Brontosaurus_Server
 * @description Index
 */

import { SudooExpress, SudooExpressApplication } from '@sudoo/express';
import * as BodyParser from 'body-parser';
import { PortalRoute } from './routes/portal';

const setting: SudooExpressApplication = SudooExpressApplication.create('Brontosaurus', '1');
const app: SudooExpress = SudooExpress.create(setting);

app.use(BodyParser.urlencoded({
    extended: true,
}));

app.route(PortalRoute);

app.host(8080);
console.log('hosting');
