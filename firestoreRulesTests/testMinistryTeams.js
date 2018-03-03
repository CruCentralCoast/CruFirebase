var testSecurityRules = require('firestore-security-tests').testSecurityRules;
var testResourceObj = {
    source: {
        files: [
            {
                name: "firestore.rules",
                content: `service cloud.firestore {
        match /databases/{database}/documents {
          function isAdmin() {
                return get(/databases/$(database)/documents/permissionGroups/admin).data[request.auth.uid];
           }
           match /ministryTeams/{id} {
            // Data validation for required fields
            allow write: if request.resource.data.keys().hasAll(['name', 'parentMinistry'])
                         && request.resource.data.name is string
                         && request.resource.data.parentMinistry is string
                         && isAdmin();
          }
        }
      }`
            }
        ]
    },

    testSuite:
        {
            testCases:
                [
                    {
                        expectation: "ALLOW",
                        request: {
                            auth: {
                                uid: "u9tmYPjSW2gDJdGhLiO5pq1pGQV2"    //Example user who has admin permissions
                            },
                            resource: {
                                data: {
                                    name: "name",
                                    parentMinistry: "Epic"
                                }
                            },
                            path: "/databases/(default)/documents/ministryTeams/123",
                            method: "write"
                        },
                        functionMocks: [
                            {
                                function: "get",
                                args: [{ exact_value: "/databases/(default)/documents/permissionGroups/admin" }],
                                result: { value: { data: { u9tmYPjSW2gDJdGhLiO5pq1pGQV2: true } } }
                            }]
                    },
                    {
                        expectation: "DENY",
                        request: {
                            auth: {
                                uid: "u9tmYPjSW2gDJdGhLiO5pq1pGQV2"    //Example user who has admin permissions
                            },
                            resource: {
                                data: {
                                    name: "name"
                                }
                            },
                            path: "/databases/(default)/documents/ministryTeams/123",
                            method: "write"
                        },
                        functionMocks: [
                            {
                                function: "get",
                                args: [{ exact_value: "/databases/(default)/documents/permissionGroups/admin" }],
                                result: { value: { data: { u9tmYPjSW2gDJdGhLiO5pq1pGQV2: true } } }
                            }]
                    }
                ]
        }
};

testSecurityRules(printResults, testResourceObj, { verbose: true });

function printResults(resultsObj) {
    var projectId = resultsObj.projectId,
        testResults = resultsObj.testResults,
        error = resultsObj.error,
        errMsg = resultsObj.errMsg;

    if (error) {
        return console.error('\n\ntestSecurityRules ERRORED:\n\n', errMsg, error);
    }

    console.log('\nTest results for '.concat(projectId, ', ministryTeams collection validation rules:\n'));
    testResults.forEach(function (testResult) {
        return console.log(testResult.toString());
    });
}
