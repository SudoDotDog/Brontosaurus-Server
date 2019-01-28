/**
 * @author WMXPY
 * @namespace Brontosaurus_Server
 * @description Index
 */

import { SudooExpress, SudooExpressApplication } from '@sudoo/express';
import { LOG_LEVEL, SudooLog } from '@sudoo/log';
import * as Mongoose from "mongoose";
import * as Path from 'path';
import { ApplicationRoute } from './routes/portal/application';
import { RetrieveRoute } from './routes/portal/retrieve';
import { AccountValidateRoute } from './routes/portal/validate';
import { AddGroupRoute } from './routes/red/account/add-group';
import { AdminEditRoute } from './routes/red/account/admin-edit';
import { FetchAccountRoute } from './routes/red/account/fetch';
import { RegisterRoute } from './routes/red/account/register';
import { SelfEditRoute } from './routes/red/account/self-edit';
import { SingleAccountRoute } from './routes/red/account/single';
import { CreateApplicationRoute } from './routes/red/application/create';
import { FetchApplicationRoute } from './routes/red/application/fetch';
import { SingleApplicationRoute } from './routes/red/application/single';
import { CreateGroupRoute } from './routes/red/group/create';
import { FetchGroupRoute } from './routes/red/group/fetch';
import { GlobalPreferenceRoute } from './routes/red/preference/global';
import { InfosPreferenceRoute } from './routes/red/preference/infos';
import { ReadPreferenceRoute } from './routes/red/preference/read';
import { BrontosaurusConfig, isDevelopment, readConfigEnvironment } from './util/conf';
import { registerConnor } from './util/error';

const setting: SudooExpressApplication = SudooExpressApplication.create('Brontosaurus', '1');

if (isDevelopment()) {
    setting.allowCrossOrigin();
    SudooLog.global.level(LOG_LEVEL.VERBOSE);
} else {
    SudooLog.global.level(LOG_LEVEL.INFO);
}

const app: SudooExpress = SudooExpress.create(setting);

const config: BrontosaurusConfig = readConfigEnvironment();

registerConnor();

Mongoose.set('useCreateIndex', true);

Mongoose.connect(
    config.database,
    { useNewUrlParser: true },
);

const db: Mongoose.Connection = Mongoose.connection;
db.on('error', console.log.bind(console, 'connection error:'));

// Static
app.static(Path.join(__dirname, '..', 'public', 'portal'));

// Portal
app.routes(
    new RetrieveRoute(),
    new ApplicationRoute(),
    new AccountValidateRoute(),
);

// Red
app.routes(

    // Application
    new CreateApplicationRoute(),
    new FetchApplicationRoute(),
    new SingleApplicationRoute(),

    // Group
    new CreateGroupRoute(),
    new FetchGroupRoute(),

    // Account
    new AddGroupRoute(),
    new FetchAccountRoute(),
    new RegisterRoute(),
    new SelfEditRoute(),
    new AdminEditRoute(),
    new SingleAccountRoute(),

    // Preference
    new GlobalPreferenceRoute(),
    new ReadPreferenceRoute(),
    new InfosPreferenceRoute(),
);

app.host(8080);
console.log('hosting');
