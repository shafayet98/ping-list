#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { DataStack } from "../lib/data-stack";
import { ApiStack } from "../lib/api-stack";
import { WebStack } from "../lib/web-stack";

const app = new cdk.App();

const env = {
  account: "390843337949",
  region: "ap-southeast-2",
};

const dataStack = new DataStack(app, "PingListDataStack", { env });

new ApiStack(app, "PingListApiStack", {
  env,
  tableArn: dataStack.tableArn,
  tableName: dataStack.tableName,
  smartsheetSecretArn: dataStack.smartsheetSecretArn,
  kmsKeyArn: dataStack.kmsKeyArn,
});

new WebStack(app, "PingListWebStack", { env });
