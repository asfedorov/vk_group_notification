VKGApp = {}
// var buttons = require('sdk/ui/button/action');
var buttons = require('sdk/ui/button/toggle');
var sdkPanels = require("sdk/panel");
var self = require("sdk/self");
var tabs = require("sdk/tabs");
var { setInterval, clearInterval } = require("sdk/timers");
var prefs = require('sdk/simple-prefs').prefs;
var Request = require("sdk/request").Request;
var ss = require("sdk/simple-storage");


var button = buttons.ToggleButton({
  id: "vk-group-listener",
  label: "Vk Group Notifications",
  icon: {
    "16": "./icon-16.png",
    "32": "./icon-32.png",
    "64": "./icon-64.png"
  },
  // onClick: handleClick,
  onChange: handleChange,
  badge: 0,
  badgeColor: "rgba(255, 255, 255, 0)"
});

// function handleClick(state) {
//   // tabs.open("http://recordmeon.ru/");
//   console.log("button '" + state.label + "' was clicked");
//   button.badge = state.badge + 1;
//   button.badgeColor = "#AA00AA";
// }

var myPanel = sdkPanels.Panel({
  contentURL: self.data.url("panel.html"),
  contentScriptFile: [
    self.data.url("jquery-3.1.1.min.js"),
    self.data.url("panel.js")
  ],
  onHide: handleHide
});


myPanel.on("show", function() {
  myPanel.port.emit("show", prefs["initiated"]);
});
// myPanel.port.emit("Initiated",)

myPanel.port.on("msg_read", function(id) {
  ss.storage.vk_dict[id].read_count = ss.storage.vk_dict[id].count;
})

myPanel.port.on("click-sync", function() {
  // console.log("syncing");

  if (prefs.initiated != true){
    // console.log("1")
    if (prefs.groupName != ""){
      // console.log("2")
      ss.storage.vk_dict = {}
      initiateFill(0, 100);
      prefs.initiated = true;
      myPanel.port.emit("initiated")
      VKGApp.myInterval = setInterval(function() {
        // button.badge = button.badge + 1
        // button.badgeColor = "#AA00AA";
        checkUnread(0, 100);
      // }, 1000*30)
      }, 1000*60*prefs.updateTime)
    }
  }
});

function initiateFill(offset, count){
  url = "https://api.vk.com/method/wall.get?domain="+prefs.groupName+"&extended=1&count="+count+"&offset="+(offset*100)
  var initialVKRequest = Request({
    url: url,
    onComplete: function (response) {
      // console.log("whee")
      // console.log(offset)
      // console.log(count)
      var vk_arr = response.json.response.wall
      VKGApp.count_messages = vk_arr[0]
      // send_flag = true
      vk_arr.forEach( function(item, i, vk_arr){
        if(typeof item === 'object'){
          ss.storage.vk_dict[item.id] = {
            msg_path: "https://vk.com/"+prefs.groupName+"?w=wall"+item.from_id+"_"+item.id,
            count: item.comments.count,
            read_count: item.comments.count,
            preview: item.text.substring(0,60),
            id: item.id,
          }

          // if (send_flag){
          //   myPanel.port.emit("add_line", ss.storage.vk_dict[item.id])
          //   send_flag = false;
          // }
        }
      })
      // console.log(VKGApp.count_messages)
      // console.log(VKGApp.count_messages / (count * (1 + offset)))
      if( VKGApp.count_messages / (count * (1 + offset)) > 1 ){
        initiateFill(offset + 1, count);
      }
    }
  }).get();
}

function checkUnread(offset, count){
  url = "https://api.vk.com/method/wall.get?domain="+prefs.groupName+"&extended=1&count="+count+"&offset="+(offset*100)
  var initialVKRequest = Request({
    url: url,
    onComplete: function (response) {
      // console.log("whee")
      // console.log(offset)
      // console.log(count)
      var vk_arr = response.json.response.wall
      VKGApp.count_messages = vk_arr[0]
      vk_arr.forEach( function(item, i, vk_arr){
        send_flag = false
        if(typeof item === 'object'){
          if (item.id in ss.storage.vk_dict){
            if (item.comments.count > ss.storage.vk_dict[item.id].count){
              send_flag = true;
              ss.storage.vk_dict[item.id].count = item.comments.count;
              button.badge = button.badge + ss.storage.vk_dict[item.id].count - ss.storage.vk_dict[item.id].read_count
              button.badgeColor = "#AA00AA";
            }
          } else {
            if (item.comments.count > 0){
              send_flag = true;
              button.badge = button.badge + item.comments.count
              button.badgeColor = "#AA00AA";
            }
            ss.storage.vk_dict[item.id] = {
              msg_path: "https://vk.com/"+prefs.groupName+"?w=wall"+item.from_id+"_"+item.id,
              count: item.comments.count,
              read_count: 0,
              preview: item.text.substring(0,60),
              id: item.id,
            }
          }

          if (send_flag){
            myPanel.port.emit("add_line", ss.storage.vk_dict[item.id])
            send_flag = false;
          }
        }
      })
      // console.log(VKGApp.count_messages)
      // console.log(VKGApp.count_messages / (count * (1 + offset)))
      if( VKGApp.count_messages / (count * (1 + offset)) > 1 ){
        checkUnread(offset + 1, count);
      }
    }
  }).get();
}

function handleChange(state) {
  if (state.checked) {
    myPanel.show({
      position: button
    });
    // clearInterval(VKGApp.myInterval)
    button.badge = 0
    button.badgeColor = "rgba(255, 255, 255, 0)"
  }
}

function handleHide() {
  button.state('window', {checked: false});
  // VKGApp.myInterval = setInterval(function() {
  //     button.badge = button.badge + 1
  //     button.badgeColor = "#AA00AA";
  //   }, 1000)
}


// VKGApp.myInterval = setInterval(function() {
//   button.badge = button.badge + 1
//   button.badgeColor = "#AA00AA";
// }, 1000)