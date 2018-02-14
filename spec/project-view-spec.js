const {it, fit, ffit, fffit, beforeEach, afterEach, conditionPromise} = require('./async-spec-helpers')
const fs = require('fs')
const path = require('path')
const temp = require('temp').track()
const ProjectView = require('../lib/project-view')

describe('ProjectView', () => {
  beforeEach(() => {
    jasmine.useRealClock()
  })

  it('includes remote editors when teletype is enabled', async () => {
    const projectView = new ProjectView()

    const projectPath = fs.realpathSync(temp.mkdirSync())
    const file1Path = path.join(projectPath, 'a')
    fs.writeFileSync(file1Path, 'a')
    const file2Path = path.join(projectPath, 'b')
    fs.writeFileSync(file2Path, 'b')
    atom.project.setPaths([projectPath])

    projectView.setTeletypeService({
      async getRemoteEditors () {
        return [
          {uri: 'remote1-uri', path: 'remote1-path', hostGitHubUsername: 'user-1'},
          {uri: 'remote2-uri', path: 'remote2-path', hostGitHubUsername: 'user-2'}
        ]
      }
    })

    projectView.toggle()
    await conditionPromise(() => projectView.items.length === 4)
    expect(projectView.items).toEqual([
      {uri: 'remote1-uri', filePath: 'remote1-path', label: '@user-1: remote1-path', ownerGitHubUsername: 'user-1'},
      {uri: 'remote2-uri', filePath: 'remote2-path', label: '@user-2: remote2-path', ownerGitHubUsername: 'user-2'},
      {uri: file1Path, filePath: file1Path, label: 'a'},
      {uri: file2Path, filePath: file2Path, label: 'b'}
    ])
  })
})
