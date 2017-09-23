/*
	author: leeenx
	@ 贪吃蛇的 model 类 
*/

// 随机打散数组 
import randomList from '../lib/utils/randomList'; 

// 链表类
import Chain from '../lib/utils/chain'; 

// model 类
export default class model {
	// 构造函数
	constructor() {
		// 活动空间 
		this.zone = []; 

		// 蛇链表
		this.snake = new Chain(); 

		// 封装 snake 的 unshift, push, shift, pop 方法
		let {unshift, push, shift, pop} = this.snake; 

		this.snake.unshift = (index) => { 
			unshift.call(this.snake, index); 
			// 更新 zone
			this.updateZone(index, "snake", "unshift"); 
		}

		this.snake.shift = () => {
			let index = shift.call(this.snake).data; 
			// 更新 zone
			this.updateZone(index, undefined, "shift"); 
		}

		this.snake.push = (index) => {
			push.call(this.snake, index); 
			// 更新 zone
			this.updateZone(index, "snake", "push"); 
		}

		this.snake.pop = () => {
			let index = pop.call(this.snake).data; 
			// 更新 zone
			this.updateZone(index, undefined, "pop"); 
		}

		// 投食后自动更新 zone
		Reflect.defineProperty(this, "food", {
			get: () => {
				return Reflect.get(this, "_food")
			},
			set: (value) => {
				// 将值记录到 _food
				Reflect.set(this, "_food", value); 
				// 更新 zone
				value !== undefined && this.updateZone(value, "food"); 
			}
		}); 
	}

	// 初始化
	init(config) {
		// 指定 zone 长度
		this.zone.length = config.row * config.column; 

		// 填充 zone 的初始信息
		for(let i = 0, len = this.zone.length; i < len; ++i) { 
			let [col, row] = [i % config.column, (i / config.row) >> 0]
			this.zone[i] = {
				col: col, 
				row: row, 
				left: col > 0 ? i - 1 : -1, 
				right: col < config.column - 1 ? i + 1 : -1, 
				up: row > 0 ? i - config.column : -1, 
				down: row < config.row - 1 ? i + config.column : -1
			}
		}

		// 初始蛇的长度 
		while(this.snake.length < config.min) { 
			let index = this.snake.length ? this.neighbour() : (Math.random() * this.zone.length)>>0; 
			this.snake.unshift(index); 
		} 
		// 投食
		this.feed(); 
	}

	// 销毁
	destroy() {
		// 清空 zone 内容
		this.zone = []; 
		// 清空链表数组
		this.snake.clean(); 
		// 清除食物
		this.food = undefined; 
		// 清空 bar
		delete this.bar; 
	}

	// 邻居元素
	neighbour() { 
		return randomList(
				[
					this.leader.left, 
					this.leader.right, 
					this.leader.up, 
					this.leader.down
				], 
				1, 
				(index) => index !== -1 && this.zone[index].fill === undefined
			);
	}

	// zone 区域更新状态
	updateZone(index, fill, type) { 
		// console.log(index, fill, type); 
		// fill == undefine 表示 free
		this.zone[index].fill = fill; 
		// leader 更新
		this.updateLeader(); 
	}

	// 更新蛇头在 zone 的坐标
	updateLeader() { 
		if(this.snake.length !== 0) { 
			this.leader = this.zone[this.snake.first().data]; 
		}
		this.dirty = true; 
	}

	// 清理dirty
	cleanDirty() {
		this.dirty = false; 
	}

	// 蛇运动
	move(direction) {
		let index = this.leader[direction], skipTail = false;  
		if(-1 === index) {
			// 撞墙
			this.collision("bounds"); 
			return ;
		}
		if(this.snake.last().data === index) {
			// 即将撞上的尾巴
			skipTail = true; 
		}
		let next = this.zone[index]; 
		switch(next.fill) {
			// 吃食
			case "food": this.eat(); break;
			// 撞到自己
			case "snake": {
				// 判断是否咬尾
				if(!skipTail) {
					this.collision("self"); break; 
				}
			}
			// 默认前进
			default: this.snake.pop() & this.snake.unshift(index); 
		}
	}

	// 吃食
	eat() {
		// 食物变成了头
		this.snake.unshift(this.food); 
		// 重新投食
		this.feed(); 
	}

	// 撞到东西
	collision(bar) {
		// bar 不为空就认为游戏结束 
		this.bar = bar; 
	}

	// 赌博
	bet() {
		let rnd = Math.random() * this.zone.length >> 0; 
		return this.zone[rnd].fill === undefined ? rnd : -1; 
	}

	// 随机喂食
	feed() {
		// 赌一次
		let rnd = this.bet(); 
		if(rnd !== -1) { 
			this.food = rnd; 
			return; 
		}
		let index = 0,  
		count = 0,  
		len = this.zone.length - this.snake.length; 
		rnd = (Math.random() * count>>0) + 1; 
		// 无法投食
		if(0 === len) {
			this.food = undefined; 
			return ;
		} 
		while(rnd !== count) {
			this.zone[index++].fill === undefined && ++count; 
		} 
		this.food = index - 1; 
	}
}