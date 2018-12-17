/**
 * @author WMXPY
 * @namespace Brontosaurus_Server
 * @description Index
 */

import { SudooExpress, SudooExpressApplication } from '@sudoo/express';
import * as BodyParser from 'body-parser';
import * as Mongoose from "mongoose";
import { PortalRoute } from './routes/portal';
import { RegisterRoute } from './routes/register';
import { RetrieveRoute } from './routes/retrieve';
import { BrontosaurusConfig, readConfigSync } from './util/conf';

const setting: SudooExpressApplication = SudooExpressApplication.create('Brontosaurus', '1');
const app: SudooExpress = SudooExpress.create(setting);

const config: BrontosaurusConfig = readConfigSync();

Mongoose.set('useCreateIndex', true);

Mongoose.connect(
    config.host + '/' + config.database,
    { useNewUrlParser: true },
);

const db: Mongoose.Connection = Mongoose.connection;
db.on('error', console.log.bind(console, 'connection error:'));

app.use(BodyParser.urlencoded({
    extended: true,
}));

app.route(new PortalRoute());
app.route(new RegisterRoute());
app.route(new RetrieveRoute());

app.host(8080);
console.log('hosting');
