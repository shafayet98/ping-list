import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as kms from "aws-cdk-lib/aws-kms";
import { Construct } from "constructs";

export class DataStack extends cdk.Stack {
  public readonly tableArn: string;
  public readonly tableName: string;
  public readonly smartsheetSecretArn: string;
  public readonly kmsKeyArn: string;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const key = new kms.Key(this, "PingListKey", {
      enableKeyRotation: true,
      description: "ping-list encryption key",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const table = new dynamodb.Table(this, "PingListTable", {
      tableName: "ping-list",
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryptionKey: key,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const smartsheetSecret = new secretsmanager.Secret(
      this,
      "SmartsheetSecret",
      {
        secretName: "ping-list/smartsheet-api-token",
        description: "Smartsheet API token for ping-list",
        encryptionKey: key,
      },
    );

    this.tableArn = table.tableArn;
    this.tableName = table.tableName;
    this.smartsheetSecretArn = smartsheetSecret.secretArn;
    this.kmsKeyArn = key.keyArn;

    new cdk.CfnOutput(this, "TableName", { value: table.tableName });
    new cdk.CfnOutput(this, "SmartsheetSecretArn", {
      value: smartsheetSecret.secretArn,
    });
    new cdk.CfnOutput(this, "KmsKeyArn", { value: key.keyArn });
  }
}
