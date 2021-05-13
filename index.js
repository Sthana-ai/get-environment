const core = require('@actions/core');
const github = require('@actions/github');

const action = async () => {
  try {
    const environment = core.getInput('environment', { required: true });
    const ciToken = core.getInput('ci-token', { required: true });
    const serviceName = core.getInput('service-name', { required: true });

    const octokit = github.getOctokit(ciToken);

    const serviceStatesRes = await octokit.repos.getContent({
      owner: 'Sthana-ai',
      repo: 'environments',
      path: `services/${environment}.json`,
      ref: 'refs/heads/master',
    });
    const serviceStates = JSON.parse(Buffer.from(serviceStatesRes.data.content, 'base64').toString());
    const serviceState = serviceStates.find((state) => state.name === serviceName);
    if (!serviceState) {
      core.setFailed(`service state not found for ${serviceName}`);
    }

    core.info(`version of ${serviceState.name} deployed in ${environment} is ${serviceState.version}`);
    core.setOutput('version', serviceState.version);
  } catch (error) {
    core.setFailed(error);
  }
};

action();
