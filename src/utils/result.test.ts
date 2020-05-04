import { parseXML } from './result'

const ENTRY_1 = {
  name: 'catalog-1b8de0132eb2f1a2eb1ad711d8e3f480.xml',
  content: `
<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="Mocha Tests" time="24.86" tests="1" failures="0">
  <testsuite name="Root Suite" timestamp="2020-03-30T09:17:06" tests="0" file="src/integration/dashboard/movie-tunnel-4.spec.ts" failures="0" time="0">
  </testsuite>
  <testsuite name="User can navigate to the movie tunnel page 5, complete the fields, and navigate to page 6" timestamp="2020-03-30T09:17:06" tests="1" failures="0" time="24.86">
    <testcase name="User can navigate to the movie tunnel page 5, complete the fields, and navigate to page 6 Login into an existing account, navigate on budget page, complete budget and quotas fields, go on movie tunnel page 6" time="24.86" classname="Login into an existing account, navigate on budget page, complete budget and quotas fields, go on movie tunnel page 6">
    </testcase>
  </testsuite>
</testsuites>`
}

const ENTRY_2 = {
  name: 'catalog-4b1ce86199c62c265447c5458d03aee4.xml',
  content: `<?xml version="1.0" encoding="UTF-8"?>
  <testsuites name="Mocha Tests" time="0" tests="1" failures="1">
    <testsuite name="Root Suite" timestamp="2020-03-30T09:18:22" tests="0" file="src/integration/dashboard/movie-tunnel-end.spec.ts" failures="0" time="0">
    </testsuite>
    <testsuite name="User can navigate to the movie tunnel, complete required fields, and send the movie" timestamp="2020-03-30T09:18:22" tests="1" failures="1" time="0">
      <testcase name="User can navigate to the movie tunnel, complete required fields, and send the movie Login into an existing account, navigate on movie tunnel, complete required fields, go on titles page, navigate to movie page" time="0" classname="Login into an existing account, navigate on movie tunnel, complete required fields, go on titles page, navigate to movie page">
        <failure message="Timed out retrying: Expected to find element: &apos;catalog-title-view catalog-title-details&apos;, but never found it." type="CypressError"><![CDATA[CypressError: Timed out retrying: Expected to find element: 'catalog-title-view catalog-title-details', but never found it.
      at cypressErr (http://localhost:4200/__cypress/runner/cypress_runner.js:138036:9)
      at throwErr (http://localhost:4200/__cypress/runner/cypress_runner.js:137969:11)
      at Object.throwErrByPath (http://localhost:4200/__cypress/runner/cypress_runner.js:138017:3)
      at retry (http://localhost:4200/__cypress/runner/cypress_runner.js:132299:19)
      at onFailFn (http://localhost:4200/__cypress/runner/cypress_runner.js:120514:16)
      at tryCatcher (http://localhost:4200/__cypress/runner/cypress_runner.js:164895:23)
      at Promise._settlePromiseFromHandler (http://localhost:4200/__cypress/runner/cypress_runner.js:162831:31)
      at Promise._settlePromise (http://localhost:4200/__cypress/runner/cypress_runner.js:162888:18)
      at Promise._settlePromise0 (http://localhost:4200/__cypress/runner/cypress_runner.js:162933:10)
      at Promise._settlePromises (http://localhost:4200/__cypress/runner/cypress_runner.js:163008:18)
      at Async../node_modules/bluebird/js/release/async.js.Async._drainQueue (http://localhost:4200/__cypress/runner/cypress_runner.js:159620:16)
      at Async../node_modules/bluebird/js/release/async.js.Async._drainQueues (http://localhost:4200/__cypress/runner/cypress_runner.js:159630:10)
      at Async.drainQueues (http://localhost:4200/__cypress/runner/cypress_runner.js:159504:14)]]></failure>
      </testcase>
    </testsuite>
  </testsuites>`
}

describe('Parse an array of xml to ITestResultGroup', () => {
  it('Return an empty array', async () => {
    const r = await parseXML([])
    expect(r).toEqual({
      jobId: '',
      apps: {}
    })
  })

  it('Return an ITestResultGroup', async () => {
    const r = await parseXML([ENTRY_1])
    expect(r.apps.catalog).toBeTruthy()
    expect(r.apps.catalog[0].testName).toEqual(
      'User can navigate to the movie tunnel page 5, complete the fields, and navigate to page 6'
    )
    expect(r).toEqual({
      jobId: '',
      apps: {
        catalog: [
          {
            testName:
              'User can navigate to the movie tunnel page 5, complete the fields, and navigate to page 6',
            date: '2020-03-30T09:17:06',
            succeeded: 1,
            failed: 0,
            file: 'src/integration/dashboard/movie-tunnel-4.spec.ts',
            steps: [
              {
                success: true,
                name:
                  'Login into an existing account, navigate on budget page, complete budget and quotas fields, go on movie tunnel page 6',
                duration: 24.86
              }
            ],
            duration: 24.86
          }
        ]
      }
    })
  })

  it('Return an ITestResultGroup with error', async () => {
    const r = await parseXML([ENTRY_2])

    expect(r).toEqual({
      jobId: '',
      apps: {
        catalog: [
          {
            testName:
              'User can navigate to the movie tunnel, complete required fields, and send the movie',
            date: '2020-03-30T09:18:22',
            succeeded: 0,
            failed: 1,
            file: 'src/integration/dashboard/movie-tunnel-end.spec.ts',
            steps: [
              {
                success: false,
                name:
                  'Login into an existing account, navigate on movie tunnel, complete required fields, go on titles page, navigate to movie page',
                duration: 0,
                error:
                  "Timed out retrying: Expected to find element: 'catalog-title-view catalog-title-details', but never found it."
              }
            ],
            duration: 0
          }
        ]
      }
    })
  })

  it('Return an ITestResultGroup with 2 entries', async () => {
    const r = await parseXML([ENTRY_1, ENTRY_2])

    expect(r).toEqual({
      jobId: '',
      apps: {
        catalog: [
          {
            testName:
              'User can navigate to the movie tunnel page 5, complete the fields, and navigate to page 6',
            date: '2020-03-30T09:17:06',
            succeeded: 1,
            failed: 0,
            file: 'src/integration/dashboard/movie-tunnel-4.spec.ts',
            steps: [
              {
                success: true,
                name:
                  'Login into an existing account, navigate on budget page, complete budget and quotas fields, go on movie tunnel page 6',
                duration: 24.86
              }
            ],
            duration: 24.86
          },
          {
            testName:
              'User can navigate to the movie tunnel, complete required fields, and send the movie',
            date: '2020-03-30T09:18:22',
            succeeded: 0,
            failed: 1,
            file: 'src/integration/dashboard/movie-tunnel-end.spec.ts',
            steps: [
              {
                success: false,
                name:
                  'Login into an existing account, navigate on movie tunnel, complete required fields, go on titles page, navigate to movie page',
                duration: 0,
                error:
                  "Timed out retrying: Expected to find element: 'catalog-title-view catalog-title-details', but never found it."
              }
            ],
            duration: 0
          }
        ]
      }
    })
  })
})
