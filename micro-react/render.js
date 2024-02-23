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
    console.log(1)
    wipRoot = {
        dom: container,
        props: {
            children: [element]
        },
        sibling: null,
        child: null,
        parent: null
    }
    nextUnitOfWork = wipRoot
}

let nextUnitOfWork = null
let wipRoot = null

function commitRoot() {
    commitWork(wipRoot.child)
    wipRoot = null
}

function commitWork(fiber) {
    if (!fiber) {
        return
    }
    const parentDom = fiber.parent.dom
    parentDom.append(fiber.dom)
    commitWork(fiber.child)
    // console.log(fiber, 'fiber')
    commitWork(fiber.sibling)
    
}

//调度函数
function workLoop(deadLine) {
    // 应该退出
    let shoulYield = false
    // 有工作 且不应该退出 浏览器一直空闲 while一直执行
    while (nextUnitOfWork && !shoulYield) {
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
console.log(2)
requestIdleCallback(workLoop)

function performUnitOfWork(fiber) {
    // 创建dom元素
    if (!fiber.dom) {
        fiber.dom = createDom(fiber)
    }

    // // 追加到父节点
    // if (fiber.parent) {
    //     fiber.parent.dom.append(fiber.dom)
    // }

    // 给children创建fiber
    const elements = fiber.props.children
    let preSibling = null

    //简历fiber之间的联系， 构建fiber树
    for (let i = 0; i < elements.length; i++) {
        const newFiber = {
            type: elements[i].type,
            props: elements[i].props,
            parent: fiber,
            dom: null,
            child: null,
            sibling: null
        }

        // 这里其实很简单， i = 0父亲找到儿子， 然后preSibling变成亲儿子， 知乎就是往preSibling挂sibling
        if (i == 0) {
            fiber.child = newFiber
        } else {
            preSibling.sibling = newFiber
        }
        preSibling = newFiber
    }
    //返回下一个fiber
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

export default render