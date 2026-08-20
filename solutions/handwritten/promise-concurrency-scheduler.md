# 实现有并行限制的 Promise 调度器

- 日期：2026-08-20
- 类型：JavaScript 手写题
- 难度：中等
- 状态：待手写

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
    // TODO
  }

  add(task) {
    // TODO
  }
}
```

## 测试清单

- [ ] `limit = 1` 时任务严格串行执行。
- [ ] `limit = 2` 时同时运行的任务不超过两个。
- [ ] 任务按照加入队列的顺序开始执行。
- [ ] 任务返回普通值时能够正常完成。
- [ ] 任务返回 rejected Promise 时，后续任务仍会执行。
- [ ] 任务同步抛出异常时，后续任务仍会执行。
- [ ] 非法的 `limit` 能够被正确处理。

## 思路与复盘

### 核心思路



### 易错点



### 时间与空间复杂度

- 时间复杂度：
- 空间复杂度：

### 复盘记录

- 是否能在不看答案的情况下独立写出：
- 下次复盘日期：
