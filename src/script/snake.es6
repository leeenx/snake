/*
	author: leeenx
	@ 贪吃蛇
	@ model & view 不对外暴露接口
	@ SnakeClass 本质上说就是 SnakeControl
*/

// 向前兼容
import 'babel-polyfill'; 

// model
import SnakeModel from './core/model'; 

// view
import SnakeView from './core/view'; 

// control
import SnakeControl from './core/control'; 

class SnakeClass extends SnakeControl {
	constructor(dom) {
		super(new SnakeModel(), new SnakeView(dom)); 
	} 
}

global && (global.SnakeClass = SnakeClass); // 作为全局类名