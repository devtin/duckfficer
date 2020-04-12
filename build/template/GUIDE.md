## Guide

All features showcased below in this guide are taken straight from some of the tests performed in the [test](/test)
directory. Mind tests are performed using <a href="https://github.com/avajs/ava" target="_blank">AVA</a>. I think the
syntax is pretty self-explanatory but in case you find yourself lost reading the examples below, maybe having a look at
the <a href="https://github.com/avajs/ava" target="_blank">AVA</a> syntax may help you get quickly on track.

**Index**

{{ #indexWithTransformers }}
{{{ . }}}
{{ /indexWithTransformers }}

{{{ guide }}}


## Life-cycle

- [Schema.parse](/DOCS.md#Schema+parse)
  - parses [loaders](#Loaders) (if any given in the [SchemaSetting](/DOCS.md#Schema..SchemaSettings))
  - apply specified [transformer](/DOCS.md#Transformers)
  - runs local [cast](/DOCS.md#Caster) hook
  - runs transformer [cast](/DOCS.md#Caster) hook
  - runs transformer [validate](/DOCS.md#Validator) hook
  - runs local [validate](/DOCS.md#Validator) hook
  - runs transformer [parse](/DOCS.md#Parser) hook 

## Transformers

Transformers have their own section. See [TRANSFORMERS.md](./TRANSFORMERS.md)

{{ #loaders }}
{{{ . }}}
{{ /loaders }}

* * *

### License

[MIT](https://opensource.org/licenses/MIT)

&copy; 2019-2020 Martin Rafael <tin@devtin.io>
