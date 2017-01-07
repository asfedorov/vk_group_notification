$(document).ready( function(){
    // console.log("hello")


    // if (VKGApp.prefs.prefs['initiated'] != true) {
    //   $(".sync").show();
    // }

    // self.port.emit('hello-test', 'emitting hello');


    self.port.on("show", function(inititated) {
        if (inititated == true) {
            $(".sync").hide();
            // console.log("initiated")
        } else {
            $(".sync").show();
            // console.log("not initiated")
        }
      // console.log(inititated);
    });

    $(".sync").click( function() {
        self.port.emit("click-sync");
    })

    self.port.on("add_line", function(obj){
        var unread = obj.count - obj.read_count
        // console.log(unread)
        var new_line = `
            <div class="msg_cont" id="`+obj.id+`">
                <div class="preview">
                    <a href="`+obj.msg_path+`" target="_blank">
                        `+obj.preview+`... --->
                    </a>
                </div>
                <div class="unread">`+unread+`</div>
                <div class="close">⛌</div>
            </div>
        `
        $(".i-cont").append(new_line)

        $("#"+obj.id).find(".close").click( function(){
            id = $(this).closest(".msg_cont").attr("id")
            $(this).closest(".msg_cont").remove()
            self.port.emit("msg_read", id)
        })
        $("#"+obj.id).find(".preview").find("a").click( function(){
            id = $(this).closest(".msg_cont").attr("id")
            $(this).closest(".msg_cont").remove()
            self.port.emit("msg_read", id)

        })
    })

    self.port.on("initiated", function(){
        $(".sync").hide();
    })

})