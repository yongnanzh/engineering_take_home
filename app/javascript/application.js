// Entry point for the build script in your package.json
import React from 'react';
import ReactDOM from 'react-dom';
import HelloWorld from './components/HelloWorld';
import BuildingsApp from './components/BuildingsApp';

document.addEventListener('DOMContentLoaded', () => {
  const node = document.getElementById('react-root');
  if (node) {
    ReactDOM.render(<HelloWorld />, node);
  }

  const el = document.getElementById('buildings-root');
  if (el) {
    ReactDOM.render(React.createElement(BuildingsApp), el);
  }
});
