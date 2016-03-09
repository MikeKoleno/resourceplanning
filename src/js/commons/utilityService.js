angular
    .module('RDash.Services')
    .service('utilitySrv', [utilityService]);

function utilityService () {
    return {
        greenToRedColors: function (index) {
            var colorsArray = ['#007f00', '#00ab00', '#00bf00', '#00df00', '#00ff00', '#b0ff00', '#ffca00', '#ff8700', '#ff5600', '#ff0000'];
            return colorsArray[index];
        },
        isEmpty: function (value) {
            if (value === undefined || value === null || value === "") {
                return true;
            }
            return false;
        }
    }
};