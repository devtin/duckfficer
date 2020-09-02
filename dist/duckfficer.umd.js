/*!
 * duckfficer v2.0.0
 * (c) 2019-2020 Martin Rafael <tin@devtin.io>
 * MIT
 */
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports,require("events")):"function"==typeof define&&define.amd?define(["exports","events"],e):e((t="undefined"!=typeof globalThis?globalThis:t||self).default=t.default||{},t.events)}(this,(function(t,e){"use strict";function s(t){return Array.isArray(t)?t:[t]}function r(t,{parent:e="",separator:s="."}={}){const a=[];return Object.keys(t).forEach(i=>{if(t[i]&&"object"==typeof t[i]&&!Array.isArray(t[i]))return a.push(...r(t[i],{parent:`${e}${i}${s}`,separator:s}));a.push(`${e}${i}`)}),a}function a(t,e){const[s,...r]=Array.isArray(e)?e:e.split(".");return r.length>0&&"object"==typeof t[s]?a(t[s],r):s?t[s]:t}function i(t,e){for(let s=0;s<t.length&&!1!==e(t[s],s);s++);}function n(t){return t.replace(/[-/\\^$*+?.()|[\]{}]/g,"\\$&")}function o(t,e){return r(e).forEach(s=>{t=t.replace(new RegExp(`{[\\s]*${s.split(".").map(n).join(".")}[\\s]*}`,"g"),a(e,s))}),t}function h(t){return"object"==typeof t&&!Array.isArray(t)&&null!==t}function c(t,e,{strict:s=!1}={}){if(!h(t))return!1;let r=!0;return s&&i(e,a=>{if(a.indexOf(".")>0){const[i]=a.split(".");return r=c(t[i],function(t,e){e=e.split(".").map(n).join(".");const s=new RegExp(`^${e}\\.`);return t.filter(t=>s.test(t)).map(t=>t.replace(s,""))}(e,i),{strict:s}),r}if(!Object.prototype.hasOwnProperty.call(t,a))return r=!1,r}),r&&i(Object.keys(t),s=>{if("object"==typeof t[s]&&!Array.isArray(t[s])){const a=new RegExp(`^${n(s)}\\.(.+)$`);let i=e.indexOf(s)>=0;const o=e.filter(t=>a.test(t)).map(t=>(i=!1,t.replace(a,"$1")));return r=i||c(t[s],o),r}if(-1===e.indexOf(s))return r=!1,r}),r}const l=async function(t,e){for(const s of t)await e(s)};var u=Object.freeze({__proto__:null,castArray:s,obj2dot:r,find:a,forEach:i,render:o,propertiesRestricted:c,PromiseEach:l});function p(t,e){return Array.isArray(t)&&2===t.length?t:[t,e]}const d={Array:{settings:{typeError:"Invalid array"},async parse(t){return this.settings.arraySchema?async function(t,e){const s=[];let r=0;return await l(t,async t=>{s.push(await e(t,r++))}),s}(t,(t,e)=>{const s=this.constructor.castSchema(this.settings.arraySchema);return("Schema"===this.constructor.guessType(s)?this.constructor.cloneSchema({schema:s,name:e,parent:this,settings:s.settings}):new this.constructor(this.settings.arraySchema,Object.assign({},this.settings.arraySchema,{name:e,parent:this}))).parse(t)}):t},validate(t){Array.isArray(t)||this.throwError(this.settings.typeError,{value:t})}},BigInt:{settings:{typeError:"Invalid bigint",autoCast:!1},validate(t){"bigint"!=typeof t&&this.throwError(this.settings.typeError)},cast(t){if(/^(string|number)$/.test(typeof t))try{t=BigInt(t)}catch(t){}return t}},Boolean:{settings:{typeError:"Invalid boolean",autoCast:!1},cast:t=>!!t,validate(t){"boolean"!=typeof t&&this.throwError(this.settings.typeError,{value:t})}},Date:{settings:{typeError:"Invalid date",autoCast:!0},cast(t){if(t instanceof Date)return t;const e=new Date(Number.isInteger(t)?t:Date.parse(t));return"Invalid Date"!==e.toString()&&(t=e),t},validate(t){t instanceof Date||this.throwError(this.settings.typeError,{value:t})}},Function:{settings:{typeError:"Invalid function"},validate(t){"function"!=typeof t&&this.throwError(this.settings.typeError,{value:t})}},Map:{settings:{typeError:"Invalid map",autoCast:!0},cast:t=>(!h(t)||t instanceof Map||(t=new Map(Object.entries(t))),t),validate(t){t instanceof Map||this.throwError(this.settings.typeError,{value:t})}},Number:{settings:{typeError:"Invalid number",minError:"minimum accepted value is { value }",maxError:"maximum accepted value is { value }",integerError:"Invalid integer",min:void 0,max:void 0,integer:!1,decimalPlaces:void 0,autoCast:!1},cast:t=>Number(t),validate(t){("number"!=typeof t||isNaN(t))&&this.throwError(this.settings.typeError,{value:t}),this.settings.integer&&!Number.isInteger(t)&&this.throwError(this.settings.integerError,{value:t}),void 0!==this.settings.min&&t<this.settings.min&&this.throwError(this.settings.minError,{value:this.settings.min}),void 0!==this.settings.max&&t>this.settings.max&&this.throwError(this.settings.maxError,{value:this.settings.max})},parse(t){if(void 0!==this.settings.decimalPlaces){const e=Math.pow(10,this.settings.decimalPlaces);return Math.round(t*e)/e}return t}},Object:{settings:{typeError:"Invalid object"},async parse(t){if(void 0!==this.settings.mapSchema){const e={};return await l(Object.keys(t),async s=>{const r=t[s],a=this.constructor.castSchema(this.settings.mapSchema),i="Schema"===this.constructor.guessType(a)?this.constructor.cloneSchema({schema:a,name:s,settings:a.settings,parent:this}):t[s]=new this.constructor(this.settings.mapSchema,Object.assign({},this.settings.mapSchema,{name:s,parent:this}));e[s]=await i.parse(r)}),e}return t},validate(t){h(t)||this.throwError(this.settings.typeError,{value:t})}},Set:{settings:{typeError:"Invalid set",autoCast:!0},cast:t=>(Array.isArray(t)&&(t=new Set(t)),t),validate(t){t instanceof Set||this.throwError(this.settings.typeError,{value:t})}},String:{settings:{typeError:"Invalid string",enumError:"Unknown enum option { value }",enum:[],autoCast:!1,lowercase:!1,uppercase:!1},cast:t=>(t&&Object.hasOwnProperty.call(t,"toString")&&"function"==typeof t.toString&&"[object Object]"!==t.toString()&&(t=t.toString()),t),validate(t){if("string"!=typeof t&&this.throwError(this.settings.typeError,{value:t}),Array.isArray(this.settings.enum)&&this.settings.enum.length>0&&this.settings.enum.indexOf(t)<0&&this.throwError(this.settings.enumError,{value:t}),this.settings.minlength){const[e,s]=p(this.settings.minlength,"Invalid minlength");t.length<e&&this.throwError(s,{value:t})}if(this.settings.maxlength){const[e,s]=p(this.settings.maxlength,"Invalid maxlength");t.length>e&&this.throwError(s,{value:t})}if(this.settings.regex){const[e,s]=p(this.settings.regex,"Invalid regex");e.test(t)||this.throwError(s,{value:t})}},parse(t){return this.settings.lowercase&&(t=t.toLowerCase()),this.settings.uppercase&&(t=t.toUpperCase()),t}}};class g extends Error{constructor(t,{errors:e=[],value:s,field:r}){super(o(t,{errors:e,value:s,field:r})),this.errors=e,this.value=s,this.field=r}toJSON(){const{message:t,value:e}=this,s={message:t,value:e};return this.field&&Object.assign(s,{field:this.field.fullPath}),s}}class f extends Error{constructor(t,e){super(t),this.errorName=t,this.payload=e}}const y=async t=>Promise.resolve(t);class m{constructor(t,{name:e,defaultValues:r={},methods:a={},parent:i,validate:n,cast:o,settings:h={}}={}){if(this._settings=h,Array.isArray(t)&&1===t.length&&(t=t[0]),this._methods=a,this.schema=t,this.parent=i,this._validate=n,this._cast=o,this.name=e||"",this.originalName=this.name,this.type=m.guessType(t),this.currentType=s(this.type)[0],this.children=[],this._defaultSettings={required:!0,allowNull:!1,default:void 0},this._defaultValues=r,this.virtuals=[],m.isNested(t)?this.children=this._parseSchema(t):(this._settings="object"==typeof t?Object.assign({},this._settings,{required:void 0===t.default},t):this._settings,delete this._settings.type),void 0!==this.settings.default&&this.settings.required)throw new Error(`Remove either the 'required' or the 'default' option for property ${this.fullPath}.`);this._defaultSettings.default=this.getDefault()}get hasChildren(){return this.children.length>0}get validate(){return this._validate||y}get cast(){return this._cast||y}get settings(){return!this.hasChildren&&d[this.currentType]&&d[this.currentType].settings?Object.assign(this._defaultSettings,d[this.currentType].settings,this._settings):Object.assign(this._defaultSettings,this._settings)}static castSchema(t){return t instanceof m?t:"object"==typeof t&&"Schema"===m.guessType(t.type)?t.type:t}static castSettings(t){if(t instanceof m)return t.settings;const e=Object.assign({},t);return delete e.type,e}async isValid(t){try{return await this.parse(t),!0}catch(t){return!1}}_parseSchema(t){return Object.keys(t).map(e=>{const s=Object.getOwnPropertyDescriptor(t,e);if("function"!=typeof s.get&&"function"!=typeof s.set)return"Schema"===m.guessType(t[e])?m.cloneSchema({schema:m.castSchema(t[e]),settings:m.castSettings(t[e]),name:e,parent:this}):new m(t[e],{name:e,parent:this});this.virtuals.push({path:e,getter:s.get,setter:s.set})}).filter(Boolean)}static isNested(t){return"Object"===m.guessType(t)&&!t.type}static guessType(t){return t instanceof m?"Schema":"function"==typeof t?t.name:"object"==typeof t&&t.type?m.guessType(t.type):"object"!=typeof t||Array.isArray(t)?(Array.isArray(t)&&(t=t.map(m.guessType)),t):"Object"}get fullPath(){return(this.parent&&this.parent.fullPath?this.parent.fullPath+".":"")+this.name}get ownPaths(){return this.children.map(({name:t})=>t)}get paths(){const t=[];return this.name&&t.push(this.name),this.hasChildren&&this.children.forEach(({paths:e})=>{e.forEach(e=>{t.push((this.name?this.name+".":"")+e)})}),t}static cloneSchema({schema:t,name:e,parent:s,settings:r={},defaultValues:a,type:i,cast:n,validate:o,currentType:h}){const c=Object.assign(Object.create(Object.getPrototypeOf(t)),t,{name:e||t.name,type:i||t.type,currentType:h||t.currentType,_cast:n||!1===n?n:t._cast,_validate:o||!1===o?o:t._validate,parent:s,cloned:!0,_defaultValues:a||t._defaulValues,_settings:Object.assign({},t._settings,r)});return c.children&&(c.children=c.children.map(t=>m.cloneSchema({schema:t,parent:c}))),c}schemaAtPath(t){const[e,s]=t.split(/\./);let r;return i(this.children,t=>{if(t.name===e)return r=t,!1}),s?r.schemaAtPath(s):r}hasField(t,e=!1){return this.paths.indexOf(e?t:t.replace(/\..*$/,""))>=0}structureValidation(t){if(!h(t)||!this.hasChildren)return;const e=[];if(c(t,this.ownPaths)||t&&r(t).forEach(t=>{this.hasChildren&&!this.hasField(t)&&e.push(new Error(`Unknown property ${this.name?this.name+".":""}${t}`))}),this.ownPaths.forEach(s=>{try{this.schemaAtPath(s).structureValidation(t[s])}catch(t){const{errors:s}=t;e.push(...s)}}),e.length>0)throw new g("Invalid object schema"+(this.parent?" in property "+this.fullPath:""),{errors:e,value:t,field:this})}async fullCast(t,{state:e}){return"object"==typeof(t=await this.cast(t,{state:e}))&&t&&this.hasChildren&&await l(this.children,async s=>{void 0!==await s.fullCast(t[s.name],{state:e})&&(t[s.name]=await s.fullCast(t[s.name],{state:e}))}),t}static ensureSchema(t){return t instanceof m?t:new m(t)}async parse(t,{state:s={},virtualsEnumerable:r=!1}={}){if(t=await this.fullCast(t,{state:s}),this.parent||this.structureValidation(t),t=this.hasChildren?await this.runChildren(t,{state:s}):await this.parseProperty(this.type,t,{state:s}),await this.validate(t,{state:s}),h(t)&&this.virtuals.forEach(({path:e,getter:s,setter:a})=>{Object.defineProperties(t,{[e]:{get:s,set:a,enumerable:r}})}),h(t)||Array.isArray(t)){const s=new e.EventEmitter;Object.defineProperties(t,{$on:{value:s.on.bind(s),writable:!0,enumerable:!1}}),Object.keys(this._methods).forEach(e=>{const r=this._methods[e].input,a=this._methods[e].output,i=this._methods[e].enumerable,n=this._methods[e].events,o=this._methods[e].errors;Object.defineProperty(t,e,{value:async(...i)=>{if(r)try{i=await m.ensureSchema(r).parse(1===i.length?i[0]:i)}catch(t){throw new g("Invalid input at method "+e,{errors:t.errors.length>0?t.errors:[t]})}const h={async $emit(t,e){if(n){if(!n[t])throw new Error("Unknown event "+t);try{e=await m.ensureSchema(n[t]).parse(e)}catch(e){throw new g("Invalid payload for event "+t,{errors:e.errors.length>0?e.errors:[e]})}}s.emit(t,e)},async $throw(t,e){if(o){if(!o[t])throw new f("Unknown error "+t);try{e=o[t]?await m.ensureSchema(o[t]).parse(e):e}catch(e){throw new g("Invalid payload for error "+t,{errors:e.errors.length>0?e.errors:[e]})}}throw new f(t,e)},$field:t},c=await(this._methods[e].handler||this._methods[e]).apply(h,Array.isArray(i)?i:[i]);if(a)try{return await m.ensureSchema(a).parse(c)}catch(t){throw new g("Invalid output at method "+e,{errors:t.errors.length>0?t.errors:[t]})}return c},writable:!0,enumerable:i})})}return t}async processLoaders(t,{loaders:e,state:r}){return await l(s(e),async e=>{"object"!=typeof e&&(e={type:e});const s=m.guessType(e),a=m.cloneSchema({schema:this,type:s,currentType:s,cast:!1,validate:!1});"Schema"!==s&&(a._settings=Object.assign({},a._settings,e,{loaders:void 0,cast:void 0,validate:void 0})),t=await a.parseProperty(s,t,{state:r})}),t}async parseProperty(t,e,{state:s={}}={}){if(null===e&&this.settings.allowNull)return e;if(Array.isArray(t)){let r,a=!1;return await l(t,async t=>{try{return this.currentType=t,r=await this.parseProperty(t,e,{state:s}),a=!0,!1}catch(t){}}),a||this.throwError(`Could not resolve given value type${this.fullPath?" in property "+this.fullPath:""}. Allowed types are ${t.slice(0,-1).join(", ")+" and "+t.pop()}`,{value:e}),r}const r=d[t];if(r||this.throwError(`Don't know how to resolve ${t} in property ${this.fullPath}`,{value:e}),void 0!==this.settings.default&&void 0===e&&(e="function"==typeof this.settings.default?await this.settings.default.call(this,{state:s}):this.settings.default),void 0!==e||this.settings.required){if(void 0===e&&this.settings.required){const[t,s]=p(this.settings.required,`Property ${this.fullPath} is required`);t&&this.throwError(s,{value:e})}return this.settings.loaders&&(e=await this.processLoaders(e,{loaders:this.settings.loaders,state:s})),r.loaders&&(e=await this.processLoaders(e,{loaders:r.loaders,state:s})),e=await this.runTransformer({method:"cast",transformer:this.settings,payload:e,state:s}),this.settings.autoCast&&(e=await this.runTransformer({method:"cast",transformer:r,payload:e,state:s})),await this.runTransformer({method:"validate",transformer:r,payload:e,state:s}),await this.runTransformer({method:"validate",transformer:this.settings,payload:e,state:s}),this.runTransformer({method:"parse",transformer:r,payload:e,state:s})}}async runChildren(t,{method:e="parse",state:s={}}={}){if(!this.settings.required&&void 0===t)return;const r={},a=[];if(await l(this.ownPaths,async i=>{const n=this.schemaAtPath(i.replace(/\..*$/)),o=h(t)?t[n.name]:void 0;await(async t=>{try{await t()}catch(t){t instanceof g&&t instanceof g&&t.errors.length>0?a.push(...t.errors):a.push(t)}})(async()=>{const t=await n[e](o,{state:s});void 0!==t&&Object.assign(r,{[n.name]:t})})}),a.length>0)throw new g("Data is not valid",{errors:a});return r}runTransformer({method:t,transformer:e,payload:s,state:r}){return e[t]?e[t].call(this,s,{state:r}):s}throwError(t,{errors:e,value:s}={}){throw new g(t,{errors:e,value:s,field:this})}getDefault(t){return this.parent?this.parent.getDefault(t?`${this.name}.${t}`:this.name):t?a(this._defaultValues,t):void 0}}t.Schema=m,t.Transformers=d,t.Utils=u,t.ValidationError=g,Object.defineProperty(t,"__esModule",{value:!0})}));
