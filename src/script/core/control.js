/*
	author: leeenx
	@ 贪吃蛇的 control 类 
*/

// 游戏通用ticker
import ticker from '../lib/utils/ticker'; 

// timer
import timer from '../lib/utils/timer'; 

// 随机打散数组 
import randomList from '../lib/utils/randomList'; 

// 事件
import Events from '../lib/utils/Events'; 

// control 类
export default class control { 
	// 构建函数 
	constructor(model, view) {
		this.model = model; 
		this.view = view; 

		// 挂载一个 speed 属性
		Reflect.defineProperty(this, "speed", {
			get: function() {
				return this.speedScalar || 1; 
			}, 
			set: function(value) { 
				if(this.speedScalar !== value) {
					this.speedScalar = value; 
					this.interval = 300 / this.speedScalar; 
					// 更新 timer
					timer.set(this.intervalID, {delay: this.interval});
				} 
			}
		}); 

		// tickHandle 绑定当前 this
		this.tickHandle = this.tickHandle.bind(this); 

		// this.update 绑定 this
		this.update = this.update.bind(this); 

		// 挂载事件对象
		this.event = new Events(); 

		// 四个方向
		this.fourDirections = ["left", "up", "right", "down"]; 
	}

	// 初始化
	init(config = {}) { 
		// 添加 ticker
		ticker.addEventListener("tick", this.tickHandle); 
		// 默认暂停 ticker
		this.pause(); 

		let {
			width = 640, 
			height = 640, 
			row = 50, 
			column = 50, 
			border = 0x999999, 
			color = 0x000000, // 蛇的节点颜色
			food = color, // 食物颜色
			min = 3, // 初始长度
			speed = 1 // 速度标量
		} = config; 

		// 存一份 config 到 this
		this.config = config; 

		// 初始化 model
		this.model.init({row, column, min}); 

		// view.data
		let data = {
			zone: this.model.zone, 
			snake: this.model.snake, 
			food: this.model.food
		}; 

		// 初始化 view
		this.view.init({width, height, row, column, border, color, food, data}); 

		// interval 的间隔
		this.interval = 300 / this.speedScalar ; 

		// 定时更新view
		this.intervalID = timer.setInterval(this.update, this.interval); 

		// 速度标量
		this.speed = speed; 

		// 蛇长度
		this.length = this.model.snake.length; 

		// 初始化食物
		this.food = this.model.food; 

		// 用户操作的方向列表 
		this.directions = []; 

		// 总计时
		if(config.time > 0) {
			let time = config.time / 1000; 
			timer.setTimeout(() => this.gameover("timeout"), config.time); 
			// 倒数
			timer.setInterval(() => this.event.dispatch("countdown", --time), 1000); 
		}

	}
	// 销毁 
	destroy() {
		// 移除 ticker
		ticker.removeEventListener("tick", this.tickHandle); 
		// 清空 timer
		timer.clean(); 
		// 销毁 model
		this.model.destroy(); 
		// 销毁 view
		this.view.destroy(); 
		// GAMEOVER
		this.GAMEOVER = false
	}

	// 转向
	turn(direction) { 
		// 只保存第一次方向操作
		if(this.fourDirections.indexOf[direction] === -1) return; 
		let directionA = direction, directionB = this.directions[0] || this.direction; 
		// 给操作列表加个容积 5
		if(this.directions.length < 5 && directionA !== directionB  && !this.isAdverse(directionA, directionB)) { 
			this.directions.unshift(directionA); 
		} 
	}

	// 判断两个方向是否相反
	isAdverse(directionA, directionB) {
		let indexA = this.fourDirections.indexOf(directionA), 
			indexB = this.fourDirections.indexOf(directionB); 
		if(Math.abs(indexA - indexB) === 2) { 
			return true; 
		}
		return false; 
	}

	// 暂停
	pause() { 
		if(this.GAMEOVER) return ;
		ticker.pause(); 
	}

	// 恢复
	resume() { 
		if(this.GAMEOVER) return ;
		ticker.resume(); 
	}

	// start
	start() { 
		if(this.GAMEOVER) return ;
		// this.resume(); 
		// 蛇的随机运动方向 
		let {leader, zone} = this.model; 
		// 控制方向的变量是 this.direction。this.nextDirection 表示下一个方向
		this.directions.push(
			randomList(
				this.fourDirections
					.filter(
						(item) => leader[item] !== -1 && zone[leader[item]].fill === undefined
					), 
				1
			)
		); 

		this.update(); 
	}

	// 重新开始 
	restart() {
		this.destroy(); 
		this.init(this.config); 
		this.start(); 
	}

	// gameover
	gameover(type) { 
		if(this.GAMEOVER) return ; 
		this.event.dispatch("gameover", type); 
		this.pause(); 
		this.GAMEOVER = true; 
	}

	// update
	update() { 
		// this.direction 表示蛇头节点的运动方向
		this.direction = this.directions.pop() || this.direction; 
		this.model.move(this.direction); 
		if(this.model.bar !== undefined) {
			// gameover
			this.gameover(this.model.bar); 
		}
		let data = {snake: this.model.snake, food: this.model.food}; 
		if(this.model.dirty) {
			// model 有变化
			let hasEatEvent = false; 
			if(this.food !== this.model.food) {
				this.food = this.model.food; 
				hasEatEvent = true; 
				this.event.dispatch("before-eat"); 
				this.length = this.model.snake.length; 
			}
			this.view.update(data); 
			hasEatEvent && this.event.dispatch("eat"); 
			this.model.cleanDirty(); 
		}
	}

	// tickHandle
	tickHandle() { 
		timer.update(ticker.paused, ticker.elapsedMS * 1000); 
		if(!ticker.paused) { 
			this.view.updateTicker(); 
		} 
	}
}