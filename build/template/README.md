# schema-validator
{{#shields}}
{{{ . }}}
{{/shields}}

Zero-dependencies, light-weight library for validating & sanitizing JavaScript data schemas.  

- [About](#about)
- [Installation](#installation)
- [At-a-glance](#at-a-glance)
- [Guide](#guide)
  {{ #index }}
  {{{ . }}}
  {{ /index }}
  - [Transformers](#transformers)
    {{ #transformersIndex }}
    {{{ . }}}
    {{ /transformersIndex }}
  - [Hooks](#hooks)
  - [Loaders](#loaders)
- [License](#license) (MIT)

## About

One day I got tired of performing duck-type validation as I shared entity-data across different endpoints of my beloved
JavaScript ecosystem. This library is initially inspired in [mongoose](https://mongoosejs.com)'s validation syntax. 

## Installation

```sh
$ npm install @devtin/schema-validator
# or
$ yarn add @devtin/schema-validator
```

## At-a-glance

```js
{{{ sandbox }}}
```

I would suggest having a look at [the guide](#guide) and [the docs](./DOCS.md) respectively.  
Maybe also playing with this [codepen](https://codepen.io/tin_r/pen/VwYbego) for a quick overview.

## Guide

All features showcased above in this guide are taken straight from some of the tests performed in the [test](test)
directory. Mind tests are performed using <a href="https://github.com/avajs/ava" target="_blank">AVA</a>. I think the
syntax is pretty self-explanatory but in case you find yourself lost reading the examples below, maybe having a look at
the <a href="https://github.com/avajs/ava" target="_blank">AVA</a> syntax may help you get quickly on track. 

{{ #index }}
{{{ . }}}
{{ /index }}

{{{ guide }}}

## Transformers

Transformers are the ones validating, casting and parsing all property-types defined in the schema.

{{ #transformersIndex }}
{{{ . }}}
{{ /transformersIndex }}

{{ #transformers }}
{{{ . }}}
{{ /transformers }}

## Hooks

Hooks spread the schema functionality by allowing to compute custom logic
during different points of the parsing lifecycle.

{{ #hooks }}
{{{ . }}}
{{ /hooks }}

## Loaders

Loaders could be seen as a transformer extending other transformer's functionality.

{{ #loaders }}
{{{ . }}}
{{ /loaders }}

* * *

## License

[MIT](https://opensource.org/licenses/MIT)

&copy; 2019-2020 Martin Rafael <tin@devtin.io>
