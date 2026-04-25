import * as cdk from "aws-cdk-lib";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

interface ApiStackProps extends cdk.StackProps {
  tableArn: string;
  tableName: string;
  smartsheetSecretArn: string;
}

export class ApiStack extends cdk.Stack {
  public readonly ecrRepoUri: string;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // ECR repo — image will be pushed here by CI/CD in Phase 4
    const repo = new ecr.Repository(this, "ApiRepo", {
      repositoryName: "ping-list-api",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      emptyOnDelete: true,
    });

    // IAM role for App Runner (created now, wired to App Runner in Phase 4)
    const instanceRole = new iam.Role(this, "AppRunnerInstanceRole", {
      assumedBy: new iam.ServicePrincipal("tasks.apprunner.amazonaws.com"),
    });

    // Grant permissions to DynamoDB and Secrets Manager
    instanceRole.addToPolicy(
      new iam.PolicyStatement({
        actions: [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan",
        ],
        resources: [props.tableArn],
      }),
    );

    instanceRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["secretsmanager:GetSecretValue"],
        resources: [props.smartsheetSecretArn],
      }),
    );

    // IAM role for App Runner to pull from ECR
    const accessRole = new iam.Role(this, "AppRunnerAccessRole", {
      assumedBy: new iam.ServicePrincipal("build.apprunner.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSAppRunnerServicePolicyForECRAccess",
        ),
      ],
    });

    this.ecrRepoUri = repo.repositoryUri;

    new cdk.CfnOutput(this, "EcrRepoUri", { value: repo.repositoryUri });
    new cdk.CfnOutput(this, "InstanceRoleArn", { value: instanceRole.roleArn });
    new cdk.CfnOutput(this, "AccessRoleArn", { value: accessRole.roleArn });
  }
}
