// Run expresion on specific scope
// First, parse variables in expression
// Then, it generates runnable statement with variables in scope
// After that, it use `new Function` to run statement and return the result
// http://stackoverflow.com/questions/4599857/is-eval-and-new-function-the-same-thing
function applyExpression (scope, exp) {
    var variables = getVariable(exp)
    var code = []

    each(variables, function (variable) {
        if(!isUndefined(scope[variable])) {
            var statment = 'var ' + variable + ' = scope.' + variable
        } else if (!global[variable]) {
            var statment = 'var ' + variable + ' = ""' 
        }
        code.push(statment) 
    })

    code.push('return ' + escapeExpression(exp))

    var fnCode = code.join(';\n')
    var fn = new Function('scope', fnCode)
    return fn(scope)
}

// Extendable Object:
// use code like below to run expression     
// on certain object after extending it.
// 
// ```
//   var obj = extend({}, applyer)
//   obj.$apply(exp)
// ```
var applyer = {
    $apply: function(exp) {
        return applyExpression(this, exp)
    }
}


// Parse the variable from code
// Copy from `artTemplate` 
// https://github.com/khhhshhh/artTemplate/blob/master/template.js
var KEYWORDS =
    // keywords
    'break,case,catch,continue,debugger,default,delete,do,else,false'
    + ',finally,for,function,if,in,instanceof,new,null,return,switch,this'
    + ',throw,true,try,typeof,var,void,while,with'
    
    //  reserved word
    + ',abstract,boolean,byte,char,class,const,double,enum,export,extends'
    + ',final,float,goto,implements,import,int,interface,long,native'
    + ',package,private,protected,public,short,static,super,synchronized'
    + ',throws,transient,volatile'
    
    // ECMA 5 - use strict
    + ',arguments,let,yield'

    + ',undefined';

var REMOVE_RE = /\/\*(?:.|\n)*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|'[^']*'|"[^"]*"|[\s\t\n]*\.[\s\t\n]*[$\w\.]+/g;
var SPLIT_RE = /[^\w$]+/g;
var KEYWORDS_RE = new RegExp(["\\b" + KEYWORDS.replace(/,/g, '\\b|\\b') + "\\b"].join('|'), 'g');
var NUMBER_RE = /\b\d[^,]*/g;
var BOUNDARY_RE = /^,+|,+$/g;

function getVariable (code) {

    code = code
    .replace(REMOVE_RE, '')
    .replace(SPLIT_RE, ',')
    .replace(KEYWORDS_RE, '')
    .replace(NUMBER_RE, '')
    .replace(BOUNDARY_RE, '');

    code = code ? code.split(/,+/) : [];

    return code;
};

var DOUBBLE_BRACE_RE = /[\{\{\}\}]/g
function escapeExpression (exp) {
    return exp.replace(DOUBBLE_BRACE_RE, '')
}


/* Test
---------------------------------------------------------*/
// var code = '{{name + test(name) + 1}}'

/*console.log(getVariable(code))

console.log(applyExpression({
    name: 'Kruash',
    age: '12',
    test: function (name) {
        return 'Hello, if you saw this, it worked~!'
    }
}, code))
*/
// var obj = {
//     name: 'Kruash',
//     age: '12',
//     test: function (name) {
//         return 'Hello, if you saw this, it worked~!'
//     }
// }

// extend(obj, applyer)
// console.log(obj.$apply(code))