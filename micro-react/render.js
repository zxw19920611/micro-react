function render(element, container) {
    //创建元素
    const dom = element.type === 'TEXT_ELEMENT'
    ? document.createTextNode('') 
    :document.createElement(element.type)

    //赋予属性
    Object.keys(element.props)
    .filter((key) => key !== 'children')
    .forEach(key => dom[key] = element.props[key])

    //递归渲染子元素
    element.props.children.forEach(child => {
        render(child, dom)
    });

    //追加到父节点
    container.append(dom)
}

let nextUnitOfWork = null

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
}

//第一次请求
requestIdleCallback(workLoop)

function performUnitOfWork(work) {

}

export default render