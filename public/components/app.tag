<App>
	<!-- basic template, compiled into dom at runtime -->
	<div show={(!state.authenticated)}>
		<span>Authorize access to Google Calendar API</span>
		{bar}
		<br>
		<button id="authorize-button" onclick={handleAuthClick}>Authorize</button>
	</div>
	<div show={(state.authenticated)}>
		<div hide={state.inProposalMode}>
			<h3>Date Range</h3>
			<input name="daterange">
		</div>
		<div show={state.inProposalMode} >
			start: {state.startDate.format()}
			<br>
			end: {state.endDate.format()}
		</div>

		<div hide={(state.inProposalMode && state.isOwner)}>
			<h3>Calandars <a class="btn btn-secondary btn-sm" onclick={toggleAll}>toggle</a></h3>
			<ul>
				<li each={state.calendars}>
					<input onchange={updateCalandarStatus} type="checkbox" checked={ enabled }> {title}
				</li>
			</ul>
		</div>
		<div hide={state.inProposalMode && state.isOwner} >
			<h3>Busy Times</h3>
			<ul>
				<li each={state.events.filter(isBusy)}>
					{start.dateTime} - {end.dateTime}	
				</li>
			</ul>
		</div>
		<h3>Free Times</h3>
		<form action="/" method="POST" hide={(state.inProposalMode)}>
			<input name="state" type="hidden" id="stateHolder" value={pushState()}>
			<button>send</button>
		</form>
		<form action="/delete" method="POST" show={(state.inProposalMode)}>
			<input name="key" type="hidden" id="keyHolder" value={state.proposalId}>
			<button>delete proposal</button>
		</form>
		<ul>
			<li each={state.freetimes}>
				<input show={state.isOwner} type="checkbox" name="vehicle" value="Bike">
				{start} - {end}	
			</li>
		</ul>
	</div>

	<!-- logic defining state transitions -->
	<script>
		
		self = this;
		// state is mutable and normalized
		state = {
			authenticated : false,
			calendars: [],
			calendarsIndexById:{},
			events:[],
			othersBusy:[],
			freetimes:[],
			startDate:moment(),
			endDate:moment().add(7,'d'),
			inProposalMode: window.location.pathname != "/",
		} 

		// console.log(state.inProposalMode)

		this.on('mount', function(){
			self.authorize(true);
			picker = $('input[name="daterange"]')
			picker.daterangepicker({
				start:state.startDate
			}, self.updateDateRange);
			picker.data('daterangepicker').setEndDate(state.endDate);
			checkMode();
		})


		
		// UI UTILITY FUNCTIONS

		updateDateRange(s,e) {
			state.startDate = s;
			state.endDate   = e;
			console.log('start:', s.format(),'end:',e.format())
			getAllEvents();
			calculateFree();
			self.update();
		}

		handleAuthClick(event) {
			self.authorize(false)
	        return false;
		}

		updateCalandarStatus(e){
			e.item.enabled = e.srcElement.checked
			calculateFree();
		}

		isBusy = function(event){
			index = state.calendarsIndexById[event.cId]
			return state.calendars[index].enabled
		}

		toggleAll = function(){
			console.log('toggle')
			state.calandars = state.calendars.map(function(v){
				v.enabled=!v.enabled
				return v;
			})
			self.update();
		}

		setCookie = function(cname, cvalue, exdays) {
		    var d = new Date();
		    d.setTime(d.getTime() + (exdays*24*60*60*1000));
		    var expires = "expires="+d.toUTCString();
		    document.cookie = cname + "=" + cvalue + "; " + expires;
		}

		getCookie = function(cname) {
		    var name = cname + "=";
		    var ca = document.cookie.split(';');
		    for(var i=0; i<ca.length; i++) {
		        var c = ca[i];
		        while (c.charAt(0)==' ') c = c.substring(1);
		        if (c.indexOf(name) == 0) return JSON.parse(unescape(c.substring(name.length,c.length)));
		    }
		    return "";
		}

		checkMode = function(){
			if(state.inProposalMode){
				proposalRecord = getCookie("meeting");
				state.startDate = moment(proposalRecord.startDate);
				state.endDate = moment(proposalRecord.endDate);
				state.othersBusy = proposalRecord.busy;


				state.proposalId = window.location.pathname.split("/")[2];
				state.isOwner = getCookie("calowns").key == state.proposalId;

				calculateFree();
				
				// if(state.isOwner){
					
				// }
				self.update();
			}
		}

		pushState = function(){
			return JSON.stringify({
				startDate: state.startDate,
				endDate : state.endDate,
				busy: state.events.filter(isBusy).map(formatGoogleDateRange)
			});
		}

		// save = function(){
		// 	// JSON.stringify(req.body, null, 2)

		// 	// alert(stateHolder.value);
		// 	return true;
		// }


		// API FUNCTIONS

		authorize(immediate){
			gapi.auth.authorize(
				{
					'client_id': CLIENT_ID,
					'scope': SCOPES.join(' '),
					'immediate': immediate
				},
				self.setAuthenticated
			);
		}

		setAuthenticated(res){
			state.authenticated = res && !res.error;
			if(state.authenticated){
				// console.log(res);
				gapi.client.load('calendar', 'v3',listCalendars)
				self.update();	
			}
		}

		listCalendars = function(){
		  var request = gapi.client.calendar.calendarList.list({
		    'timeMin': (new Date()).toISOString(),
		    'orderBy': 'startTime',
		    'minAccessRole': "owner"
		  });

		  request.execute(function(resp){
		  	// console.log(resp.items)
		    state.calendars = resp.items.map(function(v,i){
		    	state.calendarsIndexById[v.id] = i
		    	return {id:v.id, title: v.summary, enabled:false}
		    })
		  	self.update();
		  	getAllEvents();
		  })
		}

		getAllEvents =function(){
			state.events = []
			state.calendars.map(function(c){
				listEvents(c.id)
			})
		}

		listEvents = function(cId){
			min = state.startDate.format("YYYY-MM-DDTHH:mm:ss") + '.000Z';
			max = state.endDate.format("YYYY-MM-DDTHH:mm:ss") + '.000Z';
			var request = gapi.client.calendar.events.list({
				timeMin: min,
				timeMax: max,
				"singleEvents" : true,
				"orderBy" : "startTime",
				calendarId: cId
			});

			request.execute(function(resp){
				state.events = state.events.concat(resp.items.map(function(v){
				  return {start: v.start, end:v.end, cId:cId}
				}));
				// console.log(state.events, state.startDate, state.endDate);		
				self.update();
		  })
		}

		calculateFree = function(){
			range = {start:state.startDate.format(), end: state.endDate.format()}
			busy = state.events.filter(isBusy).map(formatGoogleDateRange);
			Array.prototype.push.apply(busy, state.othersBusy);
			state.freetimes = rangeFormat(calculateFreeTimes(range, busy));

		}
 
		formatGoogleDateRange= function(range){
			return {
				start: range.start.dateTime,
				end:   range.end.dateTime
			}
		}

	</script>

</App>