## Classes

<dl>
<dt><a href="#Utils">Utils</a></dt>
<dd><p>Set of utilities</p>
</dd>
<dt><a href="#Schema">Schema</a></dt>
<dd><p>Orchestrates the validation of a data schema</p>
</dd>
</dl>

## Constants

<dl>
<dt><a href="#Transformers">Transformers</a> : <code>Object</code></dt>
<dd><p>key map object that holds the available Transformer&#39;s (types) that can be validated.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#PromiseEach">PromiseEach(arr, fn, [breakOnFalse])</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd><p>Loops through given <code>arr</code> of functions, awaiting for each result, alternatively breaking the loop when <code>breakOnFalse</code>
equals <code>true</code> and one of the functions returns <code>false</code> explicitly.</p>
</dd>
<dt><a href="#PromiseMap">PromiseMap(arr, fn, [breakOnFalse])</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>Loops through given <code>arr</code> of functions, awaiting for each result.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#ValueError">ValueError</a> : <code>Array</code></dt>
<dd><p>Used as value in certain settings to alternatively customize error messages</p>
</dd>
<dt><a href="#Validator">Validator</a> ⇒ <code>void</code></dt>
<dd><p>function (async permitted) that validates that given value is of the expected kind. Throws a <a href="#Schema..ValidationError">ValidationError</a> when not.</p>
</dd>
<dt><a href="#Parser">Parser</a> ⇒ <code>*</code></dt>
<dd><p>function (async permitted) that performs custom logic possibly customized via settings that could transform given
value, throwing a {Schema~ValidationError} when error.</p>
</dd>
<dt><a href="#Caster">Caster</a> ⇒ <code>*</code></dt>
<dd><p>function (async permitted) that performs some logic attempting to cast given value into expected one. Returns the
original value in case it could not be guessed.</p>
</dd>
<dt><a href="#Transformer">Transformer</a> : <code>Object</code></dt>
<dd><p>A transformer holds the logic of instantiating a data type (casting, validation and parsing).</p>
</dd>
<dt><a href="#Method">Method</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#virtual">virtual</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="Utils"></a>

## Utils
Set of utilities

**Kind**: global class  

