/*!
 * @devtin/schema-validator v2.5.0
 * (c) 2019-2020 Martin Rafael Gonzalez <tin@devtin.io>
 * MIT
 */
var SchemaValidator=function(a){'use strict';function b(a){return Array.isArray(a)?a:[a]}function c(a,{parent:b="",separator:d="."}={}){const e=[];return Object.keys(a).forEach(f=>a[f]&&"object"==typeof a[f]&&!Array.isArray(a[f])?e.push(...c(a[f],{parent:`${b}${f}${d}`,separator:d})):void e.push(`${b}${f}`)),e}function d(a,b){const[c,e]=b.split(/\./);return e&&"object"==typeof a[c]?d(a[c],e):a[c]}function e(a,b){for(let c=0;c<a.length&&!1!==b(a[c],c);c++);}function f(a,b){const e=c(b);return e.forEach(c=>{a=a.replace(new RegExp(`{[\\s]*${c}[\\s]*}`,"g"),d(b,c))}),a}function g(a,b){const c=new RegExp(`^${b}\\.`);return a.filter(a=>c.test(a)).map(a=>a.replace(c,""))}function h(a,b,{strict:c=!1}={}){if("object"!=typeof a)return!1;let d=!0;return c&&e(b,e=>{if(0<e.indexOf(".")){const[f]=e.split(".");return d=h(a[f],g(b,f),{strict:c})}return Object.prototype.hasOwnProperty.call(a,e)?void 0:d=!1}),d&&e(Object.keys(a),c=>{if("object"==typeof a[c]&&!Array.isArray(a[c])){const e=new RegExp(`^${c}\\.(.+)$`);let f=0<=b.indexOf(c);const g=b.filter(a=>e.test(a)).map(a=>(f=!1,a.replace(e,"$1")));return d=f||h(a[c],g)}return-1===b.indexOf(c)?d=!1:void 0}),d}function i(a,b){return Array.isArray(a)&&2===a.length?a:[a,b]}var j=Object.freeze({__proto__:null,castArray:b,obj2dot:c,find:d,forEach:e,render:f,propertiesRestricted:h});const k={Array:{settings:{typeError:`Invalid array`},parse(a){return this.settings.arraySchema&&(a=a.map((a,b)=>new this.constructor(this.settings.arraySchema,Object.assign({},this.settings.arraySchema,{name:b,parent:this})).parse(a))),a},validate(a){Array.isArray(a)||this.throwError(k.Array.settings.typeError,{value:a})}},BigInt:{settings:{typeError:"Invalid bigint",autoCast:!1},validate(a){"bigint"!=typeof a&&this.throwError(k.BigInt.settings.typeError)},cast(a){if(/^(string|number)$/.test(typeof a))try{a=BigInt(a)}catch(a){}return a}},Boolean:{settings:{typeError:`Invalid boolean`,autoCast:!1},cast(a){return!!a},validate(a){"boolean"!=typeof a&&this.throwError(k.Boolean.settings.typeError,{value:a})}},Date:{settings:{typeError:`Invalid date`,autoCast:!0},cast(a){var b=Number.isInteger;if(a instanceof Date)return a;const c=new Date(b(a)?a:Date.parse(a));return"Invalid Date"!==c.toString()&&(a=c),a},validate(a){a instanceof Date||this.throwError(k.Date.settings.typeError,{value:a})}},Function:{settings:{typeError:`Invalid function`},validate(a){"function"!=typeof a&&this.throwError(k.Function.settings.typeError,{value:a})}},Number:{settings:{typeError:`Invalid number`,autoCast:!1},cast(a){return+a},validate(a){("number"!=typeof a||isNaN(a))&&this.throwError(k.Number.settings.typeError,{value:a})}},Object:{settings:{typeError:`Invalid object`},validate(a){"object"!=typeof a&&this.throwError(k.Object.settings.typeError,{value:a})}},Promise:{settings:{typeError:`Invalid Promise`,autoCast:!1,isPromise(a){return"object"==typeof a&&"function"==typeof a.then}},cast(a){return k.Promise.settings.isPromise(a)?a:"function"==typeof a?Promise.resolve(a()):Promise.resolve(a)},validate(a){k.Promise.settings.isPromise(a)||this.throwError(k.Promise.settings.typeError,{value:a})}},Set:{settings:{typeError:`Invalid set`,autoCast:!0},cast(a){return Array.isArray(a)&&(a=new Set(a)),a},validate(a){a instanceof Set||this.throwError(k.Set.settings.typeError,{value:a})}},String:{settings:{typeError:`Invalid string`,enumError:`Unknown enum option { value }`,enum:[],autoCast:!1},cast(a){return a&&Object.hasOwnProperty.call(a,"toString")&&"function"==typeof a.toString&&"[object Object]"!==a.toString()&&(a=a.toString()),a},validate(a){if("string"!=typeof a&&this.throwError(k.String.settings.typeError,{value:a}),Array.isArray(this.settings.enum)&&0<this.settings.enum.length&&0>this.settings.enum.indexOf(a)&&this.throwError(k.String.settings.enumError,{value:a}),this.settings.minlength){const[b,c]=i(this.settings.minlength,`Invalid minlength`);a.length<b&&this.throwError(c,{value:a})}if(this.settings.maxlength){const[b,c]=i(this.settings.maxlength,`Invalid maxlength`);a.length>b&&this.throwError(c,{value:a})}if(this.settings.regex){const[b,c]=i(this.settings.regex,`Invalid regex`);b.test(a)||this.throwError(c,{value:a})}}}};class l extends Error{constructor(a,{errors:d=[],value:b,field:c}){super(f(a,{errors:d,value:b,field:c})),this.errors=d,this.value=b,this.field=c}}const m=a=>a;class n{constructor(a,{name:c,defaultValues:g={},parent:d,validate:e,cast:f,settings:h={}}={}){if(this._settings=h,this.schema=a,this.parent=d,this._validate=e,this._cast=f,this.name=c||"",this.originalName=this.name,this.type=n.guessType(a),this.currentType=b(this.type)[0],this.children=[],this._defaultSettings={required:!0,allowNull:!1,default:void 0},this._defaultValues=g,n.isNested(a)?this.children=this._parseSchema(a):(this._settings="object"==typeof a?Object.assign({},this._settings,{required:void 0===a.default},a):this._settings,delete this._settings.type),void 0!==this.settings.default&&this.settings.required)throw new Error(`Remove either the 'required' or the 'default' option for property ${this.fullPath}.`);this._defaultSettings.default=this.getDefault()}get hasChildren(){return 0<this.children.length}get validate(){return this._validate||m}get cast(){return this._cast||m}get settings(){return!this.hasChildren&&k[this.currentType]&&k[this.currentType].settings?Object.assign(this._defaultSettings,k[this.currentType].settings,this._settings):Object.assign(this._defaultSettings,this._settings)}static castSchema(a){return a instanceof n?a:"object"==typeof a&&"Schema"===n.guessType(a.type)?a.type:a}static castSettings(a){if(a instanceof n)return a.settings;const b=Object.assign({},a);return delete b.type,b}_parseSchema(a){return Object.keys(a).map(b=>{if("Schema"===n.guessType(a[b])){const c=n.cloneSchema({schema:n.castSchema(a[b]),settings:n.castSettings(a[b]),name:b,parent:this});return c}return new n(a[b],{name:b,parent:this})})}static isNested(a){return"Object"===n.guessType(a)&&!a.type}static guessType(a){return a instanceof n?"Schema":"function"==typeof a?a.name:"object"==typeof a&&a.type?n.guessType(a.type):"object"!=typeof a||Array.isArray(a)?(Array.isArray(a)&&(a=a.map(n.guessType)),a):"Object"}get fullPath(){return(this.parent&&this.parent.fullPath?`${this.parent.fullPath}.`:"")+this.name}get ownPaths(){return this.children.map(({name:a})=>a)}get paths(){const a=[];return this.hasChildren?this.children.forEach(({paths:b})=>{b.forEach(b=>{a.push((this.name?`${this.name}.`:"")+b)})}):a.push(this.name),a}static cloneSchema({schema:a,name:b,parent:c,settings:d={},defaultValues:e={}}){const f=Object.assign(Object.create(Object.getPrototypeOf(a)),a,{name:b||a.name,parent:c,cloned:!0,_defaultValues:e,_settings:Object.assign({},d)});return f.children&&(f.children=f.children.map(a=>n.cloneSchema({schema:a,parent:f}))),f}schemaAtPath(a){const[b,c]=a.split(/\./);let d;return e(this.children,a=>{if(a.name===b)return d=a,!1}),c?d.schemaAtPath(c):d}hasField(a){return 0<=this.paths.indexOf(a)}structureValidation(a){if(!a||!this.hasChildren)return!0;if(!h(a,this.ownPaths)){const b=[];throw a&&c(a).forEach(a=>{this.hasField(a)||b.push(new Error(`Unknown property ${a}`))}),new l(`Invalid object schema`,{errors:b,value:a})}}parse(a){return a=this.hasChildren?this.runChildren(a):this.parseProperty(this.type,a),this.parent||(a=this.cast.call(this,a),this.validate.call(this,a)),a}processLoaders(a,c){return e(b(c),b=>{"object"!=typeof b&&(b={type:b});const c=n.guessType(b),d=Object.assign(Object.create(this),this,{type:c,_cast:void 0,_validate:void 0});"Schema"!==c&&(d._settings=Object.assign({},d._settings,b,{loaders:void 0,cast:void 0,validate:void 0})),a=d.parseProperty(c,a)}),a}parseProperty(a,b){if(null===b&&this.settings.allowNull)return b;if(Array.isArray(a)){let c,d=!1;return e(a,a=>{try{return this.currentType=a,c=this.parseProperty(a,b),d=!0,!1}catch(a){}}),d||this.throwError(`Could not resolve given value type`),c}const c=k[a];if(c||this.throwError(`Don't know how to resolve ${a}`),void 0!==this.settings.default&&void 0===b&&(b="function"==typeof this.settings.default?this.settings.default.call(this,b):this.settings.default),void 0!==b||this.settings.required){if(void 0===b&&this.settings.required){const[a,c]=i(this.settings.required,`Property ${this.fullPath} is required`);a&&this.throwError(c,{value:b})}return this.settings.loaders&&(b=this.processLoaders(b,this.settings.loaders)),c.loaders&&(b=this.processLoaders(b,c.loaders)),b=this.runTransformer({method:"cast",transformer:this.settings,payload:b}),this.settings.autoCast&&(b=this.runTransformer({method:"cast",transformer:c,payload:b})),this.runTransformer({method:"validate",transformer:c,payload:b}),this.runTransformer({method:"validate",transformer:this.settings,payload:b}),this.runTransformer({method:"parse",transformer:c,payload:b})}}runChildren(a,{method:b="parse"}={}){if(!this.settings.required&&void 0===a)return;const c={},d=[],e=a=>{try{a()}catch(a){a instanceof l?a instanceof l&&0<a.errors.length?d.push(...a.errors):d.push(a):d.push(a)}};if(e(()=>this.structureValidation(a)),this.ownPaths.forEach(d=>{const f=this.schemaAtPath(d.replace(/\..*$/)),g="object"==typeof a&&null!==a?a[f.name]:void 0;e(()=>{const a=f[b](g);void 0!==a&&Object.assign(c,{[f.name]:a})})}),0<d.length)throw new l(`Data is not valid`,{errors:d});return c}runTransformer({method:a,transformer:b,payload:c}){return b[a]?b[a].call(this,c):c}throwError(a,{errors:b,value:c}={}){throw new l(a,{errors:b,value:c,field:this})}getDefault(a){return this.parent?this.parent.getDefault(a?`${this.name}.${a}`:this.name):a?d(this._defaultValues,a):void 0}}return a.Schema=n,a.Transformers=k,a.Utils=j,a.ValidationError=l,a}({});
