// webpack是一个精华模块化的boundler，为JavaScript应用程序准备
// 在内部构建 depandecy graph（依赖图谱），为项目需要的模块进行映射，生成一个或多个boundle

// 最初设计js是单脚本，没有考虑到复杂模块，也没有模块化的需求，但是随着前端应用程序复杂性提升，对模块化有了需求

// 模块化：
// 1. 将庞大的逻辑分成小块-- - 分治思想
// 2. 避免冲突

// js借鉴node，node天生支持模块化 --- 但是浏览器不认这种写法
// 用boundler去做中间人，去转换成浏览器可识别的代码

// 作用域：函数天然有作用域,webpack也是这样实现的

// 从模块（module）到浏览器可以运行的代码，需要什么信息？
// code：代码、模块
// path：模块在项目中的路径
// deps：依赖除了模块本身，可能还依赖了其他模块，依赖就是从其他模块获取的东西，比如import进来的
// id：唯一标识模块的编号
// graph：依赖图谱：描述依赖之间的依赖关系，描述依赖信息。（许多模块，模块对应asset，asset组合起来）
// boundle：最终生成的代码，可以直接在浏览器运行

const fs = require('fs')
const path = require('path')
const { parse } = require('@babel/parser')
const traverse = require('@babel/traverse').default

let ID = 0 // 唯一标识模块的编号
// 创建每个模块的源信息：asset
function createAsset(path) {
  const code = fs.readFileSync(path, { encoding: 'UTF-8' })
  // 任何语言都有parse，编译原理范畴
  // --- 将代码编译最初阶段解析并生成中间产物（AST抽象语法树），方便后续使用
  const ast = parse(code, {
    sourceType: 'module'
  })
  // 在ast的基础上，用Babel的工具，可以获取到import语句的相对路径字符串
  // 是一种设计模式：visit模式，将一段算法封装起来，使我们轻松遍历数据体
  const deps = [] // 可能不止有一个import
  traverse(ast, {
    // ImportDeclaration是ast的type
    ImportDeclaration: function ({ node }) {
      deps.push(node.source.value)
    }
  })

  return {
    id: ID++,
    path,
    code,
    deps,
  }
}

// 创建依赖图谱
function createGraph(entryPath) {
  // 先生成入口文件的asset，再生成import的其他模块，最后把他们组合起来
  const mainAsset = createAsset(entryPath)
  // 按顺序找import的模块，找到import语句就获取相对路径 --- 将相对路径转成绝对路径 --- 用createAsset生成模块对应的asset
  const assetQueue = [mainAsset]
  // 将asset中import的模块也生成出来
  for (const asset of assetQueue) {
    const deps = asset.deps

    // 获取目录
    const dirname = path.dirname(asset.path)
    for (const dep of deps) {
      // 将import进来的依赖，也都进行处理
      // deps是相对路径 --- 获取绝对路径
      // asset中有path，path所在文件夹 拼上相对路径 = 绝对路径
      const child = createAsset(path.join(dirname, deps))

      // 生成mapping
      // deps不知道具体是属于哪一个模块的，ID决定是哪个模块 --- 把相对路径和ID映射起来
      asset.mapping[dep] = child.id

      // 把import进来的放进queue中就行，因为for循环动态读取数组的长度，最终会遍历全部
      assetQueue.push(child)
    }
  }
}

// 返回可以在浏览器中执行的代码
// 立即执行函数
function bondle(graph) {
  // 传入graph生成的信息: modules
  let modules = ''
  graph.forEach(module => {
    
  })
  return `
    ;(function(){

    })()
  `
}

const pragh = createGraph('./src/entry.js')

const result = bondle(graph)

fs.writeFileSync('./dist/bondle.js', result, {encoding: 'UTF-8'})