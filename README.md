[![NPM version](https://badge.fury.io/js/cdk-fargate-run-task.svg)](https://badge.fury.io/js/cdk-fargate-run-task)
[![PyPI version](https://badge.fury.io/py/cdk-fargate-run-task.svg)](https://badge.fury.io/py/cdk-fargate-run-task)
![Release](https://github.com/pahud/cdk-fargate-run-task/workflows/Release/badge.svg)

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
