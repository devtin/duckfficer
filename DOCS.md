## Classes

<dl>
<dt><a href="#Utils">Utils</a></dt>
<dd><p>Set of utilities</p>
</dd>
<dt><a href="#ValidationError">ValidationError</a></dt>
<dd><p>Thrown by <a href="#Schema">Schema</a></p>
</dd>
<dt><a href="#Schema">Schema</a></dt>
<dd><p>Orchestrates the validation of a data schema</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#Utils..castArray
Makes sure a value is wrapped in an array">Utils~castArray
Makes sure a value is wrapped in an array(v)</a> ⇒ <code>Array</code></dt>
<dd></dd>
<dt><a href="#Utils..forEach
Loops into given array alternatively breaking the look when the callback returns `false` (explicitly).">Utils~forEach
Loops into given array alternatively breaking the look when the callback returns `false` (explicitly).(arr, cb)</a></dt>
<dd></dd>
</dl>

<a name="Utils"></a>

## Utils
Set of utilities

**Kind**: global class  

* [Utils](#Utils)
    * [~obj2dot(obj, [parent], [separator])](#Utils..obj2dot) ⇒ <code>Array.&lt;String&gt;</code>
    * [~find(obj, path)](#Utils..find) ⇒ <code>\*</code>
    * [~render(template, obj)](#Utils..render)
    * [~propertiesRestricted(obj, properties, [options])](#Utils..propertiesRestricted)

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
    zip: 33129,
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
      prop3: 'Martin
    },
    firstName: 'Sandy'
  }
}

console.log(find(obj, 'prop1.prop2.prop3') // => Martin
console.log(find(obj, 'prop1.prop2.firstName') // => Sandy
```
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
    zip: 33129,
    line1: 'Brickell Ave'
  }
}

console.log(Utils.propertiesRestricted(user, ['name'])) // => false
console.log(Utils.propertiesRestricted(user, ['name', 'email', 'address'])) // => true
console.log(Utils.propertiesRestricted(user, ['name', 'email', 'address.city', 'address.zip', 'address.line1', 'address.line2'])) // => true
console.log(Utils.propertiesRestricted(user, ['name', 'email', 'address.city', 'address.zip', 'address.line1', 'address.line2'], { strict: true })) // => false
```
<a name="ValidationError"></a>

## ValidationError
Thrown by [Schema](#Schema)

**Kind**: global class  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| value | <code>\*</code> | Given value |
| field | [<code>Schema</code>](#Schema) |  |
| errors | [<code>Array.&lt;ValidationError&gt;</code>](#ValidationError) | Errors found |

<a name="Schema"></a>

## Schema
Orchestrates the validation of a data schema

**Kind**: global class  

* [Schema](#Schema)
    * [new Schema(schema, [options])](#new_Schema_new)
    * _instance_
        * [.settings](#Schema+settings)
        * [.parent](#Schema+parent)
        * [.name](#Schema+name)
        * [.ownPaths](#Schema+ownPaths)
        * [.paths](#Schema+paths)
        * [.hasField(fieldName)](#Schema+hasField) ⇒ <code>Boolean</code>
        * [.structureValidation(obj)](#Schema+structureValidation)
        * [.parse(v)](#Schema+parse) ⇒ <code>Object</code>
    * _static_
        * [.isNested(obj)](#Schema.isNested) ⇒ <code>boolean</code>
    * _inner_
        * [~SchemaModel](#Schema..SchemaModel) : <code>Object</code>

<a name="new_Schema_new"></a>

### new Schema(schema, [options])

| Param | Type | Description |
| --- | --- | --- |
| schema | <code>SchemaModel</code> |  |
| [options] | <code>Object</code> |  |
| [options.name] | <code>String</code> | Alternative name of the object |
| [options.parent] | [<code>Schema</code>](#Schema) |  |

<a name="Schema+settings"></a>

### schema.settings
**Kind**: instance property of [<code>Schema</code>](#Schema)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| settings | <code>Object</code> | Additional settings for schema |

<a name="Schema+parent"></a>

### schema.parent
**Kind**: instance property of [<code>Schema</code>](#Schema)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [parent] | [<code>Schema</code>](#Schema) | Nested objects will have a [Schema](#Schema) in this property |

<a name="Schema+name"></a>

### schema.name
**Kind**: instance property of [<code>Schema</code>](#Schema)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | Nested objects will have the name of it's containing property |

<a name="Schema+ownPaths"></a>

### schema.ownPaths
**Kind**: instance property of [<code>Schema</code>](#Schema)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| paths | <code>Array.&lt;String&gt;</code> | Contains paths |

<a name="Schema+paths"></a>

### schema.paths
**Kind**: instance property of [<code>Schema</code>](#Schema)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| paths | <code>Array.&lt;String&gt;</code> | Contains paths |

<a name="Schema+hasField"></a>

### schema.hasField(fieldName) ⇒ <code>Boolean</code>
Checks whether the schema contains given fieldName

**Kind**: instance method of [<code>Schema</code>](#Schema)  

| Param |
| --- |
| fieldName | 

<a name="Schema+structureValidation"></a>

### schema.structureValidation(obj)
Validates if the given object have a structure valid for the schema in subject

**Kind**: instance method of [<code>Schema</code>](#Schema)  
**Throws**:

- [<code>ValidationError</code>](#ValidationError) 


| Param | Type | Description |
| --- | --- | --- |
| obj | <code>Object</code> | The object to evaluate |

<a name="Schema+parse"></a>

### schema.parse(v) ⇒ <code>Object</code>
Validates schema structure and synchronous hooks of every field in the schema

**Kind**: instance method of [<code>Schema</code>](#Schema)  
**Returns**: <code>Object</code> - The sanitized object  
**Throws**:

- [<code>ValidationError</code>](#ValidationError) 


| Param | Type | Description |
| --- | --- | --- |
| v | <code>Object</code> | The object to evaluate |

<a name="Schema.isNested"></a>

### Schema.isNested(obj) ⇒ <code>boolean</code>
Checks whether a given object is a nested object

**Kind**: static method of [<code>Schema</code>](#Schema)  

| Param | Type |
| --- | --- |
| obj | <code>Object</code> | 

<a name="Schema..SchemaModel"></a>

### Schema~SchemaModel : <code>Object</code>
This object defines the desired structure of our schema. It must contain as many properties
as fields we want to validate. Each property must be either a [Field](Field) or a [Schema](#Schema) for
nested objects.

**Kind**: inner typedef of [<code>Schema</code>](#Schema)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| theFieldName | <code>SchemaModel</code> | Add as many property schemas as you need in order to build your validation model |

<a name="Utils..castArray
Makes sure a value is wrapped in an array"></a>

## Utils~castArray
Makes sure a value is wrapped in an array(v) ⇒ <code>Array</code>
**Kind**: global function  

| Param |
| --- |
| v | 

<a name="Utils..forEach
Loops into given array alternatively breaking the look when the callback returns `false` (explicitly)."></a>

## Utils~forEach
Loops into given array alternatively breaking the look when the callback returns `false` (explicitly).(arr, cb)
**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| arr | <code>Array</code> |  |
| cb | <code>function</code> | Callback function called per item in the array passing the item and index as arguments. |


* * *

### License

[MIT](https://opensource.org/licenses/MIT)

&copy; 2019 Martin Rafael <tin@devtin.io>
