<p align="center"><img align="center" width="480" src="https://repository-images.githubusercontent.com/228456718/f4767e00-61e6-11ea-964a-7b02d8dcb48f"/></p>

<div align="center"><h1 align="center">@devtin/schema-validator</h1></div>

<p align="center">
{{#shields}}
{{{ . }}}
{{/shields}}
</p>

<p align="center">
Zero-dependencies, light-weight library (~{{{ libSize }}} minified + gzipped)<br>
for validating & sanitizing JavaScript data schemas.
</p>  

## Content

- [About](#about)
- [Installation](#installation)
- [At-a-glance](#at-a-glance)
- [Guide](./guide/README.md)
  {{ #index }}
  {{{ . }}}
  {{ /index }}
- [API](/DOCS.md)
- [License](#license) (MIT)

## About

Tired of performing duck-type validation while sharing data-schema across different endpoints of my beloved
JavaScript ecosystem, I took some inspiration from the [mongoose](https://mongoosejs.com)'s validation syntax and created
this light-weight library (~{{{ libSize }}} minified + gzipped) for validating & sanitizing JavaScript data schemas.

## Installation

```sh
$ npm install @devtin/schema-validator
# or
$ yarn add @devtin/schema-validator
```

## At-a-glance

```js
{{{ at-a-glance }}}
```


## Further reading

I would suggest having a look at the [guide](./guide/README.md) for advanced usage and at the [API](./DOCS.md) documentation
respectively.  

Playing with this <a href="https://codepen.io/tin_r/pen/PoqwLMb?editors=0011" target="_blank">codepen</a> may also be helpful for a
quick overview.

* * *

## License

[MIT](https://opensource.org/licenses/MIT)

&copy; 2019-2020 Martin Rafael <tin@devtin.io>
