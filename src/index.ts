/**
 * @author WMXPY
 * @namespace Brontosaurus_Server
 * @description Index
 */

import { SudooExpress, SudooExpressApplication } from '@sudoo/express';
import * as BodyParser from 'body-parser';
import * as Mongoose from "mongoose";
import { RetrieveRoute } from './routes/portal/account/retrieve';
import { RegisterRoute } from './routes/red/account/register';
import { CreateApplicationRoute } from './routes/red/application/create';
import { AccountValidateRoute } from './routes/red/validate';
import { PortalRoute } from './routes/static/portal';
import { BrontosaurusConfig, readConfigSync } from './util/conf';
import { registerConnor } from './util/error';

const setting: SudooExpressApplication = SudooExpressApplication.create('Brontosaurus', '1');
const app: SudooExpress = SudooExpress.create(setting);

const config: BrontosaurusConfig = readConfigSync();

registerConnor();

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

app.route(new CreateApplicationRoute());
app.route(new AccountValidateRoute());

app.host(8080);
console.log('hosting');
