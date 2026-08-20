class PromiseScheduler {
    constructor(limit) {
        // TODO
        this.limit = limit
        this.count = 0
        this.queue = []
    }

    async add(task) {
        // TODO
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

const sleep = (ms, value) =>
    new Promise((resolve) => setTimeout(() => resolve(value), ms));

const scheduler = new PromiseScheduler(2);

// 每个任务完成后立刻打印，所以这里按实际完成顺序输出：B、C、A、D。
// return val 会把结果继续传下去；如果不返回，任务结果就是 undefined。
// .then() 返回的新 Promise 会使用回调函数的返回值，而 console.log() 的返回值是 undefined。
const tasks = [
    scheduler.add(() => sleep(1000, "A").then((val) => {
        console.log(val)
        return val
    })),
    scheduler.add(() => sleep(500, "B").then((val) => {
        console.log(val)
        return val
    })),
    scheduler.add(() => sleep(300, "C").then((val) => {
        console.log(val)
        return val
    })),
    scheduler.add(() => sleep(200, "D").then((val) => {
        console.log(val)
        return val
    })),
];

// Promise.all 等全部任务完成，再按 tasks 的原顺序汇总结果。
// 因此最后输出的是 ["A", "B", "C", "D"]，不是任务的完成顺序。
Promise.all(tasks).then(console.log);
