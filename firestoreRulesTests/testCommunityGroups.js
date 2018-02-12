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
           match /communityGroups/{id} {
            allow update: if isLeader();
            // Data validation for required fields
            allow write: if request.resource.data.keys().hasAll(['name', 'type', 'gender'])
                         && request.resource.data.name is string
                         && request.resource.data.type is string
                         && request.resource.data.gender is string
                         && (request.resource.data.type == 'Freshmen' || request.resource.data.type == 'Sophomore'
                            || request.resource.data.type == 'Junior' || request.resource.data.type == 'Senior'
                            || request.resource.data.type == 'Graduate' || request.resource.data.type == 'Faculty'
                            || request.resource.data.type == 'Mixed Ages' || request.resource.data.type == 'Mixed Sexes')
                         && (request.resource.data.gender == 'Male' || request.resource.data.gender == 'Female'
                            || request.resource.data.gender == 'Other')
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
                                    type: "Graduate",
                                    gender: "Female"
                                }
                            },
                            path: "/databases/(default)/documents/communityGroups/123",
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
                                    name: "name",
                                    type: "blah",
                                    gender: "Female"
                                }
                            },
                            path: "/databases/(default)/documents/communityGroups/123",
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

    console.log('\nTest results for '.concat(projectId, ', communityGroups collection validation rules:\n'));
    testResults.forEach(function (testResult) {
        return console.log(testResult.toString());
    });
}
