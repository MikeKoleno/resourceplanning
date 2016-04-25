'use strict';
console.log('Loading function');

let doc = require('aws-sdk');
let http = require('http');
let dynamo = new doc.DynamoDB({
    apiVersion: '2012-08-10',
    region: 'us-west-1',
    accessKeyId: 'AKIAI4NOZEHA2Z6LQNHQ',
    secretAccessKey: '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'
});
let mentorParser = require('./mentorParser');

let contractors = [];

var setRoles = (role, title) => {
    var roles = [];
    switch (role) {
        case "Sales":
            roles = ["1"];
            break;
        case "Functional":
            if (title === 'Director') {
                roles = ["1", "2", "3", "4", "5", "6"];
            } else if (title === 'Senior Consultant' || title === 'Principal') {
                roles = ["2", "3", "5", "6"];
            } else {
                roles = ["5", "6"];
            }
            break;
        case "Technical":
            if (title === 'Analyst' || title === "Intern") {
                roles = ["9"];
            } else if (title === 'Consultant') {
                roles = ["8", "9"];
            } else if (title === 'Senior Consultant' || title === 'Principal') {
                roles = ["7", "8", "9"];
            } else if (title === 'Director') {
                roles = ["1", "2", "7", "8", "9"];
            }
            break;
        case "Designer":
            roles = ["11"];
            break;
        case "Researcher":
            roles = ["12"];
            break;
        case "QA":
            roles = ["13"];
            break;
        case "Executive":
            roles = ["14"];
            break;
        case "EX":
            roles = ["15"];
            break;
        case "Finance":
            roles = ["16"];
            break;
        case "Marketing":
            roles = ["17"];
            break;
        case "IT":
            roles = ["18"];
            break;
    }
    return roles;
};

var fetchEmployee = (email) => {
    http.get("http://smartoffice.solstice-innovation.com/person/" + email + "?AuthType=Guest&AuthKey=busybird641@gmail.com/8182", function (res) {
        var eachEmployeeDataStr = '';
        res.on('data', function (data) {
            eachEmployeeDataStr += data;
        });

        res.on('end', function () {
            var employee = JSON.parse(eachEmployeeDataStr);

            if (employee.email) {
                addRecord(employee);
                addRoles(employee);
                addMentor(employee);
            }
        });
    });
};

var addMentor = (employee) => {
    var mentor = mentorParser.fetchMentor(employee.email);
    if (mentor === null) {
        console.log("Email Missed: ", employee.email);
        return ;
    }
    var params = {
        TableName: 'mentor',
        Item: {
            email: {
                S: employee.email
            },
            mentorEmail: {
                S: mentor[4]
            },
            mentorFirstName: {
                S: mentor[5]
            },
            mentorLastName: {
                S: mentor[6]
            }
        }
    };

    dynamo.putItem(params, function (error, data) {
        // if (error) console.log("Mentor Add Failed");
        // else console.log("Success");
    });
};

var addRecord = (employee) => {
    var skills = [],
        interests = [],
        pastProjects = [];

    var tempSkills = (employee.specialization) ? employee.specialization.split(',') : [];
    for (var skillIndex in tempSkills) {
        if (tempSkills[skillIndex].trim() !== '') {
            skills.push({ S: tempSkills[skillIndex].trim() });
        }
    }

    var tempInterests = (employee.personalInterests) ? employee.personalInterests.split(',') : [];
    for (var interestIndex in tempInterests) {
        if (tempInterests[interestIndex].trim() !== '') {
            interests.push({ S: tempInterests[interestIndex].trim() });
        }
    }

    var tempPastProjs = (employee.pastProjects) ? employee.pastProjects.split(',') : [];
    for (var pastProjIndex in tempPastProjs) {
        if (tempPastProjs[pastProjIndex].trim() !== '') {
            pastProjects.push({ S: tempPastProjs[pastProjIndex].trim() });
        }
    }

    var params = {
        TableName: 'employee',
        Item: {
            email: {
                S: employee.email
            },
            firstName: {
                S: employee.firstName
            },
            lastName: {
                S: employee.lastName
            },
            active: {
                BOOL: true
            },
            contractor: {
                BOOL: false
            }
        }
    };
    if (employee.office !== null) {
        params.Item['location'] = {
            S: employee.office
        }
    }
    if (skills.length > 0) {
        params.Item['skills'] = {
            L: skills
        }
    }
    if (interests.length > 0) {
        params.Item['interests'] = {
            L: interests
        }
    }

    if (pastProjects.length > 0) {
        params.Item['pastProjects'] = {
            L: pastProjects
        }
    }

    dynamo.putItem(params, function (error, data) {
        if (error) {
            console.log("New Record Failed");
        } else {
            // console.log("Success");
        }
    });
};