* [Utils](#Utils)
    * [~castArray(value)](#Utils..castArray) ⇒ <code>Array</code>
    * [~obj2dot(obj, [parent], [separator])](#Utils..obj2dot) ⇒ <code>Array.&lt;String&gt;</code>
    * [~find(obj, path)](#Utils..find) ⇒ <code>\*</code>
    * [~forEach(arr, cb)](#Utils..forEach)
    * [~render(template, obj)](#Utils..render)
    * [~propertiesRestricted(obj, properties, [options])](#Utils..propertiesRestricted)
    * [~castThrowable(value, error)](#Utils..castThrowable) ⇒ [<code>ValueError</code>](#ValueError)

<a name="Utils..castArray"></a>

### Utils~castArray(value) ⇒ <code>Array</code>
Makes sure a value is wrapped in an array

**Kind**: inner method of [<code>Utils</code>](#Utils)  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>\*</code> | The value to wrap in an array. If the value is already an array, it is returned as is. |

<a name="Utils..obj2dot"></a>

### Utils~obj2dot(obj, [parent], [separator]) ⇒ <code>Array.&lt;String&gt;</code>
Converts given object's own properties tree in a dot notation array

**Kind**: inner method of [<code>Utils</code>](#Utils)  

| Param | Type | Default |
| --- | --- | --- |
| obj | <code>Object</code> |  | 
| [parent] | <code>String</code> |  | 
| [separator] | <code>String</code> | <code>.</code> | 

**Example**  
```js
Utils.obj2dot({
  name: 'Martin',
  address: {
    city: 'Miami',
    zip: 305,
    line1: 'Brickell ave'
  }
}) // => ['name', 'address.city', 'address.zip', 'address.line1']
```
<a name="Utils..find"></a>

### Utils~find(obj, path) ⇒ <code>\*</code>
Deeply finds given dot-notation path of an objects

**Kind**: inner method of [<code>Utils</code>](#Utils)  
**Returns**: <code>\*</code> - Found value  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>Object</code> |  |
| path | <code>String</code> | Dot-notation address of the desired property |

**Example**  
```js
const obj = {
  prop1: {
    prop2: {
      prop3: 'Martin'
    },
    firstName: 'Sandy'
  }
}

console.log(find(obj, 'prop1.prop2.prop3') // => Martin
console.log(find(obj, 'prop1 .firstName') // => Sandy
```
<a name="Utils..forEach"></a>

### Utils~forEach(arr, cb)
Loops into given array alternatively breaking the look when the callback returns `false` (explicitly).

**Kind**: inner method of [<code>Utils</code>](#Utils)  

| Param | Type | Description |
| --- | --- | --- |
| arr | <code>Array</code> |  |
| cb | <code>function</code> | Callback function called per item in the array passing the item and index as arguments. |

<a name="Utils..render"></a>

### Utils~render(template, obj)
Renders handle bars kind-of semantics

**Kind**: inner method of [<code>Utils</code>](#Utils)  

| Param | Type | Description |
| --- | --- | --- |
| template | <code>String</code> | Handlebars single-bar template |
| obj | <code>Object</code> |  |

**Example**  
```js
const obj = {
  address: {
    line1: 'Brickell Ave'
  }
}

console.log(render(`{ address.line1 }`)) // => 'Brickell Ave'
```
<a name="Utils..propertiesRestricted"></a>

### Utils~propertiesRestricted(obj, properties, [options])
Validates that given `obj`'s properties exists in `properties`.

**Kind**: inner method of [<code>Utils</code>](#Utils)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| obj | <code>Object</code> |  | The object to analyze |
| properties | <code>Array.&lt;String&gt;</code> |  | Properties to validate |
| [options] | <code>Object</code> |  |  |
| [options.strict] | <code>Boolean</code> | <code>false</code> | When set to `true`, validates that `obj` actually has all `properties`. |

**Example**  
```js
const user = {
  name: 'Martin Rafael',
  email: 'tin@devtin.io',
  address: {
    city: 'Miami, Fl',
    zip: 305,
    line1: 'Brickell Ave'
  }
}

console.log(Utils.propertiesRestricted(user, ['name'])) // => false
console.log(Utils.propertiesRestricted(user, ['name', 'email', 'address'])) // => true
console.log(Utils.propertiesRestricted(user, ['name', 'email', 'address.city', 'address.zip', 'address.line1', 'address.line2'])) // => true
console.log(Utils.propertiesRestricted(user, ['name', 'email', 'address.city', 'address.zip', 'address.line1', 'address.line2'], { strict: true })) // => false
```
<a name="Utils..castThrowable"></a>

### Utils~castThrowable(value, error) ⇒ [<code>ValueError</code>](#ValueError)
**Kind**: inner method of [<code>Utils</code>](#Utils)  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>\*</code> \| [<code>ValueError</code>](#ValueError) | The value |
| error | <code>String</code> | Default error message |

<a name="Schema"></a>

## Schema
Orchestrates the validation of a data schema

**Kind**: global class  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [parent] | [<code>Schema</code>](#Schema) | Nested objects will have a [Schema](#Schema) in this property |
| name | <code>String</code> | Nested objects will have the name of it's containing property |
| schema | [<code>SchemaSettings</code>](#Schema..SchemaSettings) | The schema |


* [Schema](#Schema)
    * [new Schema(schema, [options])](#new_Schema_new)
    * _instance_
        * [.paths](#Schema+paths)
        * [.isValid(obj)](#Schema+isValid) ⇒ <code>Boolean</code>
        * [.schemaAtPath(pathName)](#Schema+schemaAtPath) ⇒ [<code>Schema</code>](#Schema) \| [<code>Array.&lt;Schema&gt;</code>](#Schema)
        * [.hasField(fieldName, [deep])](#Schema+hasField) ⇒ <code>Boolean</code>
        * [.structureValidation(obj)](#Schema+structureValidation)
        * [.parse([v], [options])](#Schema+parse) ⇒ <code>Object</code>
        * [.processLoaders(v, loaders, state)](#Schema+processLoaders) ⇒ <code>\*</code>
        * [.runTransformer(method, transformer, [options], payload, [state])](#Schema+runTransformer) ⇒ <code>\*</code>
    * _static_
        * [.isNested(obj)](#Schema.isNested) ⇒ <code>boolean</code>
    * _inner_
        * [~ValidationError](#Schema..ValidationError)
        * [~MethodError](#Schema..MethodError)
        * [~TheSchema](#Schema..TheSchema) : <code>Object</code>
        * [~SchemaSettings](#Schema..SchemaSettings) : <code>Object</code>

<a name="new_Schema_new"></a>

### new Schema(schema, [options])
Sets the environment up:
- Stores the schema locally
- Guesses the type of the schema


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| schema | [<code>TheSchema</code>](#Schema..TheSchema) \| <code>Object</code> \| <code>Array</code> |  |  |
| [options] | <code>Object</code> |  |  |
| [options.name] | <code>String</code> |  | Alternative name of the object |
| [options.defaultValues] | <code>Object</code> |  | Default values to override the schema with |
| [options.methods] | [<code>Method</code>](#Method) |  |  |
| [options.parent] | [<code>Schema</code>](#Schema) |  |  |
| [options.cast] | [<code>Caster</code>](#Caster) |  | Schema caster |
| [options.settings] | <code>Object</code> |  | Initial settings |
| [options.validate] | [<code>Validator</code>](#Validator) |  | Final validation |
| [options.stripUnknown] | <code>Boolean</code> | <code>false</code> | Removes unknown properties at parse |

<a name="Schema+paths"></a>

### schema.paths
**Kind**: instance property of [<code>Schema</code>](#Schema)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| paths | <code>Array.&lt;String&gt;</code> | Contains paths |

<a name="Schema+isValid"></a>

### schema.isValid(obj) ⇒ <code>Boolean</code>
Checks whether given obj is valid compared to the schema

**Kind**: instance method of [<code>Schema</code>](#Schema)  
**Returns**: <code>Boolean</code> - whether the obj is valid or not  

| Param |
| --- |
| obj | 

<a name="Schema+schemaAtPath"></a>

### schema.schemaAtPath(pathName) ⇒ [<code>Schema</code>](#Schema) \| [<code>Array.&lt;Schema&gt;</code>](#Schema)
Finds schema in given path

**Kind**: instance method of [<code>Schema</code>](#Schema)  

| Param | Type | Description |
| --- | --- | --- |
| pathName | <code>String</code> | Dot notation path |

<a name="Schema+hasField"></a>

### schema.hasField(fieldName, [deep]) ⇒ <code>Boolean</code>
Checks whether the schema contains given fieldName

**Kind**: instance method of [<code>Schema</code>](#Schema)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| fieldName |  |  |  |
| [deep] | <code>Boolean</code> | <code>false</code> | whether to validate the path deeply |

<a name="Schema+structureValidation"></a>

### schema.structureValidation(obj)
Validates if the given object have a structure valid for the schema in subject

**Kind**: instance method of [<code>Schema</code>](#Schema)  
**Throws**:

- [<code>ValidationError</code>](#Schema..ValidationError) when the object does not match the schema


| Param | Type | Description |
| --- | --- | --- |
| obj | <code>Object</code> | The object to evaluate |

<a name="Schema+parse"></a>

### schema.parse([v], [options]) ⇒ <code>Object</code>
Validates schema structure, casts, validates and parses  hooks of every field in the schema

**Kind**: instance method of [<code>Schema</code>](#Schema)  
**Returns**: <code>Object</code> - The sanitized object  
**Throws**:

- <code>ValidationError</code> when given object does not meet the schema


| Param | Type | Description |
| --- | --- | --- |
| [v] | <code>Object</code> | The object to evaluate |
| [options] | <code>Object</code> |  |
| [options.state] | <code>Object</code> | State to pass through the lifecycle |
| [options.virtualsEnumerable] | <code>Boolean</code> | whether to set virtuals enumerable |

<a name="Schema+processLoaders"></a>

### schema.processLoaders(v, loaders, state) ⇒ <code>\*</code>
**Kind**: instance method of [<code>Schema</code>](#Schema)  

| Param | Type |
| --- | --- |
| v | <code>\*</code> | 
| loaders | [<code>Array.&lt;SchemaSettings&gt;</code>](#Schema..SchemaSettings) | 
| state | <code>\*</code> | 

<a name="Schema+runTransformer"></a>

### schema.runTransformer(method, transformer, [options], payload, [state]) ⇒ <code>\*</code>
Runs given method found in transformer

**Kind**: instance method of [<code>Schema</code>](#Schema)  

| Param | Type |
| --- | --- |
| method |  | 
| transformer |  | 
| [options] | <code>Object</code> | 
| payload | <code>\*</code> | 
| [state] | <code>Object</code> | 

<a name="Schema.isNested"></a>

### Schema.isNested(obj) ⇒ <code>boolean</code>
Checks whether a given object is a nested object

**Kind**: static method of [<code>Schema</code>](#Schema)  

| Param | Type |
| --- | --- |
| obj | <code>Object</code> | 

<a name="Schema..ValidationError"></a>

### Schema~ValidationError
Thrown by [Schema](#Schema)

**Kind**: inner class of [<code>Schema</code>](#Schema)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| value | <code>\*</code> | Given value |
| field | [<code>Schema</code>](#Schema) |  |
| errors | [<code>Array.&lt;ValidationError&gt;</code>](#Schema..ValidationError) | Errors found |

<a name="Schema..MethodError"></a>

### Schema~MethodError
**Kind**: inner class of [<code>Schema</code>](#Schema)  
**Properties**

| Name | Type |
| --- | --- |
| errorName | <code>String</code> | 
| payload | <code>\*</code> | 

<a name="Schema..TheSchema"></a>

### Schema~TheSchema : <code>Object</code>
This object defines the schema or desired structure of an arbitrary object.

**Kind**: inner typedef of [<code>Schema</code>](#Schema)  
**Example**  
```js
const MySchemaStructure = {
  name: String,
  email: String,
  address: {
    zip: Number,
    street: String
  }
}
```
<a name="Schema..SchemaSettings"></a>

### Schema~SchemaSettings : <code>Object</code>
This object describes the settings of a schema-property and serves as a host to hold possible other settings
belonging to its correspondent transformer.

**Kind**: inner typedef of [<code>Schema</code>](#Schema)  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| type | <code>String</code> |  | Name of the available [Transformers](#Transformers) to use to process the value. |
| [required] | <code>Boolean</code> | <code>true</code> | Whether the property is or not required. |
| [allowNull] | <code>Boolean</code> | <code>false</code> | Whether the allow null values or not. |
| [cast] | [<code>Caster</code>](#Caster) |  | An (optional) additional caster |
| [validate] | [<code>Validator</code>](#Validator) |  | An (optional) additional validator |
| [default] | <code>function</code> \| <code>\*</code> |  | Default value when non-passed. Mind this will treat properties as `required=false`. When a function is given, its called using the schema of the property as its `this` object, receiving given value as first argument. Must return the desired default value. |

**Example**  
```js
new Schema({
  // when an SchemaSetting is an object it will have a property named `type`.
  name: {
    type: String, // < it is a SchemaSetting since it has a property called type
    validate (value) {
      if (/^[a-z]/.test(value)) {
        throw new Error(`Start your name in uppercase, please`)
      }
    }
  }
})
```
<a name="Transformers"></a>

## Transformers : <code>Object</code>
key map object that holds the available Transformer's (types) that can be validated.

**Kind**: global constant  

* [Transformers](#Transformers) : <code>Object</code>
    * [.Array](#Transformers.Array) : [<code>Transformer</code>](#Transformer)
    * [.BigInt](#Transformers.BigInt) : [<code>Transformer</code>](#Transformer)
    * [.Boolean](#Transformers.Boolean) : [<code>Transformer</code>](#Transformer)
    * [.Date](#Transformers.Date) : [<code>Transformer</code>](#Transformer)
    * [.Function](#Transformers.Function) : [<code>Transformer</code>](#Transformer)
    * [.Map](#Transformers.Map) : [<code>Transformer</code>](#Transformer)
    * [.Number](#Transformers.Number) : [<code>Transformer</code>](#Transformer)
    * [.Object](#Transformers.Object) : [<code>Transformer</code>](#Transformer)
    * [.Set](#Transformers.Set) : [<code>Transformer</code>](#Transformer)
    * [.String](#Transformers.String) : [<code>Transformer</code>](#Transformer)

<a name="Transformers.Array"></a>

### Transformers.Array : [<code>Transformer</code>](#Transformer)
**Kind**: static constant of [<code>Transformers</code>](#Transformers)  
**See**: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| settings | <code>Object</code> |  | Default transformer settings |
| [settings.typeError] | <code>String</code> | <code>Invalid array</code> | Default error message thrown |
| [settings.arraySchema] | <code>SchemaSettings</code> |  | Alternatively initializes (which involves validating, casting and parsing) array items using given schema. |
| parse | [<code>Parser</code>](#Parser) |  | Alternatively instantiates array items given an `arraySchema`. |
| validate | [<code>Validator</code>](#Validator) |  | Validates that given value is an array |

<a name="Transformers.BigInt"></a>

### Transformers.BigInt : [<code>Transformer</code>](#Transformer)
**Kind**: static constant of [<code>Transformers</code>](#Transformers)  
**See**: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| settings | <code>Object</code> |  | Default transformer settings |
| [settings.typeError] | <code>String</code> | <code>Invalid bigint</code> | Default error message thrown |
| [settings.autoCast] | <code>Boolean</code> | <code>false</code> | Whether to automatically cast values or not |
| validate | [<code>Validator</code>](#Validator) |  | Confirms given value is a `BigInt` |
| cast | [<code>Caster</code>](#Caster) |  | Converts `String`s and `Number`s into `BigInt` (if possible) |

<a name="Transformers.Boolean"></a>

### Transformers.Boolean : [<code>Transformer</code>](#Transformer)
**Kind**: static constant of [<code>Transformers</code>](#Transformers)  
**See**: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| settings | <code>Object</code> |  | Default transformer settings |
| [settings.typeError] | <code>String</code> | <code>Invalid boolean</code> | Default error message thrown |
| [settings.autoCast] | <code>Boolean</code> | <code>false</code> | Whether to auto-cast truthy values into `true` and falsy ones into `false`. |
| cast | [<code>Caster</code>](#Caster) |  | Casts truthy values into `true` and falsy ones into `false` |
| validate | [<code>Validator</code>](#Validator) |  | Confirms given value is a `Boolean`. |

<a name="Transformers.Date"></a>

### Transformers.Date : [<code>Transformer</code>](#Transformer)
**Kind**: static constant of [<code>Transformers</code>](#Transformers)  
**See**: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| settings | <code>Object</code> |  | Default transformer settings |
| [settings.typeError] | <code>String</code> | <code>Invalid date</code> | Default error message thrown |
| [settings.autoCast] | <code>Boolean</code> | <code>true</code> |  |
| cast | [<code>Caster</code>](#Caster) |  | Casts `String`s into `Date`'s when possible |
| validate | [<code>Validator</code>](#Validator) |  | Validates given value is a `Date` |

<a name="Transformers.Function"></a>

### Transformers.Function : [<code>Transformer</code>](#Transformer)
**Kind**: static constant of [<code>Transformers</code>](#Transformers)  
**See**: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| settings | <code>Object</code> |  | Default transformer settings |
| [settings.typeError] | <code>String</code> | <code>Invalid function</code> | Default error message thrown |
| validate | [<code>Validator</code>](#Validator) |  | Validates given value is a `Function` |

<a name="Transformers.Map"></a>

### Transformers.Map : [<code>Transformer</code>](#Transformer)
**Kind**: static constant of [<code>Transformers</code>](#Transformers)  
**See**: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| settings | <code>Object</code> |  | Default transformer settings |
| [settings.typeError] | <code>String</code> | <code>Invalid map</code> | Default error message thrown |
| [settings.autoCast] | <code>Boolean</code> | <code>true</code> | Whether to auto-cast `Object`'s into `Map`'s. |
| cast | [<code>Caster</code>](#Caster) |  | Casts `Object` into `Map` |
| validate | [<code>Validator</code>](#Validator) |  | Validates given values is a `Map` |

<a name="Transformers.Number"></a>

### Transformers.Number : [<code>Transformer</code>](#Transformer)
**Kind**: static constant of [<code>Transformers</code>](#Transformers)  
**See**: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| settings | <code>Object</code> |  | Default transformer settings |
| [settings.typeError] | <code>String</code> | <code>Invalid number</code> | Default error message thrown |
| [settings.minError] | <code>String</code> | <code>minimum accepted value is { value }</code> | Error message thrown for minimum values |
| [settings.maxError] | <code>String</code> | <code>maximum accepted value is { value }</code> | Error message thrown for maximum values |
| [settings.integerError] | <code>String</code> | <code>Invalid integer</code> |  |
| [settings.min] | <code>String</code> |  | Minimum value accepted |
| [settings.max] | <code>String</code> |  | Maximum value accepted |
| [settings.integer] | <code>String</code> |  | Whether to only accept integers or not |
| [settings.decimalPlaces] | <code>String</code> |  | Maximum decimal places to display |
| [settings.autoCast] | <code>Boolean</code> | <code>false</code> | Whether to auto-cast `String`'s with numeric values. |
| cast | [<code>Caster</code>](#Caster) |  | Tries to cast given value into a `Number` |
| validate | [<code>Validator</code>](#Validator) |  | Validates given value is a `Number` |

<a name="Transformers.Object"></a>

### Transformers.Object : [<code>Transformer</code>](#Transformer)
**Kind**: static constant of [<code>Transformers</code>](#Transformers)  
**See**: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| settings | <code>Object</code> |  | Default transformer settings |
| [settings.typeError] | <code>String</code> | <code>Invalid object</code> | Default error message thrown |
| [settings.mapSchema] | <code>String</code> \| [<code>Schema</code>](#Schema) |  | When available, parses given object's properties with the given schema or transformer. |
| validate | [<code>Validator</code>](#Validator) |  | Confirms given value is an object |

<a name="Transformers.Set"></a>

### Transformers.Set : [<code>Transformer</code>](#Transformer)
**Kind**: static constant of [<code>Transformers</code>](#Transformers)  
**See**: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| settings | <code>Object</code> |  | Default transformer settings |
| [settings.typeError] | <code>String</code> | <code>Invalid set</code> | Default error message thrown |
| [settings.autoCast] | <code>Boolean</code> | <code>true</code> | Whether to auto-cast `Array`'s into `Set`'s. |
| cast | [<code>Caster</code>](#Caster) |  | Casts `Array` into `Set` |
| validate | [<code>Validator</code>](#Validator) |  | Validates given values is a `Set` |

<a name="Transformers.String"></a>

### Transformers.String : [<code>Transformer</code>](#Transformer)
**Kind**: static constant of [<code>Transformers</code>](#Transformers)  
**See**: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| settings | <code>Object</code> |  | Default transformer settings |
| [settings.typeError] | <code>String</code> | <code>Invalid string</code> | Default error message thrown |
| [settings.enumError] | <code>String</code> | <code>Invalid enum option { value }</code> | Default error message thrown |
| [settings.enum] | <code>Array.&lt;String&gt;</code> |  | Whether to restrict allowed values to given sample. |
| [settings.autoCast] | <code>Boolean</code> | <code>false</code> | Whether to auto-cast objects with method `toString`. |
| [settings.minlength] | <code>Number</code> \| [<code>ValueError</code>](#ValueError) |  | Optional minimum length |
| [settings.maxlength] | <code>Number</code> \| [<code>ValueError</code>](#ValueError) |  | Optional maximum length |
| [settings.regex] | <code>RegExp</code> \| [<code>ValueError</code>](#ValueError) |  | Optional RegExp to match against given string |
| [settings.lowercase] | <code>Boolean</code> |  | Optionally convert input string into lowercase |
| [settings.uppercase] | <code>Boolean</code> |  | Optionally convert input string into uppercase |
| cast | [<code>Caster</code>](#Caster) |  | Basically checks if a value is an object and this object has the method `toString`. If so, calls the method and checks returning value does not look like `[object Object]`; if so, returns whatever value was returned by the method. |
| validate | [<code>Validator</code>](#Validator) |  | Validates given value is a `String`. Additionally, performs built-in validations: minlength, maxlength and regex. |

<a name="PromiseEach"></a>

## PromiseEach(arr, fn, [breakOnFalse]) ⇒ <code>Promise.&lt;void&gt;</code>
Loops through given `arr` of functions, awaiting for each result, alternatively breaking the loop when `breakOnFalse`
equals `true` and one of the functions returns `false` explicitly.

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| arr | <code>Array.&lt;function()&gt;</code> |  |  |
| fn | <code>function</code> |  | callback function to pass iterated items |
| [breakOnFalse] | <code>Boolean</code> | <code>false</code> | whether to stop the loop when false (explicitly) returned |

<a name="PromiseMap"></a>

## PromiseMap(arr, fn, [breakOnFalse]) ⇒ <code>Promise.&lt;Array&gt;</code>
Loops through given `arr` of functions, awaiting for each result.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - - array of results  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| arr | <code>Array.&lt;function()&gt;</code> |  |  |
| fn | <code>function</code> |  | callback function to pass iterated items |
| [breakOnFalse] | <code>Boolean</code> | <code>false</code> | whether to stop the loop when false (explicitly) returned |

<a name="ValueError"></a>

## ValueError : <code>Array</code>
Used as value in certain settings to alternatively customize error messages

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| 0 | <code>\*</code> | The value |
| 1 | <code>String</code> | Alternative error message |

**Example**  
```js
const ValueError = [3, `username's must have at least three characters`]
const mySchema = new Schema({
  username: {
    type: String,
    minlength: ValueError
  }
})
```
<a name="Validator"></a>

## Validator ⇒ <code>void</code>
function (async permitted) that validates that given value is of the expected kind. Throws a [ValidationError](#Schema..ValidationError) when not.

**Kind**: global typedef  
**Throws**:

- Schema~ValidationError

**this**: <code>{Schema}</code>  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>\*</code> | The value being validated |
| [options] | <code>Object</code> |  |
| [options.state] | <code>\*</code> | The state passed via the parse function |

<a name="Parser"></a>

## Parser ⇒ <code>\*</code>
function (async permitted) that performs custom logic possibly customized via settings that could transform given
value, throwing a {Schema~ValidationError} when error.

**Kind**: global typedef  
**Returns**: <code>\*</code> - Resulting value  
**Throws**:

- Schema~ValidationError

**this**: <code>{Schema}</code>  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>\*</code> | The value being validated |
| [options] | <code>Object</code> |  |
| [options.state] | <code>\*</code> | The state passed via the parse function |

<a name="Caster"></a>

## Caster ⇒ <code>\*</code>
function (async permitted) that performs some logic attempting to cast given value into expected one. Returns the
original value in case it could not be guessed.

**Kind**: global typedef  
**Returns**: <code>\*</code> - Resulting value  
**this**: <code>{Schema}</code>  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>\*</code> | The value being casted |
| [options] | <code>Object</code> |  |
| [options.state] | <code>\*</code> | The state passed via the parse function |

<a name="Transformer"></a>

## Transformer : <code>Object</code>
A transformer holds the logic of instantiating a data type (casting, validation and parsing).

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [settings] | <code>Object</code> | Initial transformer settings |
| [cast] | [<code>Caster</code>](#Caster) | Cast function |
| [parse] | [<code>Parser</code>](#Parser) | Parser function |
| [validate] | [<code>Validator</code>](#Validator) | Validator function |
| [loaders] | <code>Array.&lt;String&gt;</code> | Transformer names to pipe the value through prior handling it with the parser function. |

<a name="Method"></a>

## Method : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| input | [<code>Schema</code>](#Schema) \| <code>Object</code> | method input payload validation |
| output | [<code>Schema</code>](#Schema) \| <code>Object</code> | method output payload validation |
| handler | <code>function</code> | function to be called (this arg is the value of the object) |

<a name="virtual"></a>

## virtual : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| get | <code>function</code> | 
| set | <code>function</code> | 


* * *

### License

[MIT](https://opensource.org/licenses/MIT)

&copy; 2019-2020 Martin Rafael <tin@devtin.io>
