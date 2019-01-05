/**
 * @author WMXPY
 * @namespace Brontosaurus_Server
 * @description Index
 */

import { SudooExpress, SudooExpressApplication } from '@sudoo/express';
import { LOG_LEVEL, SudooLog } from '@sudoo/log';
import * as BodyParser from 'body-parser';
import * as Mongoose from "mongoose";
import { RetrieveRoute } from './routes/portal/retrieve';
import { AccountValidateRoute } from './routes/portal/validate';
import { AddGroupRoute } from './routes/red/account/add-group';
import { RegisterRoute } from './routes/red/account/register';
import { CreateApplicationRoute } from './routes/red/application/create';
import { CreateGroupRoute } from './routes/red/group/create';
import { PortalRoute } from './routes/static/portal';
import { BrontosaurusConfig, readConfigSync } from './util/conf';
import { registerConnor } from './util/error';

const setting: SudooExpressApplication = SudooExpressApplication.create('Brontosaurus', '1');

setting.allowCrossOrigin();

const app: SudooExpress = SudooExpress.create(setting);

const config: BrontosaurusConfig = readConfigSync();

registerConnor();
SudooLog.global.level(LOG_LEVEL.VERBOSE);

Mongoose.set('useCreateIndex', true);

Mongoose.connect(
    config.host + '/' + config.database,
    { useNewUrlParser: true },
);

const db: Mongoose.Connection = Mongoose.connection;
db.on('error', console.log.bind(console, 'connection error:'));

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({
    extended: true,
}));

app.route(new PortalRoute());

app.route(new RegisterRoute());
app.route(new RetrieveRoute());

app.route(new CreateApplicationRoute());
app.route(new CreateGroupRoute());
app.route(new AddGroupRoute());
app.route(new AccountValidateRoute());

app.host(8080);
console.log('hosting');
