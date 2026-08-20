# 实现有并行限制的 Promise 调度器

- 日期：2026-08-20
- 类型：JavaScript 手写题
- 难度：中等
- 状态：已完成（基础版，存在已知边界限制）

## 题目描述

实现一个 `PromiseScheduler`，用于限制异步任务的最大并行数量。

```js
class PromiseScheduler {
  constructor(limit) {}

  add(task) {}
}
```

其中：

- `limit` 是大于 `0` 的整数，表示最大并行任务数。
- `task` 是一个无参数函数，调用后返回 Promise，也可以返回普通值。
- `add(task)` 返回一个 Promise，其最终状态和 `task` 的执行结果一致。
- 等待中的任务按照加入顺序执行。
- 任意时刻正在执行的任务数不能超过 `limit`。
- 单个任务失败或同步抛错时，不能阻塞后续任务。

## 使用示例

```js
const sleep = (ms, value) =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

const scheduler = new PromiseScheduler(2);

const tasks = [
  scheduler.add(() => sleep(1000, "A")),
  scheduler.add(() => sleep(500, "B")),
  scheduler.add(() => sleep(300, "C")),
  scheduler.add(() => sleep(200, "D")),
];

Promise.all(tasks).then(console.log);
// 约 1.2 秒后输出：["A", "B", "C", "D"]
```

## 手写实现

```js
class PromiseScheduler {
  constructor(limit) {
    this.limit = limit
    this.count = 0
    this.queue = []
  }

  async add(task) {
    if (this.count >= this.limit) {
      await new Promise(resolve => this.queue.push(resolve))
    }

    this.count++

    try {
      return await task()
    } finally {
      this.count--
      this.queue.length && this.queue.shift()()
    }
  }
}
```

## 测试清单

- [x] `limit = 1` 时，批量加入的任务可以串行执行。
- [x] `limit = 2` 时，常规场景中的同时运行任务不超过两个。
- [x] 常规等待队列中的任务按照加入顺序开始执行。
- [x] 任务返回普通值时能够正常完成。
- [x] 任务返回 rejected Promise 时，后续任务仍会执行。
- [x] 任务同步抛出异常时，后续任务仍会执行。
- [ ] 动态加入任务时始终遵守并行限制：当前存在名额释放与任务恢复之间的竞态。
- [ ] 非法的 `limit` 能够被正确处理：当前约定调用方传入正整数。

## 思路与复盘

### 核心思路

- 使用 `count` 记录当前正在执行的任务数量，使用 `queue` 保存等待任务的唤醒函数。
- 调用 `add(task)` 时，如果当前并行数已经达到 `limit`，就创建一个暂不完成的 Promise，并将它的 `resolve` 放入队列。`await` 会让当前任务停在这里，但不会阻塞 JavaScript 线程。
- 获得执行名额后先增加 `count`，再通过 `await task()` 等待任务完成。
- 在 `finally` 中减少 `count`，保证任务成功、失败或同步抛错时都会释放名额。
- 任务完成后通过 `queue.shift()` 取出最早进入队列的唤醒函数，使等待任务按照 FIFO 顺序继续执行。
- `return await task()` 会把任务的返回值或拒绝状态传递给 `add(task)` 的调用方，同时确保 `finally` 在任务真正结束后执行。


### 易错点

- 并行数量达到上限时就应该等待，所以判断条件是 `count >= limit`，不能写成 `count > limit`。
- 计数恢复和队列唤醒必须放在 `finally` 中；只写在成功路径或 `catch` 中都会遗漏部分情况。
- 不能用空的 `catch` 吞掉任务错误，否则 `add(task)` 无法保持与原任务相同的 Promise 状态。
- `const` 和 `let` 具有块级作用域，在 `try` 内声明的变量不能在代码块外直接访问。
- 这里需要 `return await task()`；如果直接 `return task()`，`finally` 可能在任务真正完成前释放并行名额。
- 当前实现存在已知限制：动态加入任务时，新任务可能在已排队任务恢复前抢到刚释放的名额。
- 当前实现默认 `limit` 是正整数，没有处理 `0`、负数和非整数。


### 时间与空间复杂度

- 时间复杂度：不计任务本身的执行时间，入队是 `O(1)`；当前使用数组的 `shift()` 出队，最坏为 `O(q)`，其中 `q` 是等待任务数。如果使用队头索引或真正的队列结构，单次调度可以做到均摊 `O(1)`。
- 空间复杂度：`O(q)`，队列最多保存所有尚未获得执行名额的任务。

### 复盘记录

- 是否能在不看答案的情况下独立写出：可以写出基础版本；动态加入任务的竞态和参数校验仍需复习。
- 下次复盘日期：2026-08-27
