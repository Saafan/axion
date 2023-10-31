mongomodels = {}

const slugify = (text)=>{
  const from = "ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;"
  const to = "aaaaaeeeeeiiiiooooouuuunc------"

  const newText = text.split('').map(
    (letter, i) => letter.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i)))

  return newText
    .toString()                     // Cast to string
    .toLowerCase()                  // Convert the string to lowercase letters
    .trim()                         // Remove whitespace from both sides of a string
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/&/g, '-y-')           // Replace & with 'and'
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-');        // Replace multiple - with single -
}


/**
* check if string can be parsed to positive valid number
* @param {*} str 
* @returns boolean
*/
const isNormalInteg = (str)=>{
var n = Math.floor(Number(str));
return n !== Infinity && String(n) === str && n >= 0;
}
  
/**
 * Check if a collection has a specific ID.
 * @param {Object} collection - The collection to check.
 * @param {string} field - The field to look for in the collection.
 * @param {string} value - The value to check if exists or not
 * @returns {object} - returns and error message if the value not found otherwise returns null
 */
const existingItem = async (collection, field, value) => {
    const query = {};
    query[field] = value;
    let item = await collection.findOne(query);
    return (item ? item : {error: `${collection.modelName} not found`});
  }

/**
 * Get the user type from a collection using a specific ID.
 * @param {Object} token - The user token containing the user ID.
 * @returns {string|null} - The user type if found, or null if not found.
 */
const getUserTypeByToken = async (token) => {
    let decodedUser = token;
    let userId = decodedUser.userId;
    return (await existingItem(this.mongomodels.user, "_id", userId)).type;
}

/**
* 
* @param {*} path 'a.b.c'
* @param {*} obj an object to extract value of 
*/
const getDeepValue = (path, obj) => {
for (var i = 0, path = path.split('.'), len = path.length; i < len; i++) {
    var level = obj[path[i]];
    if (!level) return null;
    obj = level;
};
return obj;
}

/**
* @param {*} path example 'a.b.c'
* @param {*} value what do you wanaa set at the path ex: 'hello'
* @param {*} obj the object that will be injected the path and value
*/
const setDeepValue = ({path, value, obj, marker}) => {
if(!marker)marker='.'
let pfs = path.split(marker);
let deepRef = obj;

for (let i = 0; i < pfs.length; i++) {
    if (deepRef[pfs[i]] === undefined || deepRef[pfs[i]] === null) {
        deepRef[pfs[i]] = {};
    }
    if (i == pfs.length - 1) {
        deepRef[pfs[i]] = value;
    } else {
        deepRef = deepRef[pfs[i]];
    }
}
return obj;
}

const upCaseFirst = (string)=>{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const nanoTime = ()=>{
    return Number(process.hrtime.bigint())
}

const inverseObj = (obj)=>{
    var retobj = {};
    for(var key in obj){
      retobj[obj[key]] = key;
    }
    return retobj;
}


const flattenObject =(ob, marker)=> {
    if(!marker)marker=".";
    var toReturn = {};
    for (var i in ob) {
        if (!ob.hasOwnProperty(i)) continue;
        if ((typeof ob[i]) == 'object' && ob[i] !== null) {
          if(Array.isArray(ob[i])){
            toReturn[i] = ob[i];
          } else {
            var flatObject = flattenObject(ob[i], marker);
            for (var x in flatObject) {
                if (!flatObject.hasOwnProperty(x)) continue;
                toReturn[i + marker + x] = flatObject[x];
            }
          }
        } else {
            toReturn[i] = ob[i];
        }
    }
    return toReturn;
}

const arrayToObj = (arr)=>{
    let keys = arr.filter((_, index) => index % 2 === 0);
    let values = arr.filter((_, index) => index % 2 !== 0)
    let obj = {};
    keys.reduce((sighting, key, index) => {
            obj[key] = values[index]
            return obj
    }, {});
    return obj;
}

const hrTime = ()=>{
    return Number(process.hrtime.bigint());
}

_regExpEscape = (s) => {
    return s.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
  }
_wildcardToRegExp = (s) => {
    return new RegExp('^' + s.split(/\*+/).map(_regExpEscape).join('.*') + '$');
}

const match = (str, model) => {
    return _wildcardToRegExp(model).test(str);
}

const isChance = (max)=>{
    let min = 0;
    let value = Math.floor(Math.random() * (max - min + 1) + min);
    return min == value; 
}

 let setMongoModels = (value) => {
  this.mongomodels = value;
}

module.exports = {
  setMongoModels,
  slugify,
  getDeepValue,
  setDeepValue,
  isNormalInteg,
  upCaseFirst,
  nanoTime,
  inverseObj,
  flattenObject,
  arrayToObj,
  hrTime,
  match,
  isChance,
  existingItem,
  getUserTypeByToken
}