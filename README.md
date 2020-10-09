## Devloping

Make sure Lerna is installed globally with `npm i -g lerna`

Run 'lerna boostrap`

# Packages

## @symfoni/buidler-demo

Here is the buidler project that will include buidler-react as a plugin to generate the react component that we will use in react-demo

## @symfoni/buidler-react

Here is the code for the buidler plugin. Lerna will symlink this package to @symfoni/buidler-demo so we can use it there.

## @symfoni/react-demo

This is a standard react app to demonstrate buidler with a react component output.
