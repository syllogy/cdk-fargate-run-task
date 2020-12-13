const { AwsCdkConstructLibrary } = require('projen');

const project = new AwsCdkConstructLibrary({
  authorAddress: 'pahudnet@gmail.com',
  authorName: 'Pahud',
  cdkVersion: '1.73.0',
  name: 'cdk-fargate-run-task',
  repository: 'https://github.com/pahudnet/cdk-fargate-run-task.git',
  cd

});

project.synth();
