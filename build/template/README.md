<p align="center"><img align="center" width="480" src="https://repository-images.githubusercontent.com/228456718/f4767e00-61e6-11ea-964a-7b02d8dcb48f"/></p>

<div align="center"><h1 align="center">duckfficer</h1></div>

<p align="center">
{{#shields}}
{{{ . }}}
{{/shields}}
</p>

<p align="center">
Zero-dependencies, light-weight library (~{{{ libSize }}} minified + gzipped)<br>
for modeling, validating & sanitizing data
</p>

## Manifesto

Performing duck-type validation and data sanitation is not what I came to this world for... I want a utility helping me
simplify that task.

This utility must:

- Check whether certain value has the shape of a predefined schema-type
- When a given value does not match the schema, it must offer a full report of what is wrong with the given
  value vs what the schema is expecting! (see: [https://duckfficer.js.org/#/guide?id=error-handling-and-lifecycle](https://duckfficer.js.org/#/guide?id=error-handling-and-lifecycle))
- Be easy to extend and share schemas within each other (see: [https://duckfficer.js.org/#/guide?id=nesting-schemas](https://duckfficer.js.org/#/guide?id=nesting-schemas))
- Provide a built-in set of types for most common usages (see: [https://duckfficer.js.org/#/types](https://duckfficer.js.org/#/types))
- Allow custom types as well as a cast and transform hooks (see: [https://duckfficer.js.org/#/types?id=custom](https://duckfficer.js.org/#/types?id=custom))


Let's put hands on it!

**Index**

{{#readme}}
- [Installation](#installation)
- [About](#about)
- [At a glance](#at-a-glance)
- [Documentation](https://devtin.github.io/duckfficer)
{{/readme}}

## Installation

```sh
$ npm i duckfficer
# or
$ yarn add duckfficer
```

## At-a-glance

{{{ at-a-glance }}}
