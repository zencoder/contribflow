# contribflow [![Build Status](https://secure.travis-ci.org/zencoder/contribflow.png?branch=master)](http://travis-ci.org/zencoder/contribflow)

Contribflow is a suite of high-level repository operations for making open source contributions easier.

## Getting Started
Install the module with: `npm install contribflow`

```javascript
var contribflow = require('contribflow');
contribflow.awesome(); // "awesome"
```

It's based on the [Gitflow](http://nvie.com/posts/a-successful-git-branching-model/) branching model, however some of the branches are named differently.

- GitFlow:develop = ContribFlow:master
- GitFlow:master = ContribFlow:stable

The master branch is used for feature development and the stable branch is used to publish/deploy your code. This change is partly because pull requests from contributors are more likely to happen against master by default. (Though branch names could be made configurable)

Otherwise the branching model is the same as gitflow.
- Feature branches are used to create features and any non-urgent fixes or changes. They start from the master branch as a base and when completed they are merged into master. They will be published/deployed with the next minor release (e.g. 4.1)
- Hotfix branches are used to create changes that should be released immediately as a patch (e.g. 4.1.1). They start from the stable brach as a base and when finished they are merged into both stable and master.
- Release branches are used to define and test the release of a major/minor new version (e.g. 4 or 4.1). They start from the master branch as a base, go through some level of additional testing and fixes, and once accepted they are merged into stable (and back into master in case additional fixes were made).

## contributor commands

Each contrib-flow command will run a series of git or github commands, and may prompt the user for more info. All git commands are printed as they are run, to encourage learning of the underlying git process.

### features
(from the perspective of a contributor)

When starting a feature you run the command:

    grunt feature:start

First, this will ask you to name your new feature (please use only letters, numbers and dashes). Next, it will run a series of git commands to create a new feature branch named "feature/[name-of-feature]." You'll work in this branch, creating git commits as needed, until you're ready to submit a pull request to the upstream project. At this point you'll run:

    grunt feature:submit

This will create a pull request from your feature branch to the master branch of the upstream project.

At this point the project owner may ask you to make changes. To update your pull request you simply make the changes, commit them and `git push` them up to the remote copy of your feature branch (remote tracking of the branch is set up when you start the feature). This will update your pull request.

Once the owner has accepted your pull request, you should clean up your feature branch.
PLEASE NOTE: THIS WILL DELETE YOUR COPIES OF THE FEATURE. This is meant to clean up your local and remote branches, so make sure any changes you don't want to lose have been pulled into the parent project or another branch first.

Run the command:

    grunt feature:delete

#### project owner commands
(from the perpsective of the owner)

When a pull request comes in, you can run the command

    grunt feature:test:[PID]

PID represents the github pull request ID. This will make a copy of the contributors branch in your local repo, so you can do further testing.

If you approve of the changes, you can run

    grunt feature:accept:[PID]

You can exclude the PID if you already have the copied feature branch checked out. This will merge the pull request into the master branch using Jon Resig's [Pulley](https://github.com/jeresig/pulley), a pull request lander that cleans up commits within a pull request.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2013 Steve Heffernan  
Licensed under the Apache-2.0 license.
