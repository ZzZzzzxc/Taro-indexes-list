import classNames from "classnames";
import PropTypes from "prop-types";
import { ScrollView, View } from "@tarojs/components";
import Taro, { Component } from "@tarojs/taro";
import { delay, delayQuerySelector } from "./utils";
import { AtToast } from "taro-ui";
import { ButtonItem } from "../button/index";
import { postcss } from '../../utils/style'
import "./index.scss";

const ENV = Taro.getEnv();

export default class Indexes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // 滚动目标id
      _scrollIntoView: "",
      // 兼容H5使用
      _scrollTop: 0,
      // 提示文本
      _tipText: "",
      // 是否显示提示框
      _isShowToast: false,
      // 判断是否为H5环境
      isWEB: Taro.getEnv() === Taro.ENV_TYPE.WEB,
      // props.list 副本
      _list: [],
    };
    // 右侧导航高度
    this.menuHeight = 0;
    // 右侧导航距离顶部高度
    this.startTop = 0;
    // 右侧导航元素高度
    this.itemHeight = 0;
    // 当前索引
    this.currentIndex = -1;
    // 列表id
    this.listId = `indexes-list-${new Date()}`;
    // 计时器
    this.timeoutTimer = undefined;
  }

  // 列表项点击事件
  handleClick = (item, index, childIndex) => {
    // 若列表需要提交
    if (this.props.isCommit) {
      // 标记选择项
      this.toggleSelect(index, childIndex);
    }
    this.props.onClick && this.props.onClick(item);
  };

  // 开始滑动
  handleTouchMove = (event) => {
    event.stopPropagation();
    event.preventDefault();

    const { list } = this.props;
    const pageY = event.touches[0].pageY;
    const index = Math.floor((pageY - this.startTop) / this.itemHeight);

    if (index >= 0 && index <= list.length && this.currentIndex !== index) {
      this.currentIndex = index;
      const key = index > 0 ? list[index - 1].key : "top";
      const touchView = `indexes__list-${key}`;
      this.jumpTarget(touchView, index);
    }
  };

  // 滑动结束
  handleTouchEnd = () => {
    this.currentIndex = -1;
  };

  // 根据索引进行跳转
  jumpTarget(_scrollIntoView, idx) {
    const { topKey, list } = this.props;
    const _tipText = idx === 0 ? topKey : list[idx - 1].key;

    if (ENV === Taro.ENV_TYPE.WEB) {
      delayQuerySelector(this, ".indexes", 0).then((rect) => {
        const targetOffsetTop = this.listRef.childNodes[idx].offsetTop;
        const _scrollTop = targetOffsetTop - rect[0].top;
        this.updateState({
          _scrollTop,
          _scrollIntoView,
          _tipText,
        });
      });
      return;
    }

    this.updateState({
      _scrollIntoView,
      _tipText,
    });
  }

  // __jumpTarget(key) {
  //   const { list } = this.props;
  //   const index = list.findIndex((item) => item.key === key);
  //   const targetView = `indexes__list-${key}`;
  //   this.jumpTarget(targetView, index + 1);
  // }

  // 更新状态
  updateState(state) {
    const { isShowToast, isVibrate } = this.props;
    const { _scrollIntoView, _tipText, _scrollTop } = state;
    this.setState(
      {
        _scrollIntoView: _scrollIntoView,
        _tipText: _tipText,
        _scrollTop: _scrollTop,
        _isShowToast: isShowToast,
      },
      () => {
        clearTimeout(this.timeoutTimer);
        this.timeoutTimer = setTimeout(() => {
          this.setState({
            _tipText: "",
            _isShowToast: false,
          });
        }, 3000);
      }
    );

    // 微信小程序震动
    if (isVibrate) {
      Taro.vibrateShort();
    }
  }

  // 初始化
  initData() {
    // 需要推入微任务队列，确保父组件取消搜索后的列表数据更新完成
    delay().then(() => {
      const { list } = this.props;
      this.setState({
        _list: list,
      });
    });
    delayQuerySelector(this, ".indexes__menu").then((rect) => {
      const len = this.props.list.length;
      this.menuHeight = rect[0].height;
      this.startTop = rect[0].top;
      this.itemHeight = Math.floor(this.menuHeight / (len + 1));
    });
  }

  // 滚动中
  handleScroll(e) {
    if (e && e.detail) {
      this.setState({
        _scrollTop: e.detail.scrollTop,
      });
    }
  }

  // 选择or取消当前项目
  toggleSelect(index, childIndex) {
    const { _list } = this.state;
    const data = [..._list];
    const isSelect = data[index].items[childIndex].isSelect ? false : true;
    data[index].items[childIndex] = {
      ...data[index].items[childIndex],
      isSelect: isSelect,
    };
    this.setState({ _list: data });
  }

  //获取已选择项目列表
  getSelectList() {
    const res = [];
    const { _list } = this.state;
    for (let i = 0; i < _list.length; i++) {
      for (let j = 0; j < _list[i].items.length; j++) {
        let tmp = _list[i].items[j];
        if (tmp.isSelect) {
          res.push(tmp);
        }
      }
    }
    return res;
  }

  // 提交
  handleCommit() {
    const res = this.getSelectList();
    return this.props.onCommit && this.props.onCommit(res);
  }

  componentWillReceiveProps(nextProps) {
    // 当列表长度改变时，重新初始化
    if (nextProps.list.length !== this.props.list.length) {
      this.initData();
    }
  }

  componentDidMount() {
    // 兼容H5
    if (ENV === Taro.ENV_TYPE.WEB) {
      this.listRef = document.getElementById(this.listId);
    }
    this.initData();
  }

  // componentWillMount() {
  //   this.props.onScrollIntoView &&
  //     this.props.onScrollIntoView(this.__jumpTarget.bind(this));
  // }

  render() {
    const {
      className,
      customStyle,
      animation,
      topKey,
      list,
      isCommit,
    } = this.props;
    const {
      _scrollTop,
      _scrollIntoView,
      _tipText,
      _isShowToast,
      _list,
      isWEB,
    } = this.state;

    const toastStyle = { minWidth: Taro.pxTransform(100) };
    const rootCls = classNames("indexes", className);
    const commitBtnStyle = {
      height: Taro.pxTransform(118),
    };

    // 索引
    const menuList = list.map((dataList, index) => {
      const { key } = dataList;
      const targetView = `indexes__list-${key}`;
      return (
        <View
          className={[
            this.currentIndex === index + 1
              ? "indexes__menu-item-active"
              : "indexes__menu-item",
          ]}
          key={key}
          onClick={this.jumpTarget.bind(this, targetView, index + 1)}
        >
          {key}
        </View>
      );
    });

    // 列表
    const indexesList = list.map((dataList, index) => (
      <View
        id={`indexes__list-${dataList.key}`}
        className="indexes__list"
        key={dataList.key}
      >
        <View className="indexes__list-title">{dataList.title}</View>
        <View>
          {dataList.items &&
            dataList.items.map((item, childIndex) => (
              <View
                onClick={this.handleClick.bind(this, item, index, childIndex)}
                key={item.name}
                className="indexes__list-item"
              >
                {isCommit ? (
                  <View
                    className={[
                      _list[index] &&
                      _list[index].items[childIndex].isSelect
                        ? "indexes__list-item__selector__active"
                        : "indexes__list-item__selector",
                    ]}
                  ></View>
                ) : null}
                <Image
                  src={item.avatar}
                  className="indexes__list-item__avatar"
                />
                <View className="indexes__list-item__content">
                  <Text className="indexes__list-item__content-title">
                    {item.name}
                  </Text>
                  <View className="indexes__list-item__content-subtitle">
                    <Text>{item.position}</Text>
                    <Text> | </Text>
                    <Text>{item.department}</Text>
                  </View>
                </View>
              </View>
            ))}
        </View>
      </View>
    ));

    return (
      <View className={rootCls} style={customStyle}>
        <AtToast
          customStyle={toastStyle}
          isOpened={_isShowToast}
          text={_tipText}
          duration={2000}
        />
        <View
          className="indexes__menu"
          onTouchMove={this.handleTouchMove}
          onTouchEnd={this.handleTouchEnd}
        >
          <View
            className="indexes__menu-item"
            onClick={this.jumpTarget.bind(this, "indexes__top", 0)}
          >
            {topKey}
          </View>
          {menuList}
        </View>
        <ScrollView
          className="indexes__body"
          id={this.listId}
          scrollY
          scrollWithAnimation={animation}
          scrollTop={isWEB ? _scrollTop : undefined}
          scrollIntoView={isWEB ? "" : _scrollIntoView}
          onScroll={this.handleScroll.bind(this)}
        >
          <View className="indexes__content" id="indexes__top">
            {this.props.children}
          </View>
          {indexesList}
          
        </ScrollView>
        {isCommit ? (
            <View className="indexes__commit">
              <ButtonItem
                type="primary"
                text="提交"
                onClick={this.handleCommit.bind(this)}
                compStyle={commitBtnStyle}
              />
            </View>
          ) : null}
      </View>
    );
  }
}

Indexes.propTypes = {
  customStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  className: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  animation: PropTypes.bool,
  isVibrate: PropTypes.bool,
  isShowToast: PropTypes.bool,
  topKey: PropTypes.string,
  list: PropTypes.array,
  onClick: PropTypes.func,
  // onScrollIntoView: PropTypes.func,
};

Indexes.defaultProps = {
  customStyle: "",
  className: "",
  animation: false,
  topKey: "Top",
  isVibrate: true,
  isShowToast: true,
  list: [],
  onClick: () => {},
  isCommit: false,
  // onScrollIntoView: () => {},
};
