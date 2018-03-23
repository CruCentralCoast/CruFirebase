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
           match /passengers/{id} {	
            // Data validation for required fields	
            allow write: if request.resource.data.keys().hasAll(['name', 'phone', 'direction', 'event'])	
                         && request.resource.data.name is string	
                         && request.resource.data.phone is string	
                         && request.resource.data.direction is string	
                         && request.resource.data.event is path	
                         && (request.resource.data.direction == 'to' || request.resource.data.direction == 'from'	
                            || request.resource.data.direction == 'both')	
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
                  name: "test_name",
                  phone: "11111111111",
                  direction: "both",
                  event: "/databases/(default)/documents/events/321"
                }
              },
              path: "/databases/(default)/documents/passengers/123",
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
                    name: "test_name",
                    phone: "11111111111",
                    direction: "invalid",
                    event: "test_event"
                }
              },
              path: "/databases/(default)/documents/passengers/123",
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

  console.log('\nTest results for '.concat(projectId, ', passengers collection validation rules:\n'));
  testResults.forEach(function (testResult) {
    return console.log(testResult.toString());
  });
}
