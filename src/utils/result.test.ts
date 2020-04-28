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
    expect(r.apps.catalog.testName).toEqual(
      'User can navigate to the movie tunnel page 5, complete the fields, and navigate to page 6'
    )
    expect(r).toEqual([
      {
        jobId: '',
        apps: {
          catalog: {
            testName:
              'User can navigate to the movie tunnel page 5, complete the fields, and navigate to page 6',
            date: '2020-03-30T09:17:06',
            successed: 1,
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
        }
      }
    ])
  })
})
