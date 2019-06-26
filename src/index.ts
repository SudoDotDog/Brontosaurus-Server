/**
 * @author WMXPY
 * @namespace Brontosaurus_Server
 * @description Index
 */

import { connect } from '@brontosaurus/db';
import { SudooExpress, SudooExpressApplication } from '@sudoo/express';
import { LOG_LEVEL, SudooLog } from '@sudoo/log';
import * as Mongoose from "mongoose";
import * as Path from 'path';
import { ApplicationRoute } from './routes/portal/application';
import { LimboRoute } from './routes/portal/limbo';
import { RetrieveRoute } from './routes/portal/retrieve';
import { AccountValidateRoute } from './routes/portal/validate';
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

const db: Mongoose.Connection = connect(config.database);
db.on('error', console.log.bind(console, 'connection error:'));

// Static
app.static(Path.join(__dirname, '..', 'public', 'portal'));

// Health
app.health('/health');

// Portal
app.routes(
    new RetrieveRoute(),
    new LimboRoute(),
    new ApplicationRoute(),
    new AccountValidateRoute(),
);

app.host(8080);
SudooLog.global.critical('Hosting at 8080');
