/*
	author: leeenx
	@ 贪吃蛇的 view 类 
*/

// gsap 方法
import '../lib/gsap/TweenMax'; 

// 获取 Graphics 的 content-box
import '../lib/utils/getContentBoxSize'; 

// 不显示 PIXI 信息
import '../lib/utils/noHello'; 

// 链表类
import Chain from '../lib/utils/chain'; 


// view 类
export default class view {
	// 构造函数
	constructor(dom) { 
		// 创建一个 app
		let app = new PIXI.Application(
			750, 
			1206, 
			{ 
				transparent: true
			}
		); 

		// canvas 添加到 page
		dom.appendChild(app.view); 

		// 销毁pixijs的ticker
		app.ticker.destroy(); 

		// 创建 view 的蛇
		this.snake = new Chain(); 

		// shift & unshift & pop & push & insertAfter 自动关联 addNode & removeNode
		let {shift, unshift, pop, push, insertAfter} = this.snake; 

		// 封闭 shift
		this.snake.shift = () => { 
			// 回收尾节点
			this.collect(shift.call(this.snake).node); 
		}

		// 封装 unshift 
		this.snake.unshift = (data) => {
			unshift.call(this.snake, data); 
			let node = this.snake.first().node = this.calloc(); 
			node.setPostion(...this.getPosition(data)); 
		}

		// 封闭 pop
		this.snake.pop = () => { 
			// 回收尾节点
			this.collect(pop.call(this.snake).node); 
		}

		// 封装 push 
		this.snake.push = (data) => {
			push.call(this.snake, data); 
			let node = this.snake.last().node = this.calloc(); 
			node.setPostion(...this.getPosition(data)); 
		}

		// 封装 insertAfter 
		this.snake.insertAfter = (index, data) => {
			insertAfter.call(this.snake, index, data); 
			let node = this.snake.at(index + 1).node = this.calloc(); 
			node.setPostion(...this.getPosition(data)); 
		}

		// 回收节点
		this.collection = []; 

		// 保证 updateTicker 指针永远指向 view
		this.updateTicker = this.updateTicker.bind(this); 

		// 挂载到this
		this.app = app; 
		this.stage = app.stage; 

		// 扩展 PIXI.Graphics
		PIXI.Graphics.prototype.setPostion = function(x, y = x) {
			this.x = x + this.pivot.x; 
			this.y = y + this.pivot.y; 
		}
	}

	// 初始化
	init(config = {}) { 
		// pixijs
		let {
			app, 
			app: {stage, renderer}
		} = this; 

		// 蛇的尺寸挂载到 config 
		config.size = {
			width: config.width / config.row, 
			height: config.height / config.column
		};

		// 初化data
		this.data = config.data; 

		// 全局 config 挂载
		this.config = config; 

		// 游戏活动区
		stage.addChild(this.zone = new PIXI.Container()); 

		// 绘制边界
		this.drawBounds(); 

		// 食物
		this.food = this.calloc(); 
		this.food.visible = false; 

		// 食物动画 - blink
		let [from, to] = [
			{
				alpha: 1
			}, 
			{
				alpha: 0
			}
		]; 
		TweenMax.fromTo(this.food, .2, from, to).repeat(-1).yoyo(true); 

		// 通过 model.zone 创建一张快速定位表
		this.createQuickMap(this.data.zone); 

		let aaa = 0; 

		// 同步 model 的初始数据
		for(let {data} of this.data.snake) { 
			this.snake.push(data); 
		} 

	}

	destroy() {
		let {app, app: {stage}} = this; 
		// 销毁所有子节点
		for(let child of stage.children) {
			child.destroy(); 
		}
		stage.removeChildren(); 
		this.collection = []; 
		this.snake.clean(); 
	}
	// 绘制四条边界
	drawBounds() {
		let {app, app: {stage}} = this,  
		{border, width, height} = this.config,  
		thickness = 8; 
		let bounds = (new PIXI.Graphics())
			.beginFill(0xffffff, 1)
				.lineStyle(thickness, border, 1)
					.drawRect(0, 0, width + thickness, height + thickness); 

		bounds.x = bounds.y = (app.view.width - bounds.cwidth) / 2; 

		stage.addChild(bounds); 
		// bounds 的 index
		stage.setChildIndex(bounds, 0); 

		// 活动空间定位
		[this.zone.x, this.zone.y] = [bounds.x + thickness / 2, bounds.y + thickness / 2]; 
	}

