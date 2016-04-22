
    function Request(client) {
        this.client = client
        this.k = 0
        this.waiting_start = 0
        this.waiting_time = 0
        this.collided = false
        this.retransmitted = false
        this.failed = false
        this.id = Request.current_id++
        
        this.getContent = function() {
          return '<div class="request">'
            +  '<div>' + 'Packet ID - ' + this.id + '</div>'
            +  '<div>' + 'Client - ' + (this.client + 1) + '</div>'
            +  '<div>' +  'Attempt - ' + (this.k + 1) + '</div>'
            +'</div>'
        }
    }

    Request.current_id = 1

    function Network() {
        this.clients = []
        this.elapsed_frame_time = 0
        this.current_requests = []
        this.queued_requests = []
        
        this.attempt_broadcast = function(request) {
            this.current_requests.push(request)
        }
        
        this.scour_pending_requests = function() {
            for (var j = 0; j < this.queued_requests.length; j++) {
              var i = this.queued_requests[j]
              console.log('Scour: ' + this.elapsed_frame_time + ' - ' + i.waiting_start + ' = ' + i.waiting_time)
                if (this.elapsed_frame_time - i.waiting_start == i.waiting_time) {
                    i.retransmitted = true
                    this.current_requests.push(i)
                    var index = this.queued_requests.indexOf(i);
                    if (index > -1) {
                      this.queued_requests.splice(index, 1)
                    }
                    console.log('trying to retransmit')
                }
            }
        }
        
        this.tick = function() {
            this.scour_pending_requests()
            var temp = this.current_requests
            if (this.current_requests.length == 1) {
                this.current_requests[0].collided = false
                console.log('transmitted successfully')
            } else if (this.current_requests.length > 1) {
                for (var j = 0; j < this.current_requests.length; j++) {
                    var i = this.current_requests[j]
                    if (i.k == 8) {
                        console.log('Failed permanently')
                        alert('Transmission of packet ' + i.id + ' failed permanently')
                        i.failed = true
                        this.current_requests.remove(i)
                    } else {
                        i.k += 1
                        console.log('collision occured')
                        i.collided = true
                        i.waiting_start = this.elapsed_frame_time
                        i.waiting_time = Math.floor((Math.random() * Math.pow(2, i.k - 1)) + 1);
                        console.log(i.waiting_time)
                    }
                }
                this.queued_requests.push.apply(this.queued_requests, this.current_requests)
            }
            this.elapsed_frame_time += 1
            
            this.current_requests = []
            return temp
        }
    }
