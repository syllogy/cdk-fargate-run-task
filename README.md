[![NPM version](https://badge.fury.io/js/cdk-fargate-run-task.svg)](https://badge.fury.io/js/cdk-fargate-run-task)
[![PyPI version](https://badge.fury.io/py/cdk-fargate-run-task.svg)](https://badge.fury.io/py/cdk-fargate-run-task)
![Release](https://github.com/pahud/cdk-fargate-run-task/workflows/Release/badge.svg?branch=main)

# cdk-fargate-run-task

Define and run container tasks on AWS Fargate at once or by schedule.

# sample

```ts
const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const stack = new cdk.Stack(app, 'run-task-demo-stack', { env });

// define your task
const task = new ecs.FargateTaskDefinition(stack, 'Task', { cpu: 256, memoryLimitMiB: 512 });

// add contianer into the task
task.addContainer('Ping', {
  image: ecs.ContainerImage.fromRegistry('busybox'),
  command: [
    'sh', '-c',
    'ping -c 3 google.com',
  ],
  logging: new ecs.AwsLogDriver({
    streamPrefix: 'Ping',
    logGroup: new LogGroup(stack, 'LogGroup', {
      logGroupName: `${stack.stackName}LogGroup`,
      retention: RetentionDays.ONE_DAY,
    }),
  }),
});

// deploy and run this task once
const runTaskAtOnce = new RunTask(stack, 'RunDemoTaskOnce', { task });

// or run it with schedule(every hour 0min)
new RunTask(stack, 'RunDemoTaskEveryHour', {
  task,
  cluster: runTaskAtOnce.cluster,
  runOnce: false,
  schedule: Schedule.cron({ minute: '0' }),
});

```

# ECS Anywhere 

[Amazon ECS Anywhere](https://aws.amazon.com/ecs/anywhere/) allows you to run ECS tasks on external instances. To run external task once or on schedule:


```ts
const externalTask = new ecs.TaskDefinition(stack, 'ExternalTask', {
  cpu: '256',
  memoryMiB: '512',
  compatibility: ecs.Compatibility.EXTERNAL,
});

externalTask.addContainer('ExternalPing', {
  image: ecs.ContainerImage.fromRegistry('busybox'),
  command: [
    'sh', '-c',
    'ping -c 3 google.com',
  ],
  logging: new ecs.AwsLogDriver({
    streamPrefix: 'Ping',
    logGroup: new LogGroup(stack, 'ExternalLogGroup', {
      retention: RetentionDays.ONE_DAY,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    }),
  }),
});

// run it once on external instance
new RunTask(stack, 'RunDemoTaskFromExternal', {
  task: externalTask,
  cluster: existingCluster,
  launchType: LaunchType.EXTERNAL,
});

// run it by schedule  on external instance
new RunTask(stack, 'RunDemoTaskFromExternalSchedule', {
  task: externalTask,
  cluster: existingCluster,
  launchType: LaunchType.EXTERNAL,
  runAtOnce: false,
  schedule: Schedule.cron({ minute: '0' }),
});
```

Please note when you run task in `EXTERNAL` launch type, no fargate tasks will be scheduled. You will be responsible to register the external instances to your ECS cluster. See [Registering an external instance to a cluster](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-anywhere-registration.html) for more details.
