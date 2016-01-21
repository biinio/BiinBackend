//Intersection function helper
function intersection(a, b, areEqualFunction) {
    var Result = [];

    for(var i = 0; i < a.length; i++) {
        var aElement = a[i];
        var existsInB = _.any(b, function(bElement) { return areEqualFunction(bElement, aElement); });
        if(existsInB) {
            Result.push(aElement);
        }
    }

    return Result;
}

//Compare two objects list and returns the intersection
//between the two list's
function intersectionObjects() {
    var Results = arguments[0];
    var LastArgument = arguments[arguments.length - 1];
    var ArrayCount = arguments.length;
    var areEqualFunction = _.isEqual;

    if(typeof LastArgument === "function") {
        areEqualFunction = LastArgument;
        ArrayCount--;
    }

    for(var i = 1; i < ArrayCount ; i++) {
        var array = arguments[i];
        Results = intersection(Results, array, areEqualFunction);
        if(Results.length === 0) break;
    }
    return Results;
}

//Contains function helper
function contains(list, property, value){
    return _.findWhere(list,{property:value})!='undefined';
}

//Difference function helper
function difference(a, b, areEqualFunction) {
    var Result = [];

    for(var i = 0; i < a.length; i++) {
        var aElement = a[i];
        var existsInB = _.any(b, function(bElement) { return areEqualFunction(bElement, aElement); });
        if(!existsInB) {
            Result.push(aElement);
        }
    }

    return Result;
}

//Compare two objects list and returns the difference
//between the two list's
function differenceObjects() {
    var Results = arguments[0];
    var LastArgument = arguments[arguments.length - 1];
    var ArrayCount = arguments.length;
    var areEqualFunction = _.isEqual;

    if(typeof LastArgument === "function") {
        areEqualFunction = LastArgument;
        ArrayCount--;
    }

    for(var i = 1; i < ArrayCount ; i++) {
        var array = arguments[i];
        Results = difference(Results, array, areEqualFunction);
        if(Results.length === 0) break;
    }
    return Results;
}