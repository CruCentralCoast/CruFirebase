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
           match /events/{id} {
            // Data validation for required fields
            allow write: if request.resource.data.keys().hasAll(['name', 'startDate', 'endDate', 'permissionGroups'])
                         && request.resource.data.name is string
                         && request.resource.data.startDate is timestamp
                         && request.resource.data.endDate is timestamp
                         && request.resource.data.name.size() <= 35
                         && request.resource.data.permissionGroups is list
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
                                    startDate: "0001-01-01T00:00:00.511Z",
                                    endDate: "0001-01-01T00:00:00.511Z",
                                    permissionGroups: ["group1", "group2"]
                                }
                            },
                            path: "/databases/(default)/documents/events/123",
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
                                    name: "this string is going to be longer than 35 characters, causing the validation to fail",
                                    startDate: "0001-01-01T00:00:00.511Z",
                                    endDate: "0001-01-01T00:00:00.511Z"
                                }
                            },
                            path: "/databases/(default)/documents/events/123",
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

    console.log('\nTest results for '.concat(projectId, ', events collection validation rules:\n'));
    testResults.forEach(function (testResult) {
        return console.log(testResult.toString());
    });
}
