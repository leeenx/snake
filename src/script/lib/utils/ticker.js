/*
	author: leeenx
	@ ticker 对象
	@ 提供 5 个API如下：
	@ ticker.addEventListener
	@ ticker.removeEventListener
	@ ticker.pause - 暂停
	@ ticker.resume - 恢复
	@ ticker.paused - 暂停状态
	@ 这里直接借用 GSAP.TweenMax.ticker
*/

let ticker = {}; 
ticker.paused = 0; 
ticker.pause = () => ticker.paused = 1, TweenMax.pauseAll(); 
ticker.resume = () => ticker.paused = 0, TweenMax.resumeAll(); 
ticker.addEventListener = (...args) => TweenMax.ticker.addEventListener(...args);
ticker.removeEventListener = (...args) => TweenMax.ticker.removeEventListener(...args);

TweenMax.ticker.addEventListener("tick", () => {
	ticker.elapsedMS = TweenMax.ticker.time - TweenMax.ticker._time; 
	TweenMax.ticker._time = TweenMax.ticker.time; 
})

export default ticker; 