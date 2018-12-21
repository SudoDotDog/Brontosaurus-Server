/**
 * @author WMXPY
 * @namespace Brontosaurus_Server
 * @description Index
 */

import { SudooExpress, SudooExpressApplication } from '@sudoo/express';
import * as BodyParser from 'body-parser';
import * as Mongoose from "mongoose";
import { AccountValidateRoute } from './routes/account/validate';
import { CreateApplicationRoute } from './routes/application/create';
import { PortalRoute } from './routes/portal';
import { RegisterRoute } from './routes/register';
import { RetrieveRoute } from './routes/retrieve';
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
