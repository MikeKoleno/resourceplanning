angular.module('RDash.Services')
    .service("employeeRecordsSync", ["$http", function ($http) {
        return {
            fetchEmployees : function () {
                return $http.get("http://smartoffice.solstice-innovation.com/person/all?AuthType=Guest&AuthKey=busybird641@gmail.com/8182");
            },
            fetchEmployee : function (email) {
                return $http.get("http://smartoffice.solstice-innovation.com/person/" + email + "?AuthType=Guest&AuthKey=busybird641@gmail.com/8182");
            },
            setRoles : function (role, title) {
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
            }
        }
    }]);