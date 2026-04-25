import * as cdk from "aws-cdk-lib";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as iam from "aws-cdk-lib/aws-iam";
import * as logs from "aws-cdk-lib/aws-logs";
import * as kms from "aws-cdk-lib/aws-kms";
import { Construct } from "constructs";

interface ApiStackProps extends cdk.StackProps {
  tableArn: string;
  tableName: string;
  smartsheetSecretArn: string;
  kmsKeyArn: string;
}

export class ApiStack extends cdk.Stack {
  public readonly ecrRepoUri: string;
  public readonly loadBalancerDns: string;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // ECR repo
    const repo = new ecr.Repository(this, "ApiRepo", {
      repositoryName: "ping-list-api",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      emptyOnDelete: true,
    });

    // VPC
    const vpc = new ec2.Vpc(this, "ApiVpc", {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "Public",
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    // ECS Cluster
    const cluster = new ecs.Cluster(this, "ApiCluster", {
      vpc,
      clusterName: "ping-list",
    });

    // Task execution role
    const executionRole = new iam.Role(this, "TaskExecutionRole", {
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AmazonECSTaskExecutionRolePolicy",
        ),
      ],
    });

    // Task role (what the running container can do)
    const taskRole = new iam.Role(this, "TaskRole", {
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
    });

    taskRole.addToPolicy(
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

    taskRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["secretsmanager:GetSecretValue"],
        resources: [props.smartsheetSecretArn],
      }),
    );

    // Allow execution role to read secrets for env injection
    executionRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["secretsmanager:GetSecretValue"],
        resources: [props.smartsheetSecretArn],
      }),
    );

    // Grant execution role KMS decrypt access to read the encrypted secret
    const kmsKey = kms.Key.fromKeyArn(this, "ImportedKmsKey", props.kmsKeyArn);
    kmsKey.grantDecrypt(executionRole);

    // CloudWatch log group
    const logGroup = new logs.LogGroup(this, "ApiLogGroup", {
      logGroupName: "/ping-list/api",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      retention: logs.RetentionDays.ONE_WEEK,
    });

    // Task definition
    const taskDef = new ecs.FargateTaskDefinition(this, "ApiTaskDef", {
      memoryLimitMiB: 512,
      cpu: 256,
      executionRole,
      taskRole,
    });

    const importedSecret = cdk.aws_secretsmanager.Secret.fromSecretCompleteArn(
      this,
      "ImportedSecret",
      props.smartsheetSecretArn,
    );

    taskDef.addContainer("ApiContainer", {
      image: ecs.ContainerImage.fromEcrRepository(repo, "latest"),
      portMappings: [{ containerPort: 3000 }],
      environment: {
        NODE_ENV: "production",
      },
      secrets: {
        SMARTSHEET_API_TOKEN: ecs.Secret.fromSecretsManager(
          importedSecret,
          "apiToken",
        ),
        SMARTSHEET_SHEET_ID: ecs.Secret.fromSecretsManager(
          importedSecret,
          "sheetId",
        ),
      },
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: "api",
        logGroup,
      }),
    });

    // Security group for the service
    const serviceSg = new ec2.SecurityGroup(this, "ServiceSg", {
      vpc,
      allowAllOutbound: true,
    });

    // ALB security group
    const albSg = new ec2.SecurityGroup(this, "AlbSg", {
      vpc,
      allowAllOutbound: true,
    });
    albSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), "Allow HTTP");
    serviceSg.addIngressRule(albSg, ec2.Port.tcp(3000), "Allow from ALB");

    // Application Load Balancer
    const alb = new elbv2.ApplicationLoadBalancer(this, "ApiAlb", {
      vpc,
      internetFacing: true,
      securityGroup: albSg,
    });

    const listener = alb.addListener("ApiListener", { port: 80 });

    // ECS Fargate Service
    const service = new ecs.FargateService(this, "ApiService", {
      cluster,
      taskDefinition: taskDef,
      serviceName: "ping-list-api",
      desiredCount: 1,
      assignPublicIp: true,
      securityGroups: [serviceSg],
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
    });

    listener.addTargets("ApiTarget", {
      port: 3000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targets: [service],
      healthCheck: {
        path: "/health",
        interval: cdk.Duration.seconds(30),
      },
    });

    this.ecrRepoUri = repo.repositoryUri;
    this.loadBalancerDns = alb.loadBalancerDnsName;

    new cdk.CfnOutput(this, "EcrRepoUri", { value: repo.repositoryUri });
    new cdk.CfnOutput(this, "ApiUrl", {
      value: `http://${alb.loadBalancerDnsName}`,
    });
  }
}
