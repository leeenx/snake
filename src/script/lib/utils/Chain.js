/*
	@author: leeenx
	@双向链表结构
*/

export default class Chain {
	constructor(arr = []) { 
		// 用于存储链表的数组
		this.chain = []; 
		this.chain.length = arr.length; 
		// 把 arr 转化为 chain
		for(let i = 0, len = arr.length; i < len; ++i) {
			this.chain[i] = {
				index: i, 
				prev: i - 1, 
				next: i !== len -1 ? i + 1 : -1, 
				data: arr[i]
			}
		} 
		
		// 头指针
		this.HEAD = arr.length ? 0 : -1; 
		// 尾指针
		this.TAIL = arr.length ? arr.length - 1 : -1;  
		// 定位指针
		this.POINTER = -1; 
		// 自由指针
		this.FREE = arr.length; 
		// 自由列表 - 回收FREE
		this.FREELIST = []; 
		// 链表的长度
		this.length = this.chain.length; 
		// 创建一个迭代器 
		this[Symbol.iterator] = () => { 
			// 指针指向头部 
			let that = this, cur = that.chain[this.HEAD]; 
			return (function* () { 
				while(cur !== undefined) {
					yield cur; 
					cur = that.chain[cur.next]; 
				}
			}()); 
		}
	}
	// 返回链头并删除链头
	shift() { 
		// 回收 FREE
		this.collection(); 
		// FREE 指向被删除的位置
		this.FREE = this.HEAD; 
		// 头指头指向下一个位置
		this.HEAD = this.chain[this.HEAD].next; 
		// 当前头指针的 prev 指向 -1
		this.HEAD !== -1 && (this.chain[this.HEAD].prev = -1); 
		// 链表长度为0时，尾指针指向-1
		--this.length === 0 && (this.TAIL = -1); 
		// 返回 FREE
		return this.chain[this.FREE]; 
	}
	// 插入新的链头
	unshift(item) { 
		// 新链表的第二个节点
		let second = this.HEAD; 
		// 头指针指向 FREE
		this.HEAD = this.FREE; 
		// 创建新的头节点
		this.chain[this.HEAD] = {
			index: this.HEAD, 
			prev: -1, 
			next: second, 
			data: item
		}
		// 旧的头节点 prev 指向当前头节点
		if(second !== -1) {
			this.chain[second].prev = this.HEAD; 
		}
		else {
			// 链表里只有一个节点，保证this.TAIL !== -1
			this.TAIL = this.HEAD; 
		} 
		// 创建一个 FREE
		this.calloc(); 
		// 链表长度 +1
		++this.length; 
	}
	// 返回链尾并删除表尾
	pop() {
		// 回收 FREE
		this.collection(); 
		// FREE 指向被删除的位置
		this.FREE = this.TAIL; 
		// 尾指针指向上一个位置 
		this.TAIL = this.chain[this.TAIL].prev; 
		// 当前尾指针的 next 指向 -1 
		this.TAIL !== -1 && (this.chain[this.TAIL].next = -1); 
		// 链表长度为0时，头指针指向-1
		--this.length === 0 && (this.HEAD = -1); 
		// 返回 FREE
		return this.chain[this.FREE]; 
	}
	// 插入新的链尾
	push(item) {
		// 新链表的倒数第二个节点
		let penultimate = this.TAIL; 
		// 尾指针指向 FREE
		this.TAIL = this.FREE; 
		// 创建新的尾节点
		this.chain[this.TAIL] = {
			index: this.TAIL, 
			prev: penultimate, 
			next: -1, 
			data: item
		} 

		// 旧的尾节点 next 指向当前尾节点
		if(penultimate !== -1) {
			this.chain[penultimate].next = this.TAIL; 
		}
		else {
			// 链表里只有一个节点，保证this.HEAD !== -1
			this.HEAD = this.TAIL; 
		}
		// 创建一个 FREE
		this.calloc(); 
		// 链表长度 +1
		++this.length;
	}
	// 返回指定索引的元素
	at(index = 0) { 
		if(index < 0 || index >= this.length) return; 
		let cur; 
		if(index < this.length / 2) {
			// 从头部开始 
			cur = this.chain[this.HEAD]; 
			for(let i = 0; i !== index; ++i) { 
				cur = this.chain[cur.next]; 
				this.POINTER = cur.index; 
			}
		} else {
			// 从尾部开始
			cur = this.chain[this.TAIL]; 
			for(let i = this.length - 1; i !== index; --i) {
				cur = this.chain[cur.prev]; 
			}
		}
		return cur; 
	}
	// 返回指定指针的元素
	pointerAt(addr) {
		// 指针地址索引在 0 ~ this.lenght，为合法地址
		if(addr >= 0 && addr < this.length) {
			return this.chain[addr]; 
		}
	}
	// 返回第一个元素
	first() { 
		return this.chain[this.HEAD]; 
	}
	// 返回最后一个元素
	last() {
		return this.chain[this.TAIL]; 
	}
	// 返回当前元素，并把 POINTER 指向上一个元素
	prev() { 
		// 当前节点
		let cur = this.curr(); 
		// POINTER 指向上一个，如果指向 -1 则重置为 this.HEAD
		this.POINTER !== -1 ? (this.POINTER = this.chain[this.POINTER].prev) : (this.POINTER = this.HEAD); 
		return cur; 
	}
	// 返回前当元素，并把 POINTER 指向下一个元素
	next() { 
		// 当前节点
		let cur = this.curr(); 
		// POINTER 指向下一个，如果指向 -1 则重置为 this.TAIL
		this.POINTER !== -1 ? (this.POINTER = this.chain[this.POINTER].next) : (this.POINTER = this.TAIL); 
		return cur; 
	}
	// 返回当前元素
	curr() {
		return this.chain[this.POINTER]; 
	}
	// 定位指针
	setPointer(addr = this.POINTER) {
		// 指针地址索引在 0 ~ this.lenght，为合法地址
		if(addr >= 0 && addr < this.length) {
			this.POINTER = addr; 
			return true; 
		}
	}
	// 克隆
	clone() {
		let copy = new Chain(); 
		for(let key of ["HEAD", "TAIL", "FREE", "length"]) {
			copy[key] = this[key]; 
		}
		copy.chain.length = copy.length; 
		// 链表数据拷贝
		for(let i = 0, len = copy.length; i<len; ++i) {
			copy.chain[i] = Object.create(this.chain[i]); 
		}
		// FREELIST
		copy.FREELIST = [...this.FREELIST]; 
		return copy; 
	}
	// 删除指定位置的元素
	remove(index) {
		// 数组范围之外
		if(index<0 || index>=this.length) return ;
		// 数组索引内
		if(index === 0) {
			// 指向表头
			return this.shift(); 
		} else if(index === this.length - 1) {
			// 指向表尾
			return this.pop(); 
		} else { 
			// 当前节点 
			let cur = this.at(index); 
			// 上一个节点
			let prev = this.chain[cur.prev]; 
			// 下一个节点
			let next = this.chain[cur.next]; 
			// 回收 FREE
			this.collection(); 
			// FREE 指向被删除的位置
			this.FREE = cur.index; 
			// 删除当前节点
			[prev.next, next.prev] = [next.index, prev.index]; 
			// 链表长度 -1
			--this.length; 
			// 返回 FREE
			return cur; 
		}
	}
	// 在指定索引前插入元素
	insertBefore(index, item) {
		// 数组范围之外
		if(index < 0 || index >= this.length) return ;
		// 当前节点 
		let cur = this.at(index); 
		// 上一个节点
		let prev = this.chain[cur.prev] || {index: -1}; 
		// 下一个节点
		let next = cur; 
		// 插入新节点
		cur = this.chain[this.FREE] = {
			index: this.FREE, 
			prev: prev.index, 
			next: next.index, 
			data: item
		} 
		next.prev = cur.index; 
		// 上一个节点存在
		if(prev.index !== -1) {
			prev.next = cur.index; 
		} 
		// 插入的是头节点
		else {
			this.HEAD = cur.index; 
		}
		// 创建一个 FREE
		this.calloc(); 
		// 链表长度 +1
		++this.length; 
	}
	// 在指定索引后插入元素，与 insertBefore 做对就
	insertAfter(index, item) {
		// 数组范围之外
		if(index < 0 || index >= this.length) return ;
		// 当前节点 
		let cur = this.at(index); 
		// 下一个节点
		let next = this.chain[cur.next] || {index: -1}; 
		// 上一个节点
		let prev = cur; 
		// 插入新节点
		cur = this.chain[this.FREE] = {
			index: this.FREE, 
			prev: prev.index, 
			next: next.index, 
			data: item
		}
		prev.next = cur.index; 
		// 下一个节点存在
		if(next.index !== -1) {
			next.prev = cur.index; 
		}
		// 插入的是尾节点
		else {
			this.TAIL = cur.index; 
		}
		// 创建一个 FREE
		this.calloc(); 
		// 链表长度 +1
		++this.length; 
	}
	// 清空链表
	clean() {
		// 清空数组 
		this.length = this.chain.length = this.FREELIST.length = 0; 
		this.POINTER = this.HEAD = this.TAIL = -1; 
		this.FREE = 0; 
	}
	// 动态分配 FREE
	calloc() {
		// FREE 指向新位置
		this.FREE = this.FREELIST.length ? this.FREELIST.pop() : this.chain.length; 
	}
	// 回收 FREE
	collection() { 
		// 把 FREE 加入到 FREELIST
		this.FREELIST.push(this.FREE); 
	}
}