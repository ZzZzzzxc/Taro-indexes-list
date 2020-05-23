import Taro from "@tarojs/taro";

const ENV = Taro.getEnv();

function delay(delayTime = 500) {
  return new Promise((resolve) => {
    if ([Taro.ENV_TYPE.WEB, Taro.ENV_TYPE.SWAN].includes(ENV)) {
      setTimeout(() => {
        resolve();
      }, delayTime);
      return;
    }
    resolve();
  });
}

function delayQuerySelector(self, selectorStr, delayTime = 500) {
  const $scope = ENV === Taro.ENV_TYPE.WEB ? self : self.$scope;
  const selector = Taro.createSelectorQuery().in($scope);
  return new Promise((resolve) => {
    delay(delayTime).then(() => {
      selector
        .select(selectorStr)
        .boundingClientRect()
        .exec((res) => {
          resolve(res);
        });
    });
  });
}

export { delay, delayQuerySelector };
