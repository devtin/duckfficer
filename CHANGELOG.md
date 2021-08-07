# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [2.4.1](https://github.com/devtin/duckfficer/compare/v2.4.0...v2.4.1) (2021-08-07)


### Bug Fixes

* provides options and state to methods input ([659b854](https://github.com/devtin/duckfficer/commit/659b8541fa9fc77849ad88a06addd0eb3593b875))

## [2.4.0](https://github.com/devtin/duckfficer/compare/v2.3.0...v2.4.0) (2021-08-05)


### Features

* passes options at parse to schemaArrays ([765810d](https://github.com/devtin/duckfficer/commit/765810dbc5775e444d70d58c3567c65873d23fd0))


### Chore

* improve ci ([72383c5](https://github.com/devtin/duckfficer/commit/72383c57c9e9f2dc452489dc96677bc82322bda0))

## [2.3.0](https://github.com/devtin/duckfficer/compare/v2.2.4...v2.3.0) (2021-02-12)


### Features

* allow using a property called type ([f1f7c45](https://github.com/devtin/duckfficer/commit/f1f7c45fb8a7995f5a928d832f0ded0acf6d8d6a))


### Docs

* refactor ([23b409b](https://github.com/devtin/duckfficer/commit/23b409b019e7d2b9bd353d480175806cf37ddb16))


### Chore

* improve keywords ([6663cc5](https://github.com/devtin/duckfficer/commit/6663cc5908fe40238b34d8c31fda59ad98a2a2d5))
* **build:** prefer constants ([8337997](https://github.com/devtin/duckfficer/commit/8337997049ac78b45e3086091bff934b6003609f))

### [2.2.4](https://github.com/devtin/duckfficer/compare/v2.2.3...v2.2.4) (2021-02-11)


### Bug Fixes

* solve index issue for arrayMap ([d4eda38](https://github.com/devtin/duckfficer/commit/d4eda386308d2d4dbb43448c6a304b33dc908f31))


### Docs

* improve ([9730550](https://github.com/devtin/duckfficer/commit/97305500e25ced3d8d34e013dfb6ca964acf18ca))


### Chore

* **dependencies:** update ([4decc7a](https://github.com/devtin/duckfficer/commit/4decc7a57d6095ccaa0267e75a5ae576a08a7147))

### [2.2.3](https://github.com/devtin/duckfficer/compare/v2.2.2...v2.2.3) (2020-11-08)


### Bug Fixes

* prevent cloning settings ([b58bbc8](https://github.com/devtin/duckfficer/commit/b58bbc8d5f1c1f725608c31a8e0664bf8b13b83b))

### [2.2.2](https://github.com/devtin/duckfficer/compare/v2.2.1...v2.2.2) (2020-10-28)


### Bug Fixes

* **methods:** proper payload / state mapping ([08661dd](https://github.com/devtin/duckfficer/commit/08661ddca01a0fd1b6f2d6665949921864041461))
* **Number:** cast only when the result is a number ([8471990](https://github.com/devtin/duckfficer/commit/8471990269626c0371bc411d8fc6e85097ecd4e9))


### Chore

* update devDependencies ([b2a5e7a](https://github.com/devtin/duckfficer/commit/b2a5e7a39060a678b8ed2179041b2c8096d5cbe2))

### [2.2.1](https://github.com/devtin/duckfficer/compare/v2.2.0...v2.2.1) (2020-10-22)


### Bug Fixes

* **ValidationError.toJSON:** export field and errors ([d53c23f](https://github.com/devtin/duckfficer/commit/d53c23f9bc20638374c43b5390309b157f0be7e4))
* run cast hook even when the value is undefined ([687afc6](https://github.com/devtin/duckfficer/commit/687afc6e28322f9f61f242796b2026bc246258e7))


### Chore

* update devDependencies ([0b5ec4b](https://github.com/devtin/duckfficer/commit/0b5ec4b1ffe2dcf843ae8720727eee9a804c63a8))

## [2.2.0](https://github.com/devtin/duckfficer/compare/v2.1.1...v2.2.0) (2020-10-16)


### Features

* **String:** allowEmpty ([6bd1593](https://github.com/devtin/duckfficer/commit/6bd159337e21daa5d5e0869fe319e4c072980c8f))


### Bug Fixes

* multiple types issue where the validation (solves [#47](https://github.com/devtin/duckfficer/issues/47)) ([119eafb](https://github.com/devtin/duckfficer/commit/119eafbb38bf7de850f90515f47bd207a5e9276f))


### Chore

* **devDependencies:** update ([9f6bc88](https://github.com/devtin/duckfficer/commit/9f6bc8851b73a65499e051cbe88f4352c06423c4))

### [2.1.1](https://github.com/devtin/duckfficer/compare/v2.1.0...v2.1.1) (2020-09-15)


### Bug Fixes

* map proper _defaultValues ([a6d7ecc](https://github.com/devtin/duckfficer/commit/a6d7eccae92def812a48d064d1e31bb18ce0e170))

## [2.1.0](https://github.com/devtin/duckfficer/compare/v2.0.0...v2.1.0) (2020-09-02)


### Features

* **utils:** export PromiseEach ([4af66de](https://github.com/devtin/duckfficer/commit/4af66def4917f54181f174295c28919644a614d6))


### Bug Fixes

* multiple transformers order ([b702a65](https://github.com/devtin/duckfficer/commit/b702a6543173410c15bd7d5700748926f7bb9790))


### Docs

* **utils:** add missing descriptions ([b1d9606](https://github.com/devtin/duckfficer/commit/b1d9606050994955c3e5d9a2e6c7cca1968bdd57))

## [2.0.0](https://github.com/devtin/duckfficer/compare/v1.2.0...v2.0.0) (2020-09-02)


### ⚠ BREAKING CHANGES

* make library asynchronous
* remove Promise type as of new async flow

### Features

* make library asynchronous ([9721132](https://github.com/devtin/duckfficer/commit/972113220a7569f649ed20f20ad60765c0109f4e))


### Bug Fixes

* remove Promise type as of new async flow ([56d63f3](https://github.com/devtin/duckfficer/commit/56d63f30d0597e0158f28d11d854b983fc4aa1c6))

## [1.2.0](https://github.com/devtin/duckfficer/compare/v1.1.1...v1.2.0) (2020-08-24)


### Features

* option to turn off virtuals enumerable ([220d119](https://github.com/devtin/duckfficer/commit/220d119f43e1c553784119506bd13e50d204a712))
* option to turn on virtuals enumerable ([07c1251](https://github.com/devtin/duckfficer/commit/07c125136eff505013f66797f06c683bd0c3e3ca))

### [1.1.1](https://github.com/devtin/duckfficer/compare/v1.1.0...v1.1.1) (2020-08-24)


### Bug Fixes

* **Object.mapSchema:** do not mutate object ([8ee4b67](https://github.com/devtin/duckfficer/commit/8ee4b67222ad1d6a29584901ef69b5e1b80d3113))


### Chore

* fix docs build ([ca78a08](https://github.com/devtin/duckfficer/commit/ca78a08a7b7eb6f555ff671cad6ff97223b6ed04))
* fix docs build (trim) ([287958a](https://github.com/devtin/duckfficer/commit/287958aee0e75eca2dfc85ed5ce9f16cb34feabb))


### Docs

* prioritize schema creation ([984c888](https://github.com/devtin/duckfficer/commit/984c88816604c9036835940a59335e951c6d92d0))

## [1.1.0](https://github.com/devtin/duckfficer/compare/v1.0.0...v1.1.0) (2020-08-23)


### Features

* enumerate virtuals (solves [#44](https://github.com/devtin/duckfficer/issues/44)) ([b793c1c](https://github.com/devtin/duckfficer/commit/b793c1cfbba4211101052ccf48f3704bfa3824b4))
* js.org docs website ([7661741](https://github.com/devtin/duckfficer/commit/7661741c3ace206a9f08ba79d4b1f04c829cf359))


### Bug Fixes

* js.org favicon ([895ad4e](https://github.com/devtin/duckfficer/commit/895ad4e35911d6329693bbc8a2442d238a5598cc))


### Chore

* **dependencies:** update ([e1b2cbd](https://github.com/devtin/duckfficer/commit/e1b2cbdfd60a40a39c1a2571066b39545fb6f248))
* add duckfficer.js.org homepage ([9548ef2](https://github.com/devtin/duckfficer/commit/9548ef2b9976c8fbbe8a0105c783bb6ef5d53925))
* rename esm module extension to convention .mjs ([7595949](https://github.com/devtin/duckfficer/commit/75959496bb86780685a7872fb96816e393d8f071))


### Docs

* illustrate usage in an API environment ([e438cc8](https://github.com/devtin/duckfficer/commit/e438cc88b1e3ecf0cbd728b59963ec60857dbd37))
* improve ([10b2206](https://github.com/devtin/duckfficer/commit/10b2206ec8490d98ba5b40d898a901d231660fc4))
* improve about ([5d0d46c](https://github.com/devtin/duckfficer/commit/5d0d46ce8091d0b45dc0a487f9e85ec9c9f13fee))
* remove codepen ([fb807bc](https://github.com/devtin/duckfficer/commit/fb807bc593d246afef01fd9dde50918c68ebb5d1))
* **about:** improves ([ebada55](https://github.com/devtin/duckfficer/commit/ebada555534f352213d44265a9d984ffc2396ea8))
