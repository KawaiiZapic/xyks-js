# xyks-js
小猿口算基于代码特征识别JS注入的模拟手写实现, 无需修改源码, 不修改答案, 不伪造返回

# Usage
通过Mitm以`<script>`注入到页面中自动执行.

# 实现细节
1. 拦截答案: hook`JSON.parse`截取所有JSON, 判断是否存在题目`examVO.questions`
2. 等待开始: mask元素消失, `.mask` / `.matching`
3. 模拟手写: 针对源码实现直接注入最小事件细节
4. 等待识别: hook`CanvasRenderingContext2D.clearRect`, 调用说明识别完成被清空画布
