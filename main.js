import {createElement, render} from "./micro-react";

const element = createElement(
  'h1', 
  {id: 'title', style: 'background: skyblue'},
  'hello world',
  createElement('a', { href: 'https://www.baidu.com', style: 'background: red' }, 'baidu')
  )

  const container = document.querySelector('root')

  render(element, root)