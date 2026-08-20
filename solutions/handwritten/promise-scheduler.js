class Scheduler {
    constructor(max) {
        // 最大并发任务数
        this.max = max
        // 当前并发任务数
        this.count = 0
        // 任务等待队列
        this.queue = []
    }

    async add(fn) {
        if (this.count >= this.max) {
            await new Promise(resolve => this.queue.push(resolve))
        }
        this.count++

        try {
            return await fn()
        } finally {
            this.count--
            this.queue.length && this.queue.shift()()
        }
    }
}

// 延迟函数
const sleep = time => new Promise(resolve => setTimeout(resolve, time));

// 同时进行的任务最多2个
const scheduler = new Scheduler(2);

// 添加异步任务
// time: 任务执行的时间
// val: 参数
const addTask = (time, val) => {
    scheduler.add(() => {
        return sleep(time).then(() => console.log(val));
    });
};

addTask(1000, '1');
addTask(500, '2');
addTask(300, '3');
addTask(400, '4');
// 2
// 3
// 1
// 4