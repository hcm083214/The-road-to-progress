/* 
    斐波那契数列
*/
(function () {
    // 1 1 2 3 5 8 13
    function Fibonacci(n) {
        if (n == 1 || n == 2) return 1
        if (n > 2) {
            return Fibonacci(n - 1) + Fibonacci(n - 2)
        }
    }
    console.log(Fibonacci(7))
});

/* 
    跳台阶
*/
(function () {
    /* 
        一只青蛙一次可以跳上1级台阶，也可以跳上2级。求该青蛙跳上一个 n 级的台阶总共有多少种跳法（先后次序不同算不同的结果）。
    */
    function jumpFloor(number) {
        // write code here
        // 方法一：递归方式
        let result;
        if (number == 0 || number == 1) {
            result = 1;
        } else {
            result = jumpFloor(number - 1) + jumpFloor(number - 2);
        }
        return result;
    }
    function jumpFloor(number) {
        //方法二：动态规划
        const dp = [];
        dp[0] = dp[1] = 1;
        for (let i = 2; i <= number; i++) {
            dp[i] = dp[i - 1] + dp[i - 2];
        }
        return dp[number]
    }
    function jumpFloor(number) {
        // 方法三
        // cur = pre1+pre2; 相当于 fn=fn-1 + fn-2
        let cur = pre1 = pre2 = 1;
        for (let i = 2; i <= number; i++) {
            cur = pre1 + pre2;
            //当cur+1后，pre1 就是下一个 pre2，pre2 清除用来保存 cur 也就是pre1
            pre2 = pre1;
            pre1 = cur;
        }
        return cur;
    }
    console.log(jumpFloor(3))
});

/* 
最小花费爬楼梯
*/
(function () {
    /* 
    
    描述
给定一个整数数组 cost \cost  ，其中 cost[i]\cost[i]  是从楼梯第i \i 个台阶向上爬需要支付的费用，下标从0开始。一旦你支付此费用，即可选择向上爬一个或者两个台阶。

你可以选择从下标为 0 或下标为 1 的台阶开始爬楼梯。

请你计算并返回达到楼梯顶部的最低花费。

输入：
[2,5,20]
复制
返回值：
5

  
    */
    function minCostClimbingStairs(cost) {
        // 思路：当爬到第 n 层时，要比较 n-1 层 和 n-2 层的花销，而 n-1 层的花销 = 自身层数的花销 + 爬上 n-1 层的花销
        // fn = Math.min((fn-1 + cost[n-1]),(fn-2 + cost[n-2]))
        // write code here
        const dp = [];
        dp[0] = 0;
        dp[1] = 0;
        const lens = cost.length;
        for (let i = 2; i <= lens; i++) {
            // 动态规划
            dp[i] = Math.min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2])
        }
        console.log(dp)
        return dp[lens]
    }

    minCostClimbingStairs([2, 5, 20])
});

/* 
    不同路径的数目(一)
*/
(function () {
    /* 
    描述
一个机器人在m×n大小的地图的左上角（起点）。
机器人每次可以向下或向右移动。机器人要到达地图的右下角（终点）。
可以有多少种不同的路径从起点走到终点？
    
    */
    function uniquePaths(m, n) {
        // 思路： dp[m][n]保存当前位置的方法，dp[m][n]=dp[m-1][n]+dp[m][n-1]
        // dp[0][j] = 1;  dp[i][0] = 1;
        // write code here
        const dp = [];
        for (let i = 0; i < m; i++) {
            dp[i] = [];
            if (i == 0) {
                dp[i].push(1)
            }
            for (let j = 0; j < n; j++) {
                dp[0][j] = 1;
                dp[i][0] = 1;
                if (i > 0 && j > 0) {
                    dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
                }
            }
        }
        console.log(dp)
        return dp[m - 1][n - 1];
    }
    uniquePaths(1, 2)
});

/* 矩阵的最小路径和 */
(function () {
    /* 
    描述
给定一个 n * m 的矩阵 a，从左上角开始每次只能向右或者向下走，最后到达右下角的位置，路径上所有的数字累加起来就是路径和，输出所有的路径中最小的路径和。
​
 ≤100
要求：时间复杂度 O(nm)O(nm)

例如：当输入[[1,3,5,9],[8,1,3,4],[5,0,6,1],[8,8,4,0]]时，对应的返回值为12，
    */
    function minPathSum(matrix) {
        // 思路：f(m,n)=Math.min(matrix[m-1,n]+f(m-1,n),matrix[m,n-1]+f(m,n-1))
        // write code here
        // dp 存放当前的最小累加和 
        const dp = [];
        const m = matrix.length;
        const n = matrix[0].length;
        for (let i = 0; i < m; i++) {
            dp[i] = [];
            if (i == 0) {
                dp[0][0] = matrix[0][0];
            }
            for (let j = 0; j < n; j++) {
                if (i == 0 && j > 0) {
                    dp[0][j] = dp[0][j - 1] + matrix[0][j]
                }
                if (i > 0 && j == 0) {
                    dp[i][0] = dp[i - 1][0] + matrix[i][0]
                }
                if (i > 0 && j > 0) {
                    dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1]) + matrix[i][j]
                }
            }
        }
        return dp[m - 1][n - 1]
    }
    const matrix = [[1, 3, 5, 9], [8, 1, 3, 4], [5, 0, 6, 1], [8, 8, 4, 0]];
    minPathSum(matrix)
});

/* 兑换零钱(一) */
(function () {
    /* 
    给定数组arr，arr中所有的值都为正整数且不重复。每个值代表一种面值的货币，每种面值的货币可以使用任意张，再给定一个aim，
    代表要找的钱数，求组成aim的最少货币数。
如果无解，请返回-1.
输入：
[5,2,3],20

返回值：
4
    */
    function minMoney(arr, aim) {
        // write code here
        // dp[i]用来保存兑换i元需要的最少货币数
        const dp=[];
        dp[0]=0;
        for(let i=1;i<aim;i++){
            dp[i]=i+1;
            for(let j=0;j<arr.length;j++){
                if(arr[j]<=i){
                    dp[i]=Math.min(dp[i],dp[i-arr[j]]+1);
                }
            }
        }
        return dp[aim]>aim?-1:dp[aim]
    }
    const str='A10;S20;W10;D30;X;A1A;B10A11;;A10;'
    const router = str.split(';');
    let x=0,y=0,routes;
    for(let i=0;i<router.length;i++){
        routes=router[i];
        if(routes.length !=3 || typeof Number(routes.slice(1,3)) !='number') continue;
        if(routes[0] =='A'){
            x=x-routes.slice(1,3)
        }else if(routes[0] =='S'){
            y=y-routes.slice(1,3)
        }else if(routes[0] =='D'){
            x=x+routes.slice(1,3)
        }else if(routes[0] =='D'){
            y=y+routes.slice(1,3)
        }
    }
})();