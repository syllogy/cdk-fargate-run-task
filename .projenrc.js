const { AwsCdkConstructLibrary } = require('projen');

const AUTOMATION_TOKEN = 'AUTOMATION_GITHUB_TOKEN';

const project = new AwsCdkConstructLibrary({
  authorAddress: 'pahudnet@gmail.com',
  authorName: 'Pahud',
  cdkVersion: '1.73.0',
  name: 'cdk-fargate-run-task',
  releaseBranches: ['main'],
  description: 'Define and run container tasks on AWS Fargate immediately or with schedule',
  repository: 'https://github.com/pahud/cdk-fargate-run-task.git',
  cdkDependencies: [
    '@aws-cdk/core',
    '@aws-cdk/aws-ec2',
    '@aws-cdk/aws-ecs',
    '@aws-cdk/aws-events-targets',
    '@aws-cdk/aws-events',
    '@aws-cdk/aws-logs',
    '@aws-cdk/custom-resources',
  ],
  catalog: {
    announce: false,
    twitter: 'pahudnet',
  },
  python: {
    distName: 'cdk-fargate-run-task',
    module: 'cdk_fargate_run_task',
  },
  dependabot: false,
  // upgrade every Sunday 6AM
  projenUpgradeSchedule: ['0 6 * * 0'],
  keywords: [
    'cdk',
    'fargate',
    'task',
    'ecs',
    'aws',
  ]

});


// create a custom projen and yarn upgrade workflow
const workflow = project.github.addWorkflow('ProjenYarnUpgrade');

workflow.on({
  schedule: [{
    cron: '11 0 * * *'
  }], // 0:11am every day
  workflow_dispatch: {}, // allow manual triggering
});

workflow.addJobs({
  upgrade: {
    'runs-on': 'ubuntu-latest',
    'steps': [
      { uses: 'actions/checkout@v2' },
      { 
        uses: 'actions/setup-node@v1',
        with: {
          'node-version': '10.17.0',
        }
      },
      { run: `yarn upgrade` },
      { run: `yarn projen:upgrade` },
      // submit a PR
      {
        name: 'Create Pull Request',
        uses: 'peter-evans/create-pull-request@v3',
        with: {
          'token': '${{ secrets.' + AUTOMATION_TOKEN + ' }}',
          'commit-message': 'chore: upgrade projen',
          'branch': 'auto/projen-upgrade',
          'title': 'chore: upgrade projen and yarn',
          'body': 'This PR upgrades projen and yarn upgrade to the latest version',
          'labels': 'auto-merge',
        }
      },
    ],
  },
});

const common_exclude = ['cdk.out', 'cdk.context.json', 'images', 'yarn-error.log'];
project.npmignore.exclude(...common_exclude);
project.gitignore.exclude(...common_exclude);

project.synth();
