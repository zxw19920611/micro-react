import {createElement, render} from "./micro-react";

  // const handleInput = (e) => {
  //   renderer(e.target.value)
  // }
  // // const element = createElement(
  // //   'div', 
  // //   null,
  // //   createElement('input', { oninput: handleInput }, 'null'),
  // //   createElement('h1', null, 'hello')
  // // )

  // const renderer = (value) => {
  //   const container = document.querySelector('root')

  //   const element = createElement(
  //     'div', 
  //     null,
  //     createElement('input', { oninput: (e) => handleInput(e) }, 'null'),
  //     createElement('h1', null, value)
  //   )
  //   render(element, root)
  // }
  // // render(element, root)
  // renderer('hello')
  const App = (props) => {
    return createElement('h1',null, 'hi', props.name)
  }
  const container = document.querySelector('#root')
  const element = createElement(App, {name: 'darren'})
  render(element, container)