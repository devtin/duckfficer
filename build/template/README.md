# schema-validator
{{#shields}}
{{{ . }}}
{{/shields}}

Zero-dependencies, light-weight library for validating & sanitizing JavaScript data schemas.  

- [About](#about)
- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [License](#license) (MIT)

### About

In my beloved JavaScript ecosystem, I'm constantly defining data schemas just to find myself later performing duck-type
validation and casting values to ensure data-type consistency prior proceeding with further business logic...
One day I got tired and found some inspiration on the [mongoose](https://mongoosejs.com)'s validation syntax.

### Installation

```sh
$ npm install @devtin/schema-validator
# or
$ yarn add @devtin/schema-validator
```

### Usage

```js
{{{ sandbox }}}
```

Have a look at [the docs](./DOCS.md)  
Also have a look at this [codepen](https://codepen.io/tin_r/pen/VwYbego) playground.  

### Guide

All features showcased above in this guide are taken straight from the [test/features](test/features) directory.
Mind tests are performed using <a href="https://github.com/avajs/ava" target="_blank">AVA</a>. I think the syntax is
pretty self-explanatory but in case you find yourself lost reading the examples below, maybe having a look at the
<a href="https://github.com/avajs/ava" target="_blank">AVA</a> syntax may help you get quickly on track. 

**Index**  
{{{ index }}}

{{{ schema }}}

* * *

### License

[MIT](https://opensource.org/licenses/MIT)

&copy; 2019-2020 Martin Rafael <tin@devtin.io>
