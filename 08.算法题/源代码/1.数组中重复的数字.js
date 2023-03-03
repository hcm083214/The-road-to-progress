/* 
 数组去重
*/
(function () {
    const nums = [2, 3, 1, 0, 2, 5, 3];
    function getResult(arr) {
        const newArr = [];
        arr.forEach(val => {
            // !newArr.includes(val) && newArr.push(val);
            newArr.indexOf(val) === -1 && newArr.push(val);
        })
        return newArr;
    }
    console.log(getResult(nums))
});
/* 
找出数组中重复的数字。

在一个长度为 n 的数组 nums 里的所有数字都在 0～n-1 的范围内。
数组中某些数字是重复的，但不知道有几个数字重复了，也不知道每个数字重复了几次。请找出数组中重复的数字。

示例 1：
输入：
[2, 3, 1, 0, 2, 5, 3]
输出：[2,3]
*/
(function () {
    const nums = [2, 3, 1, 0, 2, 5, 3];
    function getResult1(arr) {
        const newArr = [];
        const result = [];
        arr.forEach(val => {
            if (newArr.includes(val)) {
                result.push(val)
            } else {
                newArr.push(val)
            }
        });
        return result
    }
    console.log(getResult1(nums));

    function getResult2(arr) {
        const sets = new Set();
        const result = [];
        for (let i = 0; i < arr.length; i++) {
            if (sets.has(arr[i])) {
                result.push(arr[i])
            } else {
                sets.add(arr[i])
            }
        }
        return result;
    }
    console.log(getResult2(nums));

});

(function () {

    function getResult(str) {
        let num = Number(str)
        let result = [];
        for (let i = 2; i * i <= num; i++) {
            if (num % i == 0) {

                result.push(i);
                console.log(num, i)
                num = num / i;
                i = 1;
            }
            // }else if(i*i>num){
            //     result.push(num);
            // }
        }
        result.push(num)
        return result;
    }
    // console.log(getResult(180))

    let num = Number(180)
    let result = '';
    for (let i = 2; i * i <= num; i++) {
        if (num % i == 0) {
            result = result + i +' ';
            console.log(result)
            num = num / i;
            i = 1;
        }
    }
    console.log(result)

    result =result +num;
    console.log(result)
})();