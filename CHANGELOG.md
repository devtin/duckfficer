# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [2.4.6](https://github.com/devtin/schema-validator/compare/v2.4.5...v2.4.6) (2020-03-15)

### [2.4.5](https://github.com/devtin/schema-validator/compare/v2.4.4...v2.4.5) (2020-03-09)

### [2.4.4](https://github.com/devtin/schema-validator/compare/v2.4.3...v2.4.4) (2020-03-09)

### [2.4.3](https://github.com/devtin/schema-validator/compare/v2.4.2...v2.4.3) (2020-03-09)

### [2.4.2](https://github.com/devtin/schema-validator/compare/v2.4.1...v2.4.2) (2020-03-09)


### Bug Fixes

* package name ([cb4e54f](https://github.com/devtin/schema-validator/commit/cb4e54fc98f5a726efc690aca72f2434c0b34e63))
* unexpected entry in changelog ([84fcc37](https://github.com/devtin/schema-validator/commit/84fcc37d863ff389e885b5bd76bd58e061751924))

### [2.4.1](https://github.com/devtin/schema-validator/compare/v2.4.0...v2.4.1) (2020-03-07)


### Bug Fixes

* broken regex escape ([4b06e75](https://github.com/devtin/schema-validator/commit/4b06e75fd4d27544a018d94e0ded28cdce3f7892))
* **utils:** properties restricted was not behaving properly ([130cb43](https://github.com/devtin/schema-validator/commit/130cb4329c75791e03bc03ea4f2bc0015554f494))

## [2.4.0](https://github.com/devtin/schema-validator/compare/v2.3.0...v2.4.0) (2020-03-07)


### Features

* **schema:** Initial settings ([758374d](https://github.com/devtin/schema-validator/commit/758374d5d02ff520f89f02c73171ce4cf77eb775))
* **schema:** Introducing multiple allowed types ([fd26237](https://github.com/devtin/schema-validator/commit/fd26237dcd42d683504ed67c1e478db47968fb00))
* **transformer-string:** Introducing enum option ([7492768](https://github.com/devtin/schema-validator/commit/7492768e427f2843d1f2b12ce4f0b51abf5fcdd3))
* **transformers:** Introducing type Promise ([227899e](https://github.com/devtin/schema-validator/commit/227899e1f541ae983ff8da2d30a4a6580a7790b0))


### Bug Fixes

* lint issue ([4d1eb5d](https://github.com/devtin/schema-validator/commit/4d1eb5da0a696eba7c2ed9c4cebb2f6879f3a485))

## [2.3.0](https://github.com/devtin/schema-validator/compare/v2.2.0...v2.3.0) (2020-03-05)


### Features

* nested schemas ([ad55683](https://github.com/devtin/schema-validator/commit/ad556832f710bcd5984aa4edb2b315fe61e52e71))


### Bug Fixes

* add cloned flag for docs purposes ([b352c8f](https://github.com/devtin/schema-validator/commit/b352c8f2ee33a0a7c2fd628fa398101a756ec939))
* add originalName for docs purposes ([04322ae](https://github.com/devtin/schema-validator/commit/04322aec61971183463158b08a65aa78114a3924))

## [2.2.0](https://github.com/devtin/schema-validator/compare/v2.1.4...v2.2.0) (2020-03-02)


### Features

* nested schemas ([ad55683](https://github.com/devtin/schema-validator/commit/ad556832f710bcd5984aa4edb2b315fe61e52e71))

### [2.1.4](https://github.com/devtin/schema-validator/compare/v2.1.3...v2.1.4) (2020-02-10)


### Bug Fixes

* **docs:** point tests badge to /test/features directory ([cb33ace](https://github.com/devtin/schema-validator/commit/cb33ace6b53d842804c427748d0f6c5c8d880e74))
* **docs:** typo ([9314716](https://github.com/devtin/schema-validator/commit/9314716676dd90ffbacf989bdd33e2d04fd35a44))

### [2.1.3](https://github.com/devtin/schema-validator/compare/v2.1.2...v2.1.3) (2020-02-09)


### Bug Fixes

* **docs:** add link to documentation from readme ([033a890](https://github.com/devtin/schema-validator/commit/033a8903968f7f61a71acf4b662c6d64eec139ab))

### [2.1.2](https://github.com/devtin/schema-validator/compare/v2.1.1...v2.1.2) (2020-02-09)

### [2.1.1](https://github.com/devtin/schema-validator/compare/v2.1.0...v2.1.1) (2020-02-08)


### Bug Fixes

* improve documentation ([c7c3112](https://github.com/devtin/schema-validator/commit/c7c3112e93b19ece63df02220e8b417a2f6d45ac))

## [2.1.0](https://github.com/devtin/schema-validator/compare/v2.0.0...v2.1.0) (2020-02-02)


### Features

* **transformers:** add support for `BigInt` ([e34b82a](https://github.com/devtin/schema-validator/commit/e34b82a9319ee775c0269ead784bc44ba7fcb361))

## 2.0.0 (2020-02-01)


### ⚠ BREAKING CHANGES

* renaming Field to Property for consistency
* all properties are now required by default

### Features

* all properties are now required by default ([2527c41](https://github.com/devtin/schema-validator/commit/2527c41e59e2143b8909a241391388e5480708e8))
* **transformer:** add option `autoCast` possibility to be turned off ([552d984](https://github.com/devtin/schema-validator/commit/552d984470838bdc85621e6b70cb7e6896b27e53))
* **transformers:** `arraySchema` in Array transformer parses Array's items (solves [#3](https://github.com/devtin/schema-validator/issues/3)) ([c8aef3b](https://github.com/devtin/schema-validator/commit/c8aef3bf42e063afbcb2b8ff43cdeb08f1d4ec49))


### Bug Fixes

* **boilerplate:** add test directory to nodemon watch ([7468901](https://github.com/devtin/schema-validator/commit/7468901cafd05af44a840b24d623ec52424c35b8))
* **boilerplate:** includes test/features into build:all script ([8b026f3](https://github.com/devtin/schema-validator/commit/8b026f3230baf65494eb61d48ba028635b69fd3c))
* **parser:** call `default` function using the schema as `this` ([5a10133](https://github.com/devtin/schema-validator/commit/5a101336a243ca52e2a60ae7325f7bdd116b77c7))
* **parser:** default values loaded (if present) given undefined values ([2b17c42](https://github.com/devtin/schema-validator/commit/2b17c42ee6c4f1f167784551ae246d85cb8663de))
* **parser:** improves errors consistency by wrapping them all ([b553da3](https://github.com/devtin/schema-validator/commit/b553da369a30c93c46726696b1eb1734ebcecf2b))
* **parser:** required defaults to true only when default is not present ([a941aa5](https://github.com/devtin/schema-validator/commit/a941aa505ca89df91375e92915506515d3243c82))
* **parser:** required properties throw an error given undefined values ([f761d52](https://github.com/devtin/schema-validator/commit/f761d522e19870e4c03e62e6cb5b45ebfcebe59a))
* **transformers:** merge default settings ([7fc3748](https://github.com/devtin/schema-validator/commit/7fc3748b4e0ff0676f9db28e964008a0c47372a8))
* CD/CI missing patch ([af20013](https://github.com/devtin/schema-validator/commit/af20013f088d9c2f0272cb72850792c0dfd920d4))
* properties can be set to required or default; never both ([19239fa](https://github.com/devtin/schema-validator/commit/19239fa267fe45335c46777628bc0ba33d36be7e))
* renaming Field to Property for consistency ([fbc73e3](https://github.com/devtin/schema-validator/commit/fbc73e33c9b53c2e1e76a17e4d8fb512e4994a34))
* **utils:** error throwing when children property was null ([5fb7161](https://github.com/devtin/schema-validator/commit/5fb7161bb88a76243bd846443b21a62e1d6fcbac))
* **validation:** regex issue could be matching unexpected properties ([470601a](https://github.com/devtin/schema-validator/commit/470601a9476d05636233c2e98ae94eae21ccaff2))

### 1.1.6 (2020-01-22)


### Bug Fixes

* CD/CI missing patch ([af20013](https://github.com/devtin/schema-validator/commit/af20013f088d9c2f0272cb72850792c0dfd920d4))
