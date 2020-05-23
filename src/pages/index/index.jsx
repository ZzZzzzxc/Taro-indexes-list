import Taro from "@tarojs/taro";
import { View } from "@tarojs/components";
import Indexes from "../../components/indexes/index";
import { AtSearchBar } from "taro-ui";
import "./index.scss";

const SEARCH_TXT = "搜索";
const CANCEL = "取消";

export default class Index extends Taro.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      // 列表数据副本
      _list: [],
      searchArgs: "",
      //是否聚焦搜索框
      isFocus: false,
      // 搜索按钮文案
      btnTxt: SEARCH_TXT,
    };
  }

  handleClick(item) {
    console.log(item);
  }

  handleCommit(item) {
    console.log(item);
  }

  //初始化
  initData() {
    const { list } = this.state;
    this.setState({
      _list: list,
    });
  }

  // 搜索参数修改
  onSearchArgsChange(args) {
    this.setState({
      searchArgs: args,
    });
  }

  //搜索
  handleSearch() {
    const { isFocus, searchArgs } = this.state;
    const list = [
      {
        title: "A",
        key: "A",
        items: [
          {
            name: "搜索测试",
            avatar: "https://cdn.zhangxc.cn/image/jpeg/希里.jpg",
            department: "PCG",
            position: "测试开发",
          },
        ],
      },
    ];
    if (isFocus && searchArgs != "") {
      this.setState({
        list,
      });
    } else {
      this.handleClear();
    }
  }

  // 取消搜索
  handleClear() {
    const args = "";
    const { _list } = this.state;
    console.log(_list);
    this.setState({
      searchArgs: args,
      list: _list,
    });
  }

  toggleListShow(isListShow) {
    const { _list } = this.state;
    isListShow
      ? this.setState({
          list: _list,
          isFocus: false,
          btnTxt: CANCEL,
        })
      : this.setState({
          isFocus: true,
          btnTxt: SEARCH_TXT,
        });
  }

  // 聚焦搜索框
  handleFocus() {
    this.toggleListShow(false);
  }

  // 搜索框失去焦点
  handleBlur() {
    this.toggleListShow(true);
  }

  randomItemInArray(arr) {
    const index = Math.floor(Math.random() * arr.length);
    return arr[index];
  }

  initTestData() {
    const list = [],
      menuList = [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
        "R",
        "S",
        "T",
        "U",
        "V",
        "W",
        "X",
        "Y",
        "Z",
      ],
      avaList = [
        "http://cdn.zhangxc.cn/FspqqNXUpIR07K5cE0ZmG4buVzZt",
        "http://cdn.zhangxc.cn/Fqzf9ziFSbH_NK747cz2vtLLOWGZ",
        "http://cdn.zhangxc.cn/FsSLNBGh3Abl90Vc106yKhyJMUeX",
        "http://cdn.zhangxc.cn/FrC7UIjNUWiYDr4AbTUFDVnj5udC",
        "http://cdn.zhangxc.cn/FhTFXm2hvykFFTIH9cQ7I5k5eP7w",
      ],
      nameList = ["Alex", "Vx", "Shy", "Sherry", "Yassssss", "Dscss", "GMK"],
      positionList = ["客户端研发", "测试开发", "服务端研发", "前端研发"],
      departmentList = ["PCG", "ESIG", "TEG", "CSIG"];
    menuList.forEach((item) => {
      const times = (Math.random() * 10) / 3,
        title = item,
        key = title,
        items = [];
      for (let i = 0; i < times; i++) {
        const avatar = this.randomItemInArray(avaList),
          name = `${item}_${this.randomItemInArray(
            nameList
          )}_${this.randomItemInArray(menuList)}${this.randomItemInArray(
            menuList
          )}${this.randomItemInArray(menuList)}`,
          position = `${item}_${this.randomItemInArray(
            positionList
          )}_${this.randomItemInArray(menuList)}${this.randomItemInArray(
            menuList
          )}${this.randomItemInArray(menuList)}`,
          department = `${item}_${this.randomItemInArray(
            departmentList
          )}_${this.randomItemInArray(menuList)}${this.randomItemInArray(
            menuList
          )}${this.randomItemInArray(menuList)}`;
        items.push({ avatar, name, position, department });
      }
      list.push({ title, key, items });
    });
    this.setState({ list },()=>{
      this.initData()
    });
  }

  componentDidMount() {
    this.initTestData();
  }

  render() {
    const { list, searchArgs, btnTxt } = this.state;
    return (
      <View style="height:100vh">
        <Indexes
          list={list}
          animation={true}
          isCommit={true}
          onClick={this.handleClick}
          onCommit={this.handleCommit}
        >
          <View cl assName="custom-area">
            <AtSearchBar
              value={searchArgs}
              showActionButton={false}
              onChange={this.onSearchArgsChange.bind(this)}
              onActionClick={this.handleSearch.bind(this)}
              onClear={this.handleClear.bind(this)}
              onFocus={this.handleFocus.bind(this)}
              onBlur={this.handleBlur.bind(this)}
              actionName={btnTxt}
            />
          </View>
        </Indexes>
      </View>
    );
  }
}
