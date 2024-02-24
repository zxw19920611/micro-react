function createDom(fiber) {
    //创建元素
    const dom = fiber.type === 'TEXT_ELEMENT'
    ? document.createTextNode('') 
    :document.createElement(fiber.type)

    //赋予属性
    Object.keys(fiber.props)
    .filter((key) => key !== 'children')
    .forEach(key => dom[key] = fiber.props[key])

    return dom

}

// 发出第一个fiber
function render(element, container) {
    wipRoot = {
        dom: container,
        props: {
            children: [element]
        },
        sibling: null,
        child: null,
        parent: null,
        alternate: currentRoot
    }
    console.log(wipRoot, 'root的fiber')
    deletion = []
    nextUnitOfWork = wipRoot
}

let nextUnitOfWork = null
let wipRoot = null
let currentRoot = null
let deletion = null

function commitRoot() {
    deletion.forEach((item) => commitWork(item));
    commitWork(wipRoot.child)
    //这里的wipRoot是fiber
    currentRoot = wipRoot
    wipRoot = null
}

// 渲染fiber
function commitWork(fiber) {
  if (!fiber) {
    return;
  }

  // 寻找最近的父DOM节点
  let domParentFiber = fiber.parent;
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber.dom;

  if (fiber.effectTag === 'PLACEMENT' && fiber.dom) {
    domParent.append(fiber.dom);
  } else if (fiber.effectTag === 'DELETION' && fiber.dom) {
    commitDeletion(fiber, domParent);
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom) {
    // dom，之前的props，现在的props
    updateDOM(fiber.dom, fiber.alternate.props, fiber.props);
  }
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}
function commitDeletion(fiber, domParent) {
    if (fiber.dom) {
        domParent.removeChild(fiber.dom)
    } else {
        commitDeletion(fiber.child, domParent)
    }
}

function updateDOM(dom, prevProps, nextProps) {
    const isEvent = (key) => key.startsWith('on');

    //删除已经没有的props
    Object.keys(prevProps)
    .filter(key => key !== 'children')
    .filter(key => !key in nextProps)
    .forEach(key => {
        dom[key] = ''
    })
    //赋予新的或者改变的props
    Object.keys(nextProps)
    .filter(key => key !== 'children')
    .filter(key => !key in prevProps || prevProps[key] !== nextProps[key])
    .forEach(key => {
        dom[key] = nextProps[key]
    })

    // 删除事件处理函数
    Object.keys(prevProps)
    .filter(isEvent)
    // 新的属性没有，或者有变化
    .filter((key) => !key in nextProps || prevProps[key] !== nextProps[key])
    .forEach((key) => {
        const eventType = key.toLowerCase().substring(2);
        dom.removeEventListener(eventType, prevProps[key]);
    });

    // 添加新的事件处理函数
    Object.keys(nextProps)
    .filter(isEvent)
    .filter((key) => prevProps[key] !== nextProps[key])
    .forEach((key) => {
        const eventType = key.toLowerCase().substring(2);
        dom.addEventListener(eventType, nextProps[key]);
    });
}

//调度函数
function workLoop(deadLine) {
    // 应该退出
    let shoulYield = false
    // 有工作 且不应该退出 浏览器一直空闲 while一直执行
    while (nextUnitOfWork && !shoulYield) {
        console.log(nextUnitOfWork, 'nextUnitOfWork')
        // 做工作
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
        // 看看有没有足够时间
        shoulYield = deadLine.timeRemaining() < 1
    }
    // 没有足够时间，请求下一次浏览器空闲的时候执行
    requestIdleCallback(workLoop)
    // commit阶段 异步渲染 同步提交
    if (!nextUnitOfWork && wipRoot) {
        commitRoot()
    }
}

//第一次请求
requestIdleCallback(workLoop)

function performUnitOfWork(fiber) {
    const isFunctionComponent = fiber.type instanceof Function
    if (isFunctionComponent) {
        updateFunctionComponent(fiber)
    } else {
        updateHostComponent(fiber)
    }
    // //返回下一个fiber
    if (fiber.child) {
        return fiber.child
    }
    let nextFiber = fiber
    while(nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling
        }
        nextFiber = nextFiber.parent
    }
}

//处理非函数组件
function updateHostComponent(fiber) {
    console.log(fiber, 8888)
    // 创建dom元素
    if (!fiber.dom) {
        // fiber.dom = createDom(fiber)
    }
    // 给children创建fiber
    const elements = fiber.props.children
    // 新建newFiber, 构建fiber
    reconcileChildren(fiber, elements)
}

function updateFunctionComponent(fiber) {
    const children = [fiber.type(fiber.props)]
    // console.log(children, 'children')
    reconcileChildren(fiber, children)
}

//新建newFiber, 构建fiber tree
function reconcileChildren(wipFiber, elements) {
    // const isFunctionComponent = wipFiber.type instanceof Function

    let index = 0
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child
    let preSibling = null
    while(index < elements.length || oldFiber) {
        const element = elements[index]
        const sameType = element && oldFiber && element.type === oldFiber.type
        let newFiber = null
        if (sameType) {
            //更新
            newFiber = {
                type: oldFiber.type,
                props: element.props,
                dom: oldFiber.dom,
                parent: wipFiber,
                alternate: oldFiber,
                effectTag: 'UPDATE'
            }
        }

        if (element && !sameType) {
            //新建
            newFiber = {
                type: element.type,
                props: element.props,
                dom: null,
                parent: wipFiber,
                alternate: null,
                effectTag: 'PLACEMENT'
            }
        }
        
        if (oldFiber && !sameType) {
            //删除
            oldFiber.effectTag = 'DELETION'
            deletion.push(oldFiber)
        }
        // isFunctionComponent && console.log(newFiber, 'newFiber')
        if (oldFiber) {
            oldFiber = oldFiber.sibling
        }
        if (index == 0) {
            wipFiber.child = newFiber
        } else {
            preSibling.sibling = newFiber
        }
        preSibling = newFiber
        index++
    }
}

export default render