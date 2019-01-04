export function reducePassengers(passengers){
    const groups = passengers.reduce(function(acc, psgr){
        acc[psgr.groupKey] = acc[psgr.groupKey] || [];
        acc[psgr.groupKey].push(psgr);
        return acc;
    }, {})
    const reducedPsgrs = Object.keys(groups).reduce(function(acc1, groupKey){
        var group = groups[groupKey];
        var reducedPsgr = group.reduce(function(acc2, psgr){
            return acc2.merge(psgr);
        });
        acc1.push(reducedPsgr);
        return acc1;
    }, []);
    const filteredPsgrs = reducedPsgrs.filter(psgr => psgr.count > 0);

    return filteredPsgrs;
}
