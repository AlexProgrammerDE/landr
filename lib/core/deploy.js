const Promise = require('bluebird')
const ghpages = Promise.promisifyAll(require('gh-pages'));

module.exports = async (distDir, remoteUrl) => {
  console.log(
    distDir,
    remoteUrl
  )
  return ghpages.publishAsync(distDir, {
    message: 'Deployed by landr 🏠',
    branch: 'gh-pages',
    repo: remoteUrl
  });
}
