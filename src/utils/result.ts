import xml2js from 'xml2js'
import { get } from 'lodash'

export interface ITestResultGroup {
  jobId: string
  apps: {
    [appName: string]: ITestResult
  }
}

export interface ITestResult {
  testName: string
  date: string
  succeeded: number
  failed: number
  file: string
  steps: IStep[]
  duration: number
}

export interface IStep {
  success: boolean
  name: string
  duration: number
  error?: string
}

export interface IUploadEntry {
  name: string
  content: string
}

const content = {
  testsuites: {
    attr: { name: 'Mocha Tests', time: '0', tests: '1', failures: '1' },
    testsuite: [
      {
        attr: {
          name: 'Root Suite',
          timestamp: '2020-03-30T09:18:22',
          tests: '0',
          file: 'src/integration/dashboard/movie-tunnel-end.spec.ts',
          failures: '0',
          time: '0'
        }
      },
      {
        attr: {
          name:
            'User can navigate to the movie tunnel, complete required fields, and send the movie',
          timestamp: '2020-03-30T09:18:22',
          tests: '1',
          failures: '1',
          time: '0'
        },
        testcase: [
          {
            attr: {
              name:
                'User can navigate to the movie tunnel, complete required fields, and send the movie Login into an existing account, navigate on movie tunnel, complete required fields, go on titles page, navigate to movie page',
              time: '0',
              classname:
                'Login into an existing account, navigate on movie tunnel, complete required fields, go on titles page, navigate to movie page'
            },
            failure: [
              {
                _:
                  "CypressError: Timed out retrying: Expected to find element: 'catalog-title-view catalog-title-details', but never found it.\n      at cypressErr (http://localhost:4200/__cypress/runner/cypress_runner.js:138036:9)\n      at throwErr (http://localhost:4200/__cypress/runner/cypress_runner.js:137969:11)\n      at Object.throwErrByPath (http://localhost:4200/__cypress/runner/cypress_runner.js:138017:3)\n      at retry (http://localhost:4200/__cypress/runner/cypress_runner.js:132299:19)\n      at onFailFn (http://localhost:4200/__cypress/runner/cypress_runner.js:120514:16)\n      at tryCatcher (http://localhost:4200/__cypress/runner/cypress_runner.js:164895:23)\n      at Promise._settlePromiseFromHandler (http://localhost:4200/__cypress/runner/cypress_runner.js:162831:31)\n      at Promise._settlePromise (http://localhost:4200/__cypress/runner/cypress_runner.js:162888:18)\n      at Promise._settlePromise0 (http://localhost:4200/__cypress/runner/cypress_runner.js:162933:10)\n      at Promise._settlePromises (http://localhost:4200/__cypress/runner/cypress_runner.js:163008:18)\n      at Async../node_modules/bluebird/js/release/async.js.Async._drainQueue (http://localhost:4200/__cypress/runner/cypress_runner.js:159620:16)\n      at Async../node_modules/bluebird/js/release/async.js.Async._drainQueues (http://localhost:4200/__cypress/runner/cypress_runner.js:159630:10)\n      at Async.drainQueues (http://localhost:4200/__cypress/runner/cypress_runner.js:159504:14)",
                attr: {
                  message:
                    "Timed out retrying: Expected to find element: 'catalog-title-view catalog-title-details', but never found it.",
                  type: 'CypressError'
                }
              }
            ]
          }
        ]
      }
    ]
  }
}

export async function parseXML(
  entries: IUploadEntry[]
): Promise<ITestResultGroup> {
  const apps: { [appName: string]: ITestResult } = {}
  await Promise.all(
    entries.map(async (entrie) => {
      const parser = new xml2js.Parser({ attrkey: 'attr' })
      const content = await parser.parseStringPromise(entrie.content)

      const suites = content.testsuites.testsuite
      const rootSuite = suites.filter(
        (x: any) => x.attr.name === 'Root Suite'
      )[0]
      const ourDescribes = suites.filter(
        (x: any) => x.attr.name !== 'Root Suite'
      )

      const fileName = rootSuite.attr.file

      const testsuite = ourDescribes[0]

      const steps = testsuite.testcase.map(
        (test: any): IStep => {
          const error = get(test, 'failure[0].attr.message', undefined)

          return {
            success: !error,
            name: test.attr.classname,
            duration: parseFloat(test.attr.time),
            ...(error ? { error } : {})
          }
        }
      )

      apps[entrie.name.split('-')[0]] = {
        file: fileName,
        testName: testsuite.attr.name,
        date: testsuite.attr.timestamp,
        succeeded:
          parseFloat(testsuite.attr.tests) -
          parseFloat(testsuite.attr.failures),
        failed: parseFloat(testsuite.attr.failures),
        duration: parseFloat(testsuite.attr.time),
        steps
      }
    })
  )
  return {
    jobId: '',
    apps
  }
}
