const core = require('@actions/core');
const github = require('@actions/github');

const action = async () => {
  try {
    const environment = core.getInput('environment', { required: true });
    const ciToken = core.getInput('ci-token', { required: true });
    const serviceName = core.getInput('service-name', { required: true });
    const sidecarServiceName = core.getInput('sidecar-service-name', { required: false });

    const octokit = github.getOctokit(ciToken);

    const serviceStatesRes = await octokit.repos.getContent({
      owner: 'Sthana-ai',
      repo: 'environments',
      path: `services/${environment}.json`,
      ref: 'refs/heads/master',
    });
    const serviceStates = JSON.parse(Buffer.from(serviceStatesRes.data.content, 'base64').toString());
    let serviceState = serviceStates.find((state) => state.name === serviceName);
    if (!serviceState) {
      core.setFailed(`service state not found for service with name ${serviceName}`);
    }

    if (sidecarServiceName) {
      serviceState = serviceStates.sidecars.find((state) => state.name === sidecarServiceName);
      if (!serviceState) {
        core.setFailed(`service state not found for sidecar with name ${sidecarServiceName}`);
      }
    }

    core.info(`version of ${sidecarServiceName ? `${sidecarServiceName}(sidecar of ${serviceName})` : serviceName} deployed in ${environment} is ${serviceState.version}`);
    core.setOutput('version', serviceState.version);
  } catch (error) {
    core.setFailed(error);
  }
};

action();