var addRoles = (employee) => {
    var roles = setRoles(employee.role, employee.title);
    if (roles.length !== 0) {
        var roleParam = {
            TableName: "employeeRoles",
            Item: {
                email: {
                    S: employee.email
                },
                roles: {
                    NS: roles
                }
            }
        }
        dynamo.putItem(roleParam, function (error, data) {
            if (error) {
                console.log("New Record Role Failed");
            }
        });
    }
};

var copyContractors = () => {
    var params = {
        TableName: 'contractors'
    };
    dynamo.scan(params, function(err, data) {
        if (err) console.log("Add Contractor Failed"); // an error occurred
        else {
            contractors = data.Items;
            console.log("Contractors Length: ",contractors.length);
            clearEmployeeRecord();
        }
    });
};

var clearEmployeeRecord = () => {
    dynamo.scan({TableName: 'employeeRoles'}, function (error, data) {
        if (!error) {
            data.Items.map(function (roleItem) {
                dynamo.deleteItem({
                    TableName: 'employeeRoles',
                    Key: {
                        email: {
                            S: roleItem.email.S
                        }
                    }
                }, function (error, data) {
                    if (error) {
                        console.log("Clear Roles Table Failed");
                    }
                });
            });
            //copying back the contractors
            contractors.map(function (item) {
                dynamo.putItem({
                    TableName: 'employeeRoles',
                    Item: {
                        email: {
                            S: item.email.S
                        },
                        roles: {
                            NS: ['13']
                        }
                    }
                }, function (error, data) {
                    if (error) {
                        console.log("Adding Contractor Roles Failed : ", error);
                    }
                });
            });
        }
    });
    dynamo.scan({TableName: 'employee'}, function (error, data) {
        data.Items.map(function (item) {
            dynamo.deleteItem({
                TableName: 'employee',
                Key: {
                    email: {
                        S: item.email.S
                    }
                }
            }, function (error, data) {
                if (error) {
                    console.log("Deleting Employee Record Failed");
                } else {
                    // console.log('Deleted Old Record:', item.email.S);
                }
            });
        });

        //copying back the contractors
        contractors.map(function (item) {
            dynamo.putItem({
                TableName: 'employee',
                Item: item
            }, function (error, data) {
                if (error) {
                    console.log("Adding Contractor Record Failed");
                }
            });
        });
        fetchLatestRecords();
    });

    dynamo.scan({TableName: 'mentor'}, function (error, data) {
        if (error) console.log("Fetch Mentor failed");
        else {
            data.Items.map(function (item) {
                dynamo.deleteItem({
                    TableName: 'mentor',
                    Key: {
                        email: {
                            S: item.email.S
                        }
                    }
                }, function (error, data) {
                    if (error) console.log("Delete Mentor Failed");
                    else console.log("Success");
                });
            });
        }
    });
};

var fetchLatestRecords = () => {
    http.get('http://smartoffice.solstice-innovation.com/person/all?AuthType=Guest&AuthKey=busybird641@gmail.com/8182', function (response) {
        var jsonDataString = '';
        response.on('data', function (data) {
            jsonDataString += data;
        });

        response.on('end', function () {
            var jsonData = JSON.parse(jsonDataString);
            for (var index in jsonData) {
                fetchEmployee(jsonData[index].email);
            }
        });
    });
};

/**
 * Provide an event that contains the following keys:
 *
 *   - operation: one of the operations in the switch statement below
 *   - tableName: required for operations that interact with DynamoDB
 *   - payload: a parameter to pass to the operation being performed
 */
exports.handler = (event, context, callback) => {
    copyContractors();

    mentorParser.parseFile();
};