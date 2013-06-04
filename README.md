# contribflow [![Build Status](https://secure.travis-ci.org/zencoder/contribflow.png?branch=master)](http://travis-ci.org/zencoder/contribflow)

Contribflow is a set of command-line operations that aims to make the contribution process easier for both contributors and repository managers.

For contributors:
* Easily create/delete git branches for new changes (a best-practice when contributing)
* Submit Github pull requests from the command-line
* Learn the underlying git commands as you go

For project owners:
* Allow git novices to more easily contribute while also learning git
* Prevent pull requests to the wrong branch
* Accept pull requests, squash commits, bump version, and update the changelog, all with a single command

## getting started
Contribflow requires [Node.js](http://nodejs.org/). Make sure it's installed an up-to-date on your system, including [npm](https://npmjs.org/).

Install the module globally with:  
```
[sudo] npm install -g contribflow
```

This will make the `contrib` command available to use in any project directory.

### contributor commands

Each `contrib` command will run a series of git or github commands, and may prompt the user for more info. All git commands are printed as they are run, to encourage learning of the underlying git process.

#### feature or hotfix
There are two main branch types that contribflow is meant to work with, based largely on the [Gitflow](http://nvie.com/posts/a-successful-git-branching-model/) branching model.

- Feature: Any feature/change/fix that should go out with the next release. A new feature branch is based on the development branch--the branch with all the latest changes to the code base.
- Hotfix: An URGENT fix that should be applied and immediately deployed/released. A hotfix branch is based on the release branch (often called production or stable) and when finished is merged back into both the release branch (to be deployed) as well as the development branch.

### branch commands

In these examples `feature` is used, but these same commands will work with `hotfix`.

When starting a new feature you run the command:

    contrib feature start

First, this will ask you to name your new feature (use letters, numbers and dashes). Next, it will run a series of git commands to create a new feature branch named "feature/[name-of-feature]." You'll work in this git branch, creating git commits as needed, until you're ready to submit a pull request to the upstream project. At this point you'll run:

    contrib feature submit

This will create a pull request from your feature branch to the development branch of the upstream project.

At this point the project owner may ask you to make changes. To update your pull request you simply make the changes, commit them and `git push` them up to the remote copy of your feature branch (remote tracking of the branch is set up when you start the feature). This will update your pull request.

Once the owner has accepted your pull request, you can clean up your feature branch.
PLEASE NOTE: THIS WILL DELETE YOUR COPY OF THE FEATURE. This is meant to clean up your local and remote branches, so make sure any changes you don't want to lose have been pulled into the parent project or another branch first.

Run the command:

    contrib feature delete


## project-owner commands
_coming soon_

## License
Copyright (c) 2013 Steve Heffernan
Licensed under the Apache-2.0 license.