	// 快速寻位表
	createQuickMap(map) { 
		let {width, height} = this.config.size; 
		// 快速表
		this.quickMap = []; 
		for(let {col, row} of map) {
			this.quickMap.push([col * width, row * height]); 
		}

	}

	// 快速计算position
	getPosition(index) {
		return this.quickMap[index]; 
	}

	// 创建节点
	calloc() { 
		let node; 
		if(this.collection.length === 0) {
			node = new PIXI.Graphics(); 
			let {width, height} = this.config.size; 
			node.beginFill(this.config.color, 1)
				.drawRect(
					0, 
					0,
					width, 
					height
				); 
			node.pivot.set(width / 2, height / 2); 
			node.setPostion(0); 
		} else {
			node = this.collection.pop(); 
		}
		
		// 默认显示在容器里
		this.zone.addChild(node); 
		return node; 
	}

	// 回收节点
	collect(node) {
		node && this.collection.push(node) & this.zone.removeChild(node); 
	}

	// 随机生成食物
	feed(index) { 
		this.food.visible = 1; 
		this.food.graphicsData[0].fillColor = this.config.food; 
		this.food.dirty++; 
		this.food.clearDirty++; 
		this.food.setPostion(...this.getPosition(index)); 
	}

	// ticker update
	updateTicker() { 
		// this.render(); 
	}

	// 状态更新
	update(data) { 
		// 食物更新
		this.food !== data.food && this.feed(data.food); 
		this.updateDelta(data.snake); 
	}

	// 增量更新
	updateDelta(snakeA, snakeB = this.snake) { 
		// snakeA === model.snake, snakeB === view.snake
		this.updateTail(snakeA, snakeB)
			.then(() => this.updateHead(snakeA, snakeB))
			.catch(() => this.wholeUpdate(snakeA, snakeB))
			.then(() => this.render())
	}

	// 检查蛇头
	updateHead(snakeA, snakeB) { 
		return new Promise(
			(resolve, reject) => { 
				// snakeA 与 snakeB 做头指针比较
				let headA, headB = snakeB.first(); 
				// 指针指向头部
				snakeA.setPointer(snakeA.HEAD); 
				while(snakeB.length <= snakeA.length) { 
					headA = snakeA.next(); 
					// 头节点匹配
					if(headA.data === headB.data) {
						// 执行 then 通道
						return resolve(); 
					}
					// 不匹配
					else { 
						// 向snakeB插入头节点
						if(snakeA.HEAD === headA.index) {
							snakeB.unshift(headA.data); 
						}
						// 向snakeB插入第二个节点
						else {
							snakeB.insertAfter(0, headA.data); 
						} 
					}
				}
				// 头指针未匹配上，走 catch 通道
				reject(); 
			}
		); 
	}

	// 检查蛇尾
	updateTail(snakeA, snakeB) {
		return new Promise(
			(resolve, reject) => {
				// snakeA 与 snakeB 做尾指针比较
				let tailA = snakeA.last(), tailB; 
				while(snakeB.length !== 0) { 
					tailB = snakeB.last(); 
					// 尾节点匹配
					if(tailA.data === tailB.data) { 
						// 执行 then 通道
						return resolve(); 
					}
					// 不匹配
					else {
						snakeB.pop(); 
					}
				}
				// 尾指针未匹配上，走 catch 通道
				reject(); 
			}
		); 
	}

	// 全量更新
	wholeUpdate(snakeA, snakeB) { 
		console.log(">>>>>>>>>>>>>>>>>", "low performance"); 
		// 把视图上的蛇回收
		while(snakeB.length !== 0) {
			snakeB.pop(); 
		} 
		// 重头开始插入 snake
		for(let {data} of snakeA) { 
			snakeB.unshift(data); 
		} 
	}

	// 渲染 
	render() {
		this.app.renderer.render(this.app.stage);
	}
}

