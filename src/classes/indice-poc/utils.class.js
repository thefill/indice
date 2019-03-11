/**
 * Emiter
 * @constructor
 */
function Utils(){
    const factory = {};

    factory.debounce = debounce;
    factory.aggregate = aggregate;
    factory.diffInDays = diffInDays;
    factory.diffInHours = diffInHours;
    factory.resetDateToMidnight = resetDateToMidnight;
    factory.handleError = handleError;
    factory.sortByProperty = sortByProperty;
    factory.isValidTodayOrPast = isValidTodayOrPast;
    factory.toInt = toInt;
    factory.unique = unique;
    factory.updateMultipleProperties = updateMultipleProperties;
    factory.decouple = decouple;
    factory.isEqualArrays = isEqualArrays;

    return factory;
}

module.exports = Utils();

/**
 * Creates function that can be executed many times but executes
 * callback once for last call in time range
 * @param callback
 * @param time
 * @param scope
 * @return {Function}
 */
function debounce(callback, time, scope){
    let lastCallbackArgument;
    let timeout;

    return (...args) => {
        lastCallbackArgument = args;

        // if executed for the first time
        if(!timeout){
            timeout = setTimeout(() => {
                if(scope){
                    callback.bind(scope);
                }
                callback(...lastCallbackArgument);
                clearTimeout(timeout);
                timeout = null;
            }, time);
        }
    };
}

/**
 * Creates function that can be executed many times but executes
 * callback once with all data passed in time range
 * @param callback
 * @param time
 * @param scope
 * @param {boolean} singleArgument Are calls with single argument? If so flatten results
 * @return {Function}
 */
function aggregate(callback, time, scope, singleArgument){
    let callbackArguments = [];
    let timeout;

    return (...args) => {
        callbackArguments.push(args);

        // if executed for the first time
        if(!timeout){
            timeout = setTimeout(() => {
                if(scope){
                    callback.bind(scope);
                }
                if(singleArgument){
                    // flatten aggregated arguments to array of values not array of array of values
                    callbackArguments = callbackArguments.map((arg) => {
                        return arg[0];
                    });
                }
                callback(callbackArguments);
                clearTimeout(timeout);
                timeout = null;
                callbackArguments = [];
            }, time);
        }
    };
}

/**
 * Convert value to int or return untouched
 * @param data
 */
function toInt(data){

    const result = Number.parseInt(data);

    // if not able to parse to int
    if(!Number.isInteger(result)){
        return data;
    }

    // else int so return parsed
    return result;
}

/**
 * Calculates diff in days, returns negative number for flipped dates
 * @param dateA
 * @param dateB
 * @return {number}
 */
function diffInDays(dateA, dateB, ignoreHours = true){
    // Decouple date object
    const baseDateA = new Date(dateA);
    const baseDateB = new Date(dateB);

    if(ignoreHours){
        baseDateA.setHours(0);
        baseDateB.setHours(0);
        baseDateA.setMinutes(0);
        baseDateB.setMinutes(0);
    }
    const timeDiff = baseDateA.getTime() - baseDateB.getTime();
    return timeDiff / (1000 * 3600 * 24);
}

/**
 * Calculates diff in hours, returns negative number for flipped dates
 * @param dateA
 * @param dateB
 * @return {number}
 */
function diffInHours(dateA, dateB, ignoreMinutes = true){
    // Decouple date object
    const baseDateA = new Date(dateA);
    const baseDateB = new Date(dateB);

    if(ignoreMinutes){
        baseDateA.setMinutes(0);
        baseDateB.setMinutes(0);
    }
    const timeDiff = baseDateA.getTime() - baseDateB.getTime();
    return timeDiff / (1000 * 3600);
}

/**
 * Reset time to midnight
 * @param dateToReset
 * @return {*}
 */
function resetDateToMidnight(dateToReset){
    dateToReset.setHours(0);
    dateToReset.setMinutes(0);
    return dateToReset;
}

/**
 * Handle error
 * @param errorObject
 * @param defaultMessage
 * @return {string}
 */
function handleError(errorObject, defaultMessage){
    console.error(errorObject);
    if(errorObject.data && (errorObject.data.primeMsg || errorObject.data.msg)){
        const primeMessage = errorObject.data.primeMsg || errorObject.data.msg;
        return `${defaultMessage} ${primeMessage}`;
    } else {
        return defaultMessage;
    }
}


/**
 * Sorts object key values by property
 * @param data
 * @param propertyToSortAgainst
 * @return {Array}
 */
function sortByProperty(data, propertyToSortAgainst){
    return Object.values(data).sort((a, b) => {
        return a[propertyToSortAgainst] === b[propertyToSortAgainst] ?
            0 : (a[propertyToSortAgainst] > b[propertyToSortAgainst] ? 1 : -1);
    });
}

/**
 * Date validation
 */
function isValidTodayOrPast(dt){
    let now = new Date();
    // if time less than tomorrow, its valid
    return dt.getTime() < new Date(now.setDate(now.getDate() + 1)).setHours(0, 0, 0, 0);
}

/**
 * Returns array of unique values
 * @return {any[]}
 */
function unique(array){
    return [...new Set(array)];
}

/**
 * Update property for multiple elements
 * @param elements {any | any[]}
 * @param propertyName {string | number}
 * @param value {any}
 * @return {*}
 */
function updateMultipleProperties(elements, propertyName, value){
    elements = Array.isArray(elements) ? elements : [elements];
    elements = elements.map((element) => {
        element[propertyName] = value;
        return element;
    });

    return elements;
}

/**
 * Decouple value from the reference
 * @param value
 * @return {any}
 */
function decouple(value){
    return JSON.parse(JSON.stringify(value));
}

/**
 * Check if two arrays are equal, non-deep comparision of values,
 * dont takes into account order
 * @param arrayA {any[]}
 * @param arrayB {any[]}
 * @return {boolean}
 */
function isEqualArrays(arrayA, arrayB){
    if(!Array.isArray(arrayA) || !Array.isArray(arrayB)){
        return false;
    }
    
    if(arrayA.length !== arrayB.length){
        return false;
    }

    return arrayA.every((entry, index)=>{
        return entry === arrayB[index];
    });
}