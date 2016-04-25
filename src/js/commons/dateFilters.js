angular.module("RDash")
    .filter("dateFilter", function () {
        return function (items, field) {
            var current = new Date();
            return items.filter(function (item) {
                if (field === 'current') {
                    return new Date(item.M.startDate['S']) < current;
                } else if (field === 'upcoming') {
                    return new Date(item.M.startDate['S']) > current;
                } else if (field === 'retired') {
                    return new Date(item.M.endDate['S']) < current;
                }
            });
        }
    });