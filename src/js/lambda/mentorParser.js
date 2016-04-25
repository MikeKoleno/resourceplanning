'use strict';
var fs = require('node-xlsx');

let result = [];

exports.parseFile = () => {
    var response = fs.parse('./userlist.xls');
    result = response[0].data;
};

exports.fetchMentor = (email) => {
    for (var index in result) {
        if ((result[index][0]).toLowerCase() === email.toLowerCase()) {
            return result[index];
        }
    }
    return null;
};

