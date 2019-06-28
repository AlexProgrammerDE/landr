/*
 * Copyright 2019 balena.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const fs = require('fs')
const markdown = require('markdown').markdown
const _ = require('lodash')
const path = require('path')
const PROJECT_DIRECTORY = path.resolve(__dirname, '..')

const fileExists = (file) => {
  try {
    fs.statSync(file)
    return true
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false
    }

    throw error
  }
}

const getInstallationSteps = (readme) => {
  const tree = _.tail(markdown.parse(readme))
  const startIndex = _.findIndex(tree, (node) => {
    return _.first(node) === 'header' && _.last(node) === 'Installation'
  })

  const header = tree[startIndex]
  const rest = tree.slice(startIndex + 1)
  const endIndex = _.findIndex(rest, (node) => {
    return _.first(node) === 'header' && node[1].level === header[1].level
  })

  const content = rest.slice(0, endIndex)
  // eslint-disable-next-line lodash/matches-prop-shorthand
  const listIndex = _.findIndex(content, (node) => {
    return node[0] === 'numberlist'
  })

  if (listIndex === -1) {
    return null
  }

  return {
    headers: [],
    steps: _.tail(content[listIndex]).map((node) => {
      return _.tail(node)
    }),
    footer: content.slice(listIndex + 1)
  }
}

const parseFAQ = (text) => {
  const tree = _.tail(markdown.parse(text))
  const result = []

  tree.forEach((node, index) => {
    if (node[0] === 'header') {
      result.push({
        title: _.last(node),
        content: tree[index + 1]
      })
    }
  })

  return result
}

const normalize = (file, jsonml) => {
  return jsonml.map((node) => {
    const content = _.last(node)

    if (node[0] === 'img') {
      Reflect.deleteProperty(node[1], 'alt')
      const imagePath = path.resolve(path.dirname(file), node[1].href)
      const base64 = Buffer.from(fs.readFileSync(imagePath)).toString('base64')
      node[1].href = `data:image/png;base64,${base64}`
    }

    if (Array.isArray(content)) {
      node[node.length - 1] = _.first(normalize(file, [ content ]))
    }

    return node
  })
}

const parseMarkdown = (file) => {
  const tree =
    normalize(path.join(PROJECT_DIRECTORY, file),
      _.tail(markdown.parse(fs.readFileSync(
        path.join(PROJECT_DIRECTORY, file), 'utf8'))))
  return {
    filename: file,
    mime: 'text/markdown',

    // eslint-disable-next-line lodash/matches-shorthand
    title: _.last(_.find(tree, (node) => {
      return node[0] === 'header' && node[1].level === 1
    })),

    data: tree
  }
}

console.log(JSON.stringify({
  slug: 'repository-balena-io-landr',
  type: 'repository',
  version: '1.0.0',
  markers: [],
  tags: [],
  links: {},
  active: true,
  data: {
    license: require(path.join(PROJECT_DIRECTORY, 'package.json')).license,
    name: require(path.join(PROJECT_DIRECTORY, 'package.json')).name,
    tagline: 'Repository + Landr = Website',
    images: {
      // Image at the top README
      banner: `data:image/png;base64,${Buffer.from(fs.readFileSync('./banner.png')).toString('base64')}`
    },
    description: require(path.join(PROJECT_DIRECTORY, 'package.json')).description,
    version: require(path.join(PROJECT_DIRECTORY, 'package.json')).version,

    // Using Detectorist
    type: 'npm',

    vcs: {
      type: 'git',
      branch: 'master'
    },
    links: {
      issueTracker: require(path.join(PROJECT_DIRECTORY, 'package.json')).bugs.url,
      homepage: 'https://www.balena.io/landr',
      repository: require(path.join(PROJECT_DIRECTORY, 'package.json')).repository.url
        .replace(/^git\+/, '')
        .replace(/\.git$/, '')
    },
    dns: {
      cname: fs.readFileSync(path.join(PROJECT_DIRECTORY, 'CNAME'), 'utf8')
        .replace(/\n/g, '')
    },
    maintainers: _.uniq(fs.readFileSync(path.join(PROJECT_DIRECTORY, 'CODEOWNERS'), 'utf8')
      .match(/@[\S]+/g)).map((name) => {
      return name.slice(1)
    }),

    security: parseMarkdown('SECURITY.md'),
    developers: {
      architecture: parseMarkdown('ARCHITECTURE.md'),
      guide: parseMarkdown('CONTRIBUTING.md'),
      codeOfConduct: parseMarkdown('CODE_OF_CONDUCT.md'),
      conventions: {
        editorconfig: fileExists(path.join(PROJECT_DIRECTORY, '.editorconfig'))
      }
    },

    docs: {
      latest: '1.0.0',
      tags: {
        '1.0.0': {
          users: {
            faq: parseFAQ(fs.readFileSync(path.join(PROJECT_DIRECTORY, 'FAQ.md'), 'utf8')),
            installation: getInstallationSteps(fs.readFileSync(path.join(PROJECT_DIRECTORY, 'README.md'), 'utf8'))
          },
          pages: [
            parseMarkdown('docs/cli.md')
          ],
          tutorials: [
            parseMarkdown('docs/guides/running-landr-in-ci.md')
          ]
        },
        '0.1.1': {
          users: {
            faq: parseFAQ(fs.readFileSync(path.join(PROJECT_DIRECTORY, 'FAQ.md'), 'utf8')),
            installation: getInstallationSteps(fs.readFileSync(path.join(PROJECT_DIRECTORY, 'README.md'), 'utf8'))
          },
          pages: [
            parseMarkdown('docs/cli.md')
          ],
          tutorials: [
            parseMarkdown('docs/guides/running-landr-in-ci.md')
          ]
        },
        '0.1.0': {
          users: {
            faq: parseFAQ(fs.readFileSync(path.join(PROJECT_DIRECTORY, 'FAQ.md'), 'utf8')),
            installation: getInstallationSteps(fs.readFileSync(path.join(PROJECT_DIRECTORY, 'README.md'), 'utf8'))
          },
          pages: [
            parseMarkdown('docs/cli.md')
          ],
          tutorials: [
            parseMarkdown('docs/guides/running-landr-in-ci.md')
          ]
        }
      }
    },

    github: {
      public: true,
      fork: false,
      stars: 41,
      usedBy: [
        {
          owner: 'balena-io',
          repo: 'etcher',
          description: 'Flash OS images to SD cards & USB drives, safely and easily'
        }
      ]
    },
    contributors: [
      {
        username: 'jviotti',
        avatar: 'https://avatars2.githubusercontent.com/u/2192773'
      },
      {
        username: 'lucianbuzzo',
        avatar: 'https://avatars2.githubusercontent.com/u/15064535'
      },
      {
        username: 'dimitrisnl',
        avatar: 'https://avatars2.githubusercontent.com/u/4951004'
      }
    ]
  }
}, null, 2))