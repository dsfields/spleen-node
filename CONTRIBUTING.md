# Contributing

To contribute:

1. Fork this repository.
2. Clone your branch.
3. Run `$ node install` from the project's root folder.
4. Make your changes.
5. Validate by running `$ npm test` and then `$ npm run lint`.
6. Document your changes in the CHANGELOG and README.
7. Create a pull request into the `master` branch.

Contributions are welcome as long as the guidelines outlined below are followed.  Failure to satisfy all guidelines will result in rejection.

* All modifications must be made via pull request.

* All updates must update the version number according to the [semver](http://semver.org/) guideline.

* All updates must include a description of the changes in the [Change Log](CHANGELOG.md).

* All changes to the core module code must include proper test coverage.  Tests must reach 100% code coverage.

* The linter rules defined in the project CANNOT be modified.

* All code must satisfy all linter rules.

* Disabling the linter for blocks of code with an eslint-disable directive is forbidden. 

* Any pull request that breaks the build will be immediately rejected and closed.  Failure to have 100% test coverage and linter compliance will break the build.

The `spleen` project is governed using a benevolant dictatorship model.  All pull requests are subject to approval and rejection at the discretion of the project owner.  It is recommend that you open an Issue, and discuss changes before spending time on a pull request that may end up being rejected.
